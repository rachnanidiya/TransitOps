from flask import Blueprint, request, jsonify, g
from server.middleware.rbac import roles_required
from server.middleware.auth import token_required
from models import Vehicle
from server.utils.validators import validate_vehicle_data
from datetime import datetime

# Create blueprint
vehicles_bp = Blueprint('vehicles', __name__)


@vehicles_bp.route('', methods=['GET'])
@vehicles_bp.route('/', methods=['GET'])
@token_required
def get_vehicles():
    """Get all vehicles with optional filtering."""
    # Get query parameters for filtering
    vehicle_type = request.args.get('type')
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Build query
    query = Vehicle.query

    # Apply filters
    if vehicle_type:
        query = query.filter(Vehicle.type == vehicle_type)
    if status:
        query = query.filter(Vehicle.status == status)

    # paginate results
    paginated = query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    vehicles = []
    for vehicle in paginated.items:
        vehicles.append({
            'id': vehicle.id,
            'registration_number': vehicle.registration_number,
            'name_model': vehicle.name_model,
            'type': vehicle.type,
            'max_load_capacity': vehicle.max_load_capacity,
            'odometer': vehicle.odometer,
            'acquisition_cost': vehicle.acquisition_cost,
            'status': vehicle.status,
            'created_at': vehicle.created_at.isoformat() if vehicle.created_at else None
        })

    return jsonify({
        'vehicles': vehicles,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev
        }
    }), 200


@vehicles_bp.route('/<int:vehicle_id>', methods=['GET'])
@token_required
def get_vehicle(vehicle_id):
    """Get a specific vehicle by ID."""
    vehicle = Vehicle.query.get_or_404(vehicle_id)

    return jsonify({
        'id': vehicle.id,
        'registration_number': vehicle.registration_number,
        'name_model': vehicle.name_model,
        'type': vehicle.type,
        'max_load_capacity': vehicle.max_load_capacity,
        'odometer': vehicle.odometer,
        'acquisition_cost': vehicle.acquisition_cost,
        'status': vehicle.status,
        'created_at': vehicle.created_at.isoformat() if vehicle.created_at else None
    }), 200


@vehicles_bp.route('', methods=['POST'])
@vehicles_bp.route('/', methods=['POST'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def create_vehicle():
    """Create a new vehicle."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_vehicle_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if registration number already exists
    existing_vehicle = Vehicle.query.filter_by(registration_number=data['registration_number']).first()
    if existing_vehicle:
        return jsonify({'message': 'Vehicle with this registration number already exists'}), 409

    try:
        # Create new vehicle
        vehicle = Vehicle(
            registration_number=data['registration_number'],
            name_model=data['name_model'],
            type=data['type'],
            max_load_capacity=float(data['max_load_capacity']),
            odometer=float(data.get('odometer', 0)),
            acquisition_cost=float(data.get('acquisition_cost', 0)),
            status=data.get('status', 'Available')
        )

        # Save to database
        from models import db
        db.session.add(vehicle)
        db.session.commit()

        return jsonify({
            'message': 'Vehicle created successfully',
            'vehicle': {
                'id': vehicle.id,
                'registration_number': vehicle.registration_number,
                'name_model': vehicle.name_model,
                'type': vehicle.type,
                'max_load_capacity': vehicle.max_load_capacity,
                'odometer': vehicle.odometer,
                'acquisition_cost': vehicle.acquisition_cost,
                'status': vehicle.status,
                'created_at': vehicle.created_at.isoformat() if vehicle.created_at else None
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create vehicle', 'error': str(e)}), 500


@vehicles_bp.route('/<int:vehicle_id>', methods=['PUT'])
@vehicles_bp.route('/<int:vehicle_id>/', methods=['PUT'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def update_vehicle(vehicle_id):
    """Update an existing vehicle."""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_vehicle_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if registration number already exists (excluding current vehicle)
    if 'registration_number' in data:
        existing_vehicle = Vehicle.query.filter_by(
            registration_number=data['registration_number']
        ).filter(Vehicle.id != vehicle_id).first()
        if existing_vehicle:
            return jsonify({'message': 'Vehicle with this registration number already exists'}), 409

    try:
        # Update vehicle fields
        if 'registration_number' in data:
            vehicle.registration_number = data['registration_number']
        if 'name_model' in data:
            vehicle.name_model = data['name_model']
        if 'type' in data:
            vehicle.type = data['type']
        if 'max_load_capacity' in data:
            vehicle.max_load_capacity = float(data['max_load_capacity'])
        if 'odometer' in data:
            vehicle.odometer = float(data['odometer'])
        if 'acquisition_cost' in data:
            vehicle.acquisition_cost = float(data['acquisition_cost'])
        if 'status' in data:
            vehicle.status = data['status']

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'Vehicle updated successfully',
            'vehicle': {
                'id': vehicle.id,
                'registration_number': vehicle.registration_number,
                'name_model': vehicle.name_model,
                'type': vehicle.type,
                'max_load_capacity': vehicle.max_load_capacity,
                'odometer': vehicle.odometer,
                'acquisition_cost': vehicle.acquisition_cost,
                'status': vehicle.status,
                'created_at': vehicle.created_at.isoformat() if vehicle.created_at else None
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update vehicle', 'error': str(e)}), 500


@vehicles_bp.route('/<int:vehicle_id>', methods=['DELETE'])
@vehicles_bp.route('/<int:vehicle_id>/', methods=['DELETE'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def delete_vehicle(vehicle_id):
    """Delete a vehicle (soft delete by setting status to Retired)."""
    vehicle = Vehicle.query.get_or_404(vehicle_id)

    try:
        # Soft delete - set status to Retired instead of actually deleting
        vehicle.status = 'Retired'
        from models import db
        db.session.commit()

        return jsonify({'message': 'Vehicle retired successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to retire vehicle', 'error': str(e)}), 500


@vehicles_bp.route('/<int:vehicle_id>/stats', methods=['GET'])
@token_required
def get_vehicle_stats(vehicle_id):
    """Get statistics for a specific vehicle."""
    vehicle = Vehicle.query.get_or_404(vehicle_id)

    # Calculate some basic stats (in a real app, you might have more complex calculations)
    from models import db, Trip, FuelLog, Expense
    from sqlalchemy import func

    # Count trips
    total_trips = Trip.query.filter_by(vehicle_id=vehicle_id).count()
    completed_trips = Trip.query.filter_by(vehicle_id=vehicle_id, status='Completed').count()

    # Total fuel consumed
    total_fuel = db.session.query(func.sum(FuelLog.liters)).filter_by(vehicle_id=vehicle_id).scalar() or 0

    # Total expenses
    total_expenses = db.session.query(func.sum(Expense.amount)).filter_by(vehicle_id=vehicle_id).scalar() or 0

    # Total revenue
    total_revenue = db.session.query(func.sum(Trip.revenue)).filter_by(vehicle_id=vehicle_id).scalar() or 0

    return jsonify({
        'vehicle_id': vehicle.id,
        'registration_number': vehicle.registration_number,
        'stats': {
            'total_trips': total_trips,
            'completed_trips': completed_trips,
            'total_fuel_liters': float(total_fuel),
            'total_expenses': float(total_expenses),
            'total_revenue': float(total_revenue),
            'profit_loss': float(total_revenue - total_expenses)
        }
    }), 200