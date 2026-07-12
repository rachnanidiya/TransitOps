from flask import Blueprint, request, jsonify, g
from server.middleware.rbac import roles_required
from server.middleware.auth import token_required
from models import User
from datetime import datetime

# Create blueprint
settings_bp = Blueprint('settings', __name__)


@settings_bp.route('/users', methods=['GET'])
@settings_bp.route('/users/', methods=['GET'])
@token_required
@roles_required('fleet_manager')  # Only fleet managers can manage users
def get_users():
    """Get all users (Admin only)."""
    try:
        # Get query parameters for filtering
        role = request.args.get('role')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Build query
        query = User.query

        # Apply filters
        if role:
            query = query.filter(User.role == role)

        # paginate results
        paginated = query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        users = []
        for user in paginated.items:
            users.append({
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'created_at': user.created_at.isoformat() if user.created_at else None
            })

        return jsonify({
            'users': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages,
                'has_next': paginated.has_next,
                'has_prev': paginated.has_prev
            }
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to retrieve users', 'error': str(e)}), 500


@settings_bp.route('/users/<int:user_id>', methods=['GET'])
@settings_bp.route('/users/<int:user_id>/', methods=['GET'])
@token_required
@roles_required('fleet_manager')
def get_user(user_id):
    """Get a specific user by ID."""
    try:
        user = User.query.get_or_404(user_id)

        return jsonify({
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to retrieve user', 'error': str(e)}), 500


@settings_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@settings_bp.route('/users/<int:user_id>/role/', methods=['PUT'])
@token_required
@roles_required('fleet_manager')
def update_user_role(user_id):
    """Update user role (Admin only)."""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        # Validate role
        valid_roles = ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst']
        new_role = data.get('role')
        if not new_role:
            return jsonify({'message': 'Role is required'}), 400

        if new_role not in valid_roles:
            return jsonify({'message': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400

        # Prevent users from removing their own admin privileges
        if user.id == g.current_user['id'] and new_role != user.role:
            return jsonify({'message': 'You cannot change your own role'}), 403

        # Update role
        user.role = new_role

        # Save changes
        from models import db
        db.session.commit()

        return jsonify({
            'message': 'User role updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update user role', 'error': str(e)}), 500


@settings_bp.route('/users/<int:user_id>', methods=['DELETE'])
@settings_bp.route('/users/<int:user_id>/', methods=['DELETE'])
@token_required
@roles_required('fleet_manager')
def delete_user(user_id):
    """Delete a user (Admin only)."""
    try:
        user = User.query.get_or_404(user_id)

        # Prevent users from deleting themselves
        if user.id == g.current_user['id']:
            return jsonify({'message': 'You cannot delete your own account'}), 403

        # Delete user
        from models import db
        db.session.delete(user)
        db.session.commit()

        return jsonify({'message': 'User deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete user', 'error': str(e)}), 500


@settings_bp.route('/preferences', methods=['GET'])
@settings_bp.route('/preferences/', methods=['GET'])
@token_required
def get_preferences():
    """Get application preferences."""
    # In a real application, this would come from a settings table or config
    # For now, we'll return some default preferences
    return jsonify({
        'preferences': {
            'date_format': 'YYYY-MM-DD',
            'time_format': 'HH:mm:ss',
            'default_language': 'en',
            'timezone': 'UTC',
            'items_per_page': 25,
            'enable_notifications': True,
            'theme': 'dark'
        }
    }), 200


@settings_bp.route('/preferences', methods=['PUT'])
@settings_bp.route('/preferences/', methods=['PUT'])
@token_required
def update_preferences():
    """Update application preferences."""
    # In a real application, this would update a settings table or user preferences
    # For now, we'll just acknowledge the request
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate preferences (basic validation)
    valid_keys = ['date_format', 'time_format', 'default_language', 'timezone',
                 'items_per_page', 'enable_notifications', 'theme']

    invalid_keys = [key for key in data.keys() if key not in valid_keys]
    if invalid_keys:
        return jsonify({
            'message': f'Invalid preference keys: {", ".join(invalid_keys)}'
        }), 400

    # In a real app, save these preferences
    # For now, just return success
    return jsonify({
        'message': 'Preferences updated successfully',
        'preferences': data
    }), 200