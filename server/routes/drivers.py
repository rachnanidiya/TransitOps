from flask import Blueprint, request, jsonify, g
from server.middleware.rbac import roles_required
from server.middleware.auth import token_required
from models import Driver
from server.utils.validators import validate_driver_data
from datetime import datetime

# Create blueprint
drivers_bp = Blueprint('drivers', __name__)


@drivers_bp.route('', methods=['GET'])
@drivers_bp.route('/', methods=['GET'])
@token_required
def get_drivers():
    """Get all drivers with optional filtering."""
    # Get query parameters for filtering
    status = request.args.get('status')
    license_category = request.args.get('license_category')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Build query
    query = Driver.query

    # Apply filters
    if status:
        query = query.filter(Driver.status == status)
    if license_category:
        query = query.filter(Driver.license_category == license_category)

    # Add filter for available drivers (license not expired)
    if request.args.get('available_only') == 'true':
        query = query.filter(
            Driver.status == 'Available',
            Driver.license_expiry_date >= datetime.now().date()
        )

    # paginate results
    paginated = query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    drivers = []
    for driver in paginated.items:
        drivers.append({
            'id': driver.id,
            'name': driver.name,
            'license_number': driver.license_number,
            'license_category': driver.license_category,
            'license_expiry_date': driver.license_expiry_date.isoformat() if driver.license_expiry_date else None,
            'contact_number': driver.contact_number,
            'safety_score': driver.safety_score,
            'status': driver.status,
            'created_at': driver.created_at.isoformat() if driver.created_at else None
        })

    return jsonify({
        'drivers': drivers,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev
        }
    }), 200


@drivers_bp.route('/available', methods=['GET'])
@drivers_bp.route('/available/', methods=['GET'])
@token_required
def get_available_drivers():
    """Get only available drivers with valid licenses."""
    from datetime import date

    # Get drivers who are Available and have license not expired
    drivers = Driver.query.filter(
        Driver.status == 'Available',
        Driver.license_expiry_date >= date.today()
    ).all()

    result = []
    for driver in drivers:
        result.append({
            'id': driver.id,
            'name': driver.name,
            'license_number': driver.license_number,
            'license_category': driver.license_category,
            'license_expiry_date': driver.license_expiry_date.isoformat(),
            'contact_number': driver.contact_number,
            'safety_score': driver.safety_score,
            'status': driver.status
        })

    return jsonify({'drivers': result}), 200


@drivers_bp.route('/<int:driver_id>', methods=['GET'])
@token_required
def get_driver(driver_id):
    """Get a specific driver by ID."""
    driver = Driver.query.get_or_404(driver_id)

    return jsonify({
        'id': driver.id,
        'name': driver.name,
        'license_number': driver.license_number,
        'license_category': driver.license_category,
        'license_expiry_date': driver.license_expiry_date.isoformat() if driver.license_expiry_date else None,
        'contact_number': driver.contact_number,
        'safety_score': driver.safety_score,
        'status': driver.status,
        'created_at': driver.created_at.isoformat() if driver.created_at else None
    }), 200


@drivers_bp.route('', methods=['POST'])
@drivers_bp.route('/', methods=['POST'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def create_driver():
    """Create a new driver."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_driver_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if license number already exists
    existing_driver = Driver.query.filter_by(license_number=data['license_number']).first()
    if existing_driver:
        return jsonify({'message': 'Driver with this license number already exists'}), 409

    try:
        # Create new driver
        driver = Driver(
            name=data['name'],
            license_number=data['license_number'],
            license_category=data['license_category'],
            license_expiry_date=datetime.strptime(data['license_expiry_date'], '%Y-%m-%d').date(),
            contact_number=data.get('contact_number'),
            safety_score=float(data.get('safety_score', 100)),
            status=data.get('status', 'Available')
        )

        # Save to database
        from models import db
        db.session.add(driver)
        db.session.commit()

        return jsonify({
            'message': 'Driver created successfully',
            'driver': {
                'id': driver.id,
                'name': driver.name,
                'license_number': driver.license_number,
                'license_category': driver.license_category,
                'license_expiry_date': driver.license_expiry_date.isoformat(),
                'contact_number': driver.contact_number,
                'safety_score': driver.safety_score,
                'status': driver.status,
                'created_at': driver.created_at.isoformat() if driver.created_at else None
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create driver', 'error': str(e)}), 500


@drivers_bp.route('/<int:driver_id>', methods=['PUT'])
@drivers_bp.route('/<int:driver_id>/', methods=['PUT'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def update_driver(driver_id):
    """Update an existing driver."""
    driver = Driver.query.get_or_404(driver_id)
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate input data
    is_valid, errors = validate_driver_data(data)
    if not is_valid:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    # Check if license number already exists (excluding current driver)
    if 'license_number' in data:
        existing_driver = Driver.query.filter_by(
            license_number=data['license_number']
        ).filter(Driver.id != driver_id).first()
        if existing_driver:
            return jsonify({'message': 'Driver with this license number already exists'}), 409

    try:
        # Update driver fields
        if 'name' in data:
            driver.name = data['name']
        if 'license_number' in data:
            driver.license_number = data['license_number']
        if 'license_category' in data:
            driver.license_category = data['license_category']
        if 'license_expiry_date' in data:
            driver.license_expiry_date = datetime.strptime(data['license_expiry_date'], '%Y-%m-%d').date()
        if 'contact_number' in data:
            driver.contact_number = data['contact_number']
        if 'safety_score' in data:
            driver.safety_score = float(data['safety_score'])
        if 'status' in data:
            driver.status = data['status']

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'Driver updated successfully',
            'driver': {
                'id': driver.id,
                'name': driver.name,
                'license_number': driver.license_number,
                'license_category': driver.license_category,
                'license_expiry_date': driver.license_expiry_date.isoformat(),
                'contact_number': driver.contact_number,
                'safety_score': driver.safety_score,
                'status': driver.status,
                'created_at': driver.created_at.isoformat() if driver.created_at else None
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update driver', 'error': str(e)}), 500


@drivers_bp.route('/<int:driver_id>', methods=['DELETE'])
@drivers_bp.route('/<int:driver_id>/', methods=['DELETE'])
@token_required
@roles_required('fleet_manager', 'dispatcher')
def delete_driver(driver_id):
    """Delete a driver."""
    driver = Driver.query.get_or_404(driver_id)

    try:
        from models import db
        db.session.delete(driver)
        db.session.commit()

        return jsonify({'message': 'Driver deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete driver', 'error': str(e)}), 500