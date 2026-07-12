from flask import Blueprint, request, jsonify, g
from server.middleware.rbac import roles_required
from server.middleware.auth import token_required
from models import Expense, Vehicle, Trip
from server.utils.validators import validate_expense_data, validate_fuel_log_data
from datetime import datetime

# Create blueprint
expenses_bp = Blueprint('expenses', __name__)


@expenses_bp.route('', methods=['GET'])
@expenses_bp.route('/', methods=['GET'])
@token_required
def get_expenses():
    """Get all expenses with optional filtering."""
    # Get query parameters for filtering
    vehicle_id = request.args.get('vehicle_id', type=int)
    trip_id = request.args.get('trip_id', type=int)
    category = request.args.get('category')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Build query
    query = Expense.query

    # Apply filters
    if vehicle_id:
        query = query.filter(Expense.vehicle_id == vehicle_id)
    if trip_id:
        query = query.filter(Expense.trip_id == trip_id)
    if category:
        query = query.filter(Expense.category == category)

    # Join with vehicle and trip to get additional info
    query = query.outerjoin(Vehicle).outerjoin(Trip)

    # paginate results
    paginated = query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    expenses = []
    for expense in paginated.items:
        expense_data = {
            'id': expense.id,
            'vehicle_id': expense.vehicle_id,
            'trip_id': expense.trip_id,
            'category': expense.category,
            'description': expense.description,
            'amount': expense.amount,
            'date': expense.date.isoformat() if expense.date else None,
            'created_at': expense.created_at.isoformat() if expense.created_at else None
        }

        # Add vehicle info if available
        if expense.vehicle_id:
            vehicle = Vehicle.query.get(expense.vehicle_id)
            if vehicle:
                expense_data['vehicle'] = {
                    'id': vehicle.id,
                    'registration_number': vehicle.registration_number,
                    'name_model': vehicle.name_model
                }

        # Add trip info if available
        if expense.trip_id:
            trip = Trip.query.get(expense.trip_id)
            if trip:
                expense_data['trip'] = {
                    'id': trip.id,
                    'source': trip.source,
                    'destination': trip.destination,
                    'status': trip.status
                }

        expenses.append(expense_data)

    return jsonify({
        'expenses': expenses,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev
        }
    }), 200


@expenses_bp.route('/<int:expense_id>', methods=['GET'])
@token_required
def get_expense(expense_id):
    """Get a specific expense by ID."""
    expense = Expense.query.get_or_404(expense_id)

    expense_data = {
        'id': expense.id,
        'vehicle_id': expense.vehicle_id,
        'trip_id': expense.trip_id,
        'category': expense.category,
        'description': expense.description,
        'amount': expense.amount,
        'date': expense.date.isoformat() if expense.date else None,
        'created_at': expense.created_at.isoformat() if expense.created_at else None
    }

    # Add vehicle info if available
    if expense.vehicle_id:
        vehicle = Vehicle.query.get(expense.vehicle_id)
        if vehicle:
            expense_data['vehicle'] = {
                'id': vehicle.id,
                'registration_number': vehicle.registration_number,
                'name_model': vehicle.name_model,
                'type': vehicle.type,
                'status': vehicle.status
            }

    # Add trip info if available
    if expense.trip_id:
        trip = Trip.query.get(expense.trip_id)
        if trip:
            expense_data['trip'] = {
                'id': trip.id,
                'source': trip.source,
                'destination': trip.destination,
                'status': trip.status
            }

    return jsonify(expense_data), 200


@expenses_bp.route('/fuel', methods=['POST'])
@expenses_bp.route('/fuel/', methods=['POST'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def add_fuel_log():
    """Add a fuel log entry (convenience endpoint)."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate required fields for fuel log
    required_fields = ['vehicle_id', 'liters', 'cost', 'date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    # Validate fuel log data
    from ..utils.validators import validate_fuel_log_data
    is_valid, errors = validate_fuel_log_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if vehicle exists
    vehicle = Vehicle.query.get(data['vehicle_id'])
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    try:
        # Create expense record for fuel
        expense = Expense(
            vehicle_id=data['vehicle_id'],
            trip_id=data.get('trip_id'),
            category='Fuel',
            description=f'Fuel purchase: {data["liters"]} liters',
            amount=float(data['cost']),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date()
        )

        # Also create a fuel log record for detailed tracking
        from models import FuelLog
        odometer = float(data['odometer_reading']) if data.get('odometer_reading') is not None else None
        fuel_log = FuelLog(
            vehicle_id=data['vehicle_id'],
            trip_id=data.get('trip_id'),
            liters=float(data['liters']),
            cost=float(data['cost']),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            odometer_reading=odometer
        )

        # Save to database
        from models import db
        db.session.add(expense)
        if fuel_log:
            db.session.add(fuel_log)
        db.session.commit()

        result = {
            'message': 'Fuel log added successfully',
            'expense': {
                'id': expense.id,
                'vehicle_id': expense.vehicle_id,
                'trip_id': expense.trip_id,
                'category': expense.category,
                'description': expense.description,
                'amount': expense.amount,
                'date': expense.date.isoformat()
            }
        }

        if fuel_log:
            result['fuel_log'] = {
                'id': fuel_log.id,
                'vehicle_id': fuel_log.vehicle_id,
                'trip_id': fuel_log.trip_id,
                'liters': fuel_log.liters,
                'cost': fuel_log.cost,
                'date': fuel_log.date.isoformat(),
                'odometer_reading': fuel_log.odometer_reading
            }

        return jsonify(result), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to add fuel log', 'error': str(e)}), 500


@expenses_bp.route('/other', methods=['POST'])
@expenses_bp.route('/other/', methods=['POST'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def add_other_expense():
    """Add a general expense entry."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_expense_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if vehicle exists
    vehicle = Vehicle.query.get(data['vehicle_id'])
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    try:
        # Create expense record
        expense = Expense(
            vehicle_id=data['vehicle_id'],
            trip_id=data.get('trip_id'),
            category=data['category'],
            description=data.get('description'),
            amount=float(data['amount']),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date()
        )

        # Save to database
        from models import db
        db.session.add(expense)
        db.session.commit()

        return jsonify({
            'message': 'Expense added successfully',
            'expense': {
                'id': expense.id,
                'vehicle_id': expense.vehicle_id,
                'trip_id': expense.trip_id,
                'category': expense.category,
                'description': expense.description,
                'amount': expense.amount,
                'date': expense.date.isoformat()
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to add expense', 'error': str(e)}), 500


@expenses_bp.route('/vehicle/<int:vehicle_id>/total', methods=['GET'])
@expenses_bp.route('/vehicle/<int:vehicle_id>/total/', methods=['GET'])
@token_required
def get_vehicle_expense_total(vehicle_id):
    """Get total expenses for a specific vehicle."""
    from sqlalchemy import func

    # Check if vehicle exists
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    # Get date range if provided
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Build query
    query = Expense.query.filter_by(vehicle_id=vehicle_id)

    # Apply date filters if provided
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Expense.date >= start_date_obj)
        except ValueError:
            return jsonify({'message': 'Invalid start_date format. Use YYYY-MM-DD'}), 400

    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Expense.date <= end_date_obj)
        except ValueError:
            return jsonify({'message': 'Invalid end_date format. Use YYYY-MM-DD'}), 400

    # Calculate totals
    total_expenses = query.with_entities(func.sum(Expense.amount)).scalar() or 0
    expense_count = query.count()

    # Get breakdown by category
    category_breakdown = query.with_entities(
        Expense.category,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).group_by(Expense.category).all()

    breakdown = {}
    for category, total, count in category_breakdown:
        breakdown[category] = {
            'total': float(total),
            'count': count
        }

    return jsonify({
        'vehicle_id': vehicle_id,
        'vehicle_registration_number': vehicle.registration_number,
        'period': {
            'start_date': start_date,
            'end_date': end_date
        },
        'total_expenses': float(total_expenses),
        'expense_count': expense_count,
        'category_breakdown': breakdown
    }), 200


@expenses_bp.route('/<int:expense_id>', methods=['PUT'])
@expenses_bp.route('/<int:expense_id>/', methods=['PUT'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def update_expense(expense_id):
    """Update an existing expense."""
    expense = Expense.query.get_or_404(expense_id)
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_expense_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if vehicle exists
    vehicle = Vehicle.query.get(data['vehicle_id'])
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    # Check if trip exists (if provided)
    if data.get('trip_id'):
        trip = Trip.query.get(data['trip_id'])
        if not trip:
            return jsonify({'message': 'Trip not found'}), 404

    try:
        # Update expense fields
        if 'vehicle_id' in data:
            expense.vehicle_id = data['vehicle_id']
        if 'trip_id' in data:
            expense.trip_id = data['trip_id']
        if 'category' in data:
            expense.category = data['category']
        if 'description' in data:
            expense.description = data['description']
        if 'amount' in data:
            expense.amount = float(data['amount'])
        if 'date' in data:
            expense.date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'Expense updated successfully',
            'expense': {
                'id': expense.id,
                'vehicle_id': expense.vehicle_id,
                'trip_id': expense.trip_id,
                'category': expense.category,
                'description': expense.description,
                'amount': expense.amount,
                'date': expense.date.isoformat()
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update expense', 'error': str(e)}), 500


@expenses_bp.route('/<int:expense_id>', methods=['DELETE'])
@expenses_bp.route('/<int:expense_id>/', methods=['DELETE'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def delete_expense(expense_id):
    """Delete an expense."""
    expense = Expense.query.get_or_404(expense_id)

    try:
        from models import db
        db.session.delete(expense)
        db.session.commit()

        return jsonify({'message': 'Expense deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete expense', 'error': str(e)}), 500