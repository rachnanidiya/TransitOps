from flask import Blueprint, request, jsonify, g
from server.middleware.rbac import roles_required
from server.middleware.auth import token_required
from models import MaintenanceLog, Vehicle
from server.utils.validators import validate_maintenance_log_data
from datetime import datetime

# Create blueprint
maintenance_bp = Blueprint('maintenance', __name__)


@maintenance_bp.route('', methods=['GET'])
@maintenance_bp.route('/', methods=['GET'])
@token_required
def get_maintenance_logs():
    """Get all maintenance logs with optional filtering."""
    # Get query parameters for filtering
    vehicle_id = request.args.get('vehicle_id', type=int)
    status = request.args.get('status')
    maintenance_type = request.args.get('type')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Build query
    query = MaintenanceLog.query

    # Apply filters
    if vehicle_id:
        query = query.filter(MaintenanceLog.vehicle_id == vehicle_id)
    if status:
        query = query.filter(MaintenanceLog.status == status)
    if maintenance_type:
        query = query.filter(MaintenanceLog.type == maintenance_type)

    # Join with vehicle to get vehicle info
    query = query.outerjoin(Vehicle)

    # paginate results
    paginated = query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    logs = []
    for log in paginated.items:
        log_data = {
            'id': log.id,
            'vehicle_id': log.vehicle_id,
            'type': log.type,
            'description': log.description,
            'cost': log.cost,
            'status': log.status,
            'scheduled_date': log.scheduled_date.isoformat() if log.scheduled_date else None,
            'completed_date': log.completed_date.isoformat() if log.completed_date else None,
            'created_at': log.created_at.isoformat() if log.created_at else None
        }

        # Add vehicle info if available
        if log.vehicle_id:
            vehicle = Vehicle.query.get(log.vehicle_id)
            if vehicle:
                log_data['vehicle'] = {
                    'id': vehicle.id,
                    'registration_number': vehicle.registration_number,
                    'name_model': vehicle.name_model
                }

        logs.append(log_data)

    return jsonify({
        'maintenance_logs': logs,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev
        }
    }), 200


@maintenance_bp.route('/<int:log_id>', methods=['GET'])
@token_required
def get_maintenance_log(log_id):
    """Get a specific maintenance log by ID."""
    log = MaintenanceLog.query.get_or_404(log_id)

    log_data = {
        'id': log.id,
        'vehicle_id': log.vehicle_id,
        'type': log.type,
        'description': log.description,
        'cost': log.cost,
        'status': log.status,
        'scheduled_date': log.scheduled_date.isoformat() if log.scheduled_date else None,
        'completed_date': log.completed_date.isoformat() if log.completed_date else None,
        'created_at': log.created_at.isoformat() if log.created_at else None
    }

    # Add vehicle info if available
    if log.vehicle_id:
        vehicle = Vehicle.query.get(log.vehicle_id)
        if vehicle:
            log_data['vehicle'] = {
                'id': vehicle.id,
                'registration_number': vehicle.registration_number,
                'name_model': vehicle.name_model,
                'type': vehicle.type,
                'status': vehicle.status
            }

    return jsonify(log_data), 200


@maintenance_bp.route('', methods=['POST'])
@maintenance_bp.route('/', methods=['POST'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def create_maintenance_log():
    """Create a new maintenance log entry."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_maintenance_log_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if vehicle exists
    vehicle = Vehicle.query.get(data['vehicle_id'])
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    try:
        # Create new maintenance log
        maintenance_log = MaintenanceLog(
            vehicle_id=data['vehicle_id'],
            type=data['type'],
            description=data.get('description'),
            cost=float(data.get('cost', 0)),
            status=data.get('status', 'Active'),
            scheduled_date=datetime.strptime(data['scheduled_date'], '%Y-%m-%d').date() if data.get('scheduled_date') else None,
            completed_date=datetime.strptime(data['completed_date'], '%Y-%m-%d').date() if data.get('completed_date') else None
        )

        # If setting to Active, update vehicle status to "In Shop"
        if maintenance_log.status == 'Active':
            vehicle.status = 'In Shop'

        # Save to database
        from models import db
        db.session.add(maintenance_log)
        db.session.commit()

        return jsonify({
            'message': 'Maintenance log created successfully',
            'maintenance_log': {
                'id': maintenance_log.id,
                'vehicle_id': maintenance_log.vehicle_id,
                'type': maintenance_log.type,
                'description': maintenance_log.description,
                'cost': maintenance_log.cost,
                'status': maintenance_log.status,
                'scheduled_date': maintenance_log.scheduled_date.isoformat() if maintenance_log.scheduled_date else None,
                'completed_date': maintenance_log.completed_date.isoformat() if maintenance_log.completed_date else None,
                'created_at': maintenance_log.created_at.isoformat() if maintenance_log.created_at else None
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create maintenance log', 'error': str(e)}), 500


@maintenance_bp.route('/<int:log_id>/complete', methods=['PUT'])
@maintenance_bp.route('/<int:log_id>/complete/', methods=['PUT'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def complete_maintenance(log_id):
    """Complete a maintenance log (change status from Active to Completed and update vehicle status)."""
    maintenance_log = MaintenanceLog.query.get_or_404(log_id)

    # Check if log is in correct state for completion
    if maintenance_log.status != 'Active':
        return jsonify({'message': f'Maintenance log cannot be completed. Current status: {maintenance_log.status}'}), 400

    # Get associated vehicle
    vehicle = Vehicle.query.get(maintenance_log.vehicle_id)
    if not vehicle:
        return jsonify({'message': 'Associated vehicle not found'}), 404

    # Check if vehicle is retired - if so, don't make it available again
    if vehicle.status == 'Retired':
        return jsonify({'message': 'Cannot complete maintenance for retired vehicle'}), 400

    try:
        # Update maintenance log status
        maintenance_log.status = 'Completed'
        maintenance_log.completed_date = datetime.now().date()

        # Update vehicle status to Available (unless it's retired)
        if vehicle.status != 'Retired':
            vehicle.status = 'Available'

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'Maintenance log completed successfully',
            'maintenance_log': {
                'id': maintenance_log.id,
                'status': maintenance_log.status,
                'completed_date': maintenance_log.completed_date.isoformat()
            },
            'vehicle': {
                'id': vehicle.id,
                'status': vehicle.status
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to complete maintenance log', 'error': str(e)}), 500


@maintenance_bp.route('/<int:log_id>', methods=['PUT'])
@maintenance_bp.route('/<int:log_id>/', methods=['PUT'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def update_maintenance_log(log_id):
    """Update an existing maintenance log."""
    maintenance_log = MaintenanceLog.query.get_or_404(log_id)
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_maintenance_log_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if vehicle exists
    vehicle = Vehicle.query.get(data['vehicle_id'])
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    try:
        # Store old status to check if we need to update vehicle status
        old_status = maintenance_log.status

        # Update maintenance log fields
        if 'vehicle_id' in data:
            maintenance_log.vehicle_id = data['vehicle_id']
        if 'type' in data:
            maintenance_log.type = data['type']
        if 'description' in data:
            maintenance_log.description = data['description']
        if 'cost' in data:
            maintenance_log.cost = float(data['cost'])
        if 'status' in data:
            maintenance_log.status = data['status']
        if 'scheduled_date' in data:
            maintenance_log.scheduled_date = datetime.strptime(data['scheduled_date'], '%Y-%m-%d').date() if data['scheduled_date'] else None
        if 'completed_date' in data:
            maintenance_log.completed_date = datetime.strptime(data['completed_date'], '%Y-%m-%d').date() if data['completed_date'] else None

        # Handle status changes and vehicle status updates
        if old_status == 'Active' and maintenance_log.status == 'Completed':
            # Changing from Active to Completed - make vehicle available
            vehicle.status = 'Available'
        elif old_status != 'Active' and maintenance_log.status == 'Active':
            # Changing to Active from something else - make vehicle "In Shop"
            vehicle.status = 'In Shop'

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'Maintenance log updated successfully',
            'maintenance_log': {
                'id': maintenance_log.id,
                'vehicle_id': maintenance_log.vehicle_id,
                'type': maintenance_log.type,
                'description': maintenance_log.description,
                'cost': maintenance_log.cost,
                'status': maintenance_log.status,
                'scheduled_date': maintenance_log.scheduled_date.isoformat() if maintenance_log.scheduled_date else None,
                'completed_date': maintenance_log.completed_date.isoformat() if maintenance_log.completed_date else None,
                'created_at': maintenance_log.created_at.isoformat() if maintenance_log.created_at else None
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update maintenance log', 'error': str(e)}), 500


@maintenance_bp.route('/<int:log_id>', methods=['DELETE'])
@maintenance_bp.route('/<int:log_id>/', methods=['DELETE'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def delete_maintenance_log(log_id):
    """Delete a maintenance log."""
    maintenance_log = MaintenanceLog.query.get_or_404(log_id)

    # Store vehicle info before deletion for potential status update
    vehicle = Vehicle.query.get(maintenance_log.vehicle_id)
    was_active = (maintenance_log.status == 'Active')

    try:
        from models import db
        db.session.delete(maintenance_log)
        db.session.commit()

        # If we deleted an active maintenance log, make vehicle available again
        if was_active and vehicle and vehicle.status == 'In Shop':
            vehicle.status = 'Available'
            db.session.commit()

        return jsonify({'message': 'Maintenance log deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete maintenance log', 'error': str(e)}), 500