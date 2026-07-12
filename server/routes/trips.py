from flask import Blueprint, request, jsonify, g
from server.middleware.rbac import roles_required
from server.middleware.auth import token_required
from models import Trip, Vehicle, Driver
from server.utils.validators import validate_trip_data, validate_trip_business_rules
from datetime import datetime
import json

# Create blueprint
trips_bp = Blueprint('trips', __name__)


@trips_bp.route('', methods=['GET'])
@trips_bp.route('/', methods=['GET'])
@token_required
def get_trips():
    """Get all trips with optional filtering."""
    # Get query parameters for filtering
    status = request.args.get('status')
    vehicle_id = request.args.get('vehicle_id', type=int)
    driver_id = request.args.get('driver_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Build query
    query = Trip.query

    # Apply filters
    if status:
        query = query.filter(Trip.status == status)
    if vehicle_id:
        query = query.filter(Trip.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(Trip.driver_id == driver_id)

    # Join with vehicle and driver to get additional info
    query = query.outerjoin(Vehicle).outerjoin(Driver)

    # paginate results
    paginated = query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    trips = []
    for trip in paginated.items:
        trip_data = {
            'id': trip.id,
            'source': trip.source,
            'destination': trip.destination,
            'vehicle_id': trip.vehicle_id,
            'driver_id': trip.driver_id,
            'cargo_weight': trip.cargo_weight,
            'planned_distance': trip.planned_distance,
            'actual_distance': trip.actual_distance,
            'fuel_consumed': trip.fuel_consumed,
            'revenue': trip.revenue,
            'status': trip.status,
            'dispatched_at': trip.dispatched_at.isoformat() if trip.dispatched_at else None,
            'completed_at': trip.completed_at.isoformat() if trip.completed_at else None,
            'created_at': trip.created_at.isoformat() if trip.created_at else None
        }

        # Add vehicle info if available
        if trip.vehicle_id:
            vehicle = Vehicle.query.get(trip.vehicle_id)
            if vehicle:
                trip_data['vehicle'] = {
                    'id': vehicle.id,
                    'registration_number': vehicle.registration_number,
                    'name_model': vehicle.name_model,
                    'type': vehicle.type
                }

        # Add driver info if available
        if trip.driver_id:
            driver = Driver.query.get(trip.driver_id)
            if driver:
                trip_data['driver'] = {
                    'id': driver.id,
                    'name': driver.name,
                    'license_number': driver.license_number
                }

        trips.append(trip_data)

    return jsonify({
        'trips': trips,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev
        }
    }), 200


@trips_bp.route('/<int:trip_id>', methods=['GET'])
@token_required
def get_trip(trip_id):
    """Get a specific trip by ID."""
    trip = Trip.query.get_or_404(trip_id)

    trip_data = {
        'id': trip.id,
        'source': trip.source,
        'destination': trip.destination,
        'vehicle_id': trip.vehicle_id,
        'driver_id': trip.driver_id,
        'cargo_weight': trip.cargo_weight,
        'planned_distance': trip.planned_distance,
        'actual_distance': trip.actual_distance,
        'fuel_consumed': trip.fuel_consumed,
        'revenue': trip.revenue,
        'status': trip.status,
        'dispatched_at': trip.dispatched_at.isoformat() if trip.dispatched_at else None,
        'completed_at': trip.completed_at.isoformat() if trip.completed_at else None,
        'created_at': trip.created_at.isoformat() if trip.created_at else None
    }

    # Add vehicle info if available
    if trip.vehicle_id:
        vehicle = Vehicle.query.get(trip.vehicle_id)
        if vehicle:
            trip_data['vehicle'] = {
                'id': vehicle.id,
                'registration_number': vehicle.registration_number,
                'name_model': vehicle.name_model,
                'type': vehicle.type,
                'status': vehicle.status
            }

    # Add driver info if available
    if trip.driver_id:
        driver = Driver.query.get(trip.driver_id)
        if driver:
            trip_data['driver'] = {
                'id': driver.id,
                'name': driver.name,
                'license_number': driver.license_number,
                'license_category': driver.license_category,
                'status': driver.status
            }

    return jsonify(trip_data), 200


@trips_bp.route('', methods=['POST'])
@trips_bp.route('/', methods=['POST'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def create_trip():
    """Create a new trip (in Draft status)."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_trip_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Validate business rules
    is_valid_business, business_errors = validate_trip_business_rules(
        data['vehicle_id'],
        data['driver_id'],
        data['cargo_weight']
    )
    if not is_valid_business:
        return jsonify({'message': 'Business rule validation failed', 'errors': business_errors}), 400

    try:
        # Create new trip
        trip = Trip(
            source=data['source'],
            destination=data['destination'],
            vehicle_id=data['vehicle_id'],
            driver_id=data['driver_id'],
            cargo_weight=float(data['cargo_weight']),
            planned_distance=float(data['planned_distance']),
            revenue=float(data.get('revenue', 0)),
            status='Draft'  # Always start as Draft
        )

        # Save to database
        from models import db
        db.session.add(trip)
        db.session.commit()

        return jsonify({
            'message': 'Trip created successfully',
            'trip': {
                'id': trip.id,
                'source': trip.source,
                'destination': trip.destination,
                'vehicle_id': trip.vehicle_id,
                'driver_id': trip.driver_id,
                'cargo_weight': trip.cargo_weight,
                'planned_distance': trip.planned_distance,
                'revenue': trip.revenue,
                'status': trip.status,
                'created_at': trip.created_at.isoformat() if trip.created_at else None
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create trip', 'error': str(e)}), 500


@trips_bp.route('/<int:trip_id>/dispatch', methods=['PUT'])
@trips_bp.route('/<int:trip_id>/dispatch/', methods=['PUT'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def dispatch_trip(trip_id):
    """Dispatch a trip (change status from Draft to Dispatched and update vehicle/driver status)."""
    trip = Trip.query.get_or_404(trip_id)

    # Check if trip is in correct state for dispatching
    if trip.status != 'Draft':
        return jsonify({'message': f'Trip cannot be dispatched. Current status: {trip.status}'}), 400

    # Get associated vehicle and driver
    vehicle = Vehicle.query.get(trip.vehicle_id)
    driver = Driver.query.get(trip.driver_id)

    if not vehicle or not driver:
        return jsonify({'message': 'Associated vehicle or driver not found'}), 404

    # Validate business rules again (in case status changed)
    is_valid_business, business_errors = validate_trip_business_rules(
        trip.vehicle_id,
        trip.driver_id,
        trip.cargo_weight
    )
    if not is_valid_business:
        return jsonify({'message': 'Business rule validation failed', 'errors': business_errors}), 400

    try:
        # Update trip status
        trip.status = 'Dispatched'
        trip.dispatched_at = datetime.now()

        # Update vehicle and driver status
        vehicle.status = 'On Trip'
        driver.status = 'On Trip'

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'Trip dispatched successfully',
            'trip': {
                'id': trip.id,
                'status': trip.status,
                'dispatched_at': trip.dispatched_at.isoformat(),
                'vehicle': {
                    'id': vehicle.id,
                    'status': vehicle.status
                },
                'driver': {
                    'id': driver.id,
                    'status': driver.status
                }
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to dispatch trip', 'error': str(e)}), 500


@trips_bp.route('/<int:trip_id>/complete', methods=['PUT'])
@trips_bp.route('/<int:trip_id>/complete/', methods=['PUT'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def complete_trip(trip_id):
    """Complete a trip (change status from Dispatched to Completed and update vehicle/driver status)."""
    trip = Trip.query.get_or_404(trip_id)

    # Check if trip is in correct state for completion
    if trip.status != 'Dispatched':
        return jsonify({'message': f'Trip cannot be completed. Current status: {trip.status}'}), 400

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate required completion fields
    required_fields = ['actual_distance', 'fuel_consumed']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required to complete trip'}), 400

    try:
        # Update trip with completion data
        trip.status = 'Completed'
        trip.completed_at = datetime.now()
        trip.actual_distance = float(data['actual_distance'])
        trip.fuel_consumed = float(data['fuel_consumed'])

        # Update vehicle and driver status
        vehicle = Vehicle.query.get(trip.vehicle_id)
        driver = Driver.query.get(trip.driver_id)

        if vehicle:
            # Update odometer based on actual distance driven
            if trip.actual_distance:
                vehicle.odometer = (vehicle.odometer or 0) + trip.actual_distance
            vehicle.status = 'Available'

        if driver:
            driver.status = 'Available'

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'Trip completed successfully',
            'trip': {
                'id': trip.id,
                'status': trip.status,
                'completed_at': trip.completed_at.isoformat(),
                'actual_distance': trip.actual_distance,
                'fuel_consumed': trip.fuel_consumed,
                'vehicle': {
                    'id': vehicle.id if vehicle else None,
                    'odometer': vehicle.odometer if vehicle else None,
                    'status': vehicle.status if vehicle else None
                },
                'driver': {
                    'id': driver.id if driver else None,
                    'status': driver.status if driver else None
                }
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to complete trip', 'error': str(e)}), 500


@trips_bp.route('/<int:trip_id>/cancel', methods=['PUT'])
@trips_bp.route('/<int:trip_id>/cancel/', methods=['PUT'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def cancel_trip(trip_id):
    """Cancel a trip (change status from Dispatched to Cancelled and restore vehicle/driver status)."""
    trip = Trip.query.get_or_404(trip_id)

    # Check if trip is in correct state for cancellation
    if trip.status not in ['Dispatched', 'Draft']:
        return jsonify({'message': f'Trip cannot be cancelled. Current status: {trip.status}'}), 400

    try:
        # Update trip status
        trip.status = 'Cancelled'

        # Update vehicle and driver status back to Available
        vehicle = Vehicle.query.get(trip.vehicle_id)
        driver = Driver.query.get(trip.driver_id)

        if vehicle:
            vehicle.status = 'Available'

        if driver:
            driver.status = 'Available'

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'Trip cancelled successfully',
            'trip': {
                'id': trip.id,
                'status': trip.status,
                'vehicle': {
                    'id': vehicle.id if vehicle else None,
                    'status': vehicle.status if vehicle else None
                },
                'driver': {
                    'id': driver.id if driver else None,
                    'status': driver.status if driver else None
                }
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to cancel trip', 'error': str(e)}), 500


@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@trips_bp.route('/<int:trip_id>/', methods=['DELETE'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def delete_trip(trip_id):
    """Delete a trip (only if in Draft status)."""
    trip = Trip.query.get_or_404(trip_id)

    # Only allow deletion of draft trips
    if trip.status != 'Draft':
        return jsonify({'message': 'Only trips in Draft status can be deleted'}), 400

    try:
        from models import db
        db.session.delete(trip)
        db.session.commit()

        return jsonify({'message': 'Trip deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete trip', 'error': str(e)}), 500