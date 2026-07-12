from functools import wraps
from flask import g, jsonify
from models import User


def roles_required(*allowed_roles):
    """
    Decorator to restrict access to specific roles.

    Usage:
    @app.route('/admin')
    @roles_required('fleet_manager', 'dispatcher')
    def admin_only():
        return 'Only for managers and dispatchers'
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if user is authenticated
            if not hasattr(g, 'current_user') or not g.current_user:
                return jsonify({'message': 'Authentication required'}), 401

            # Check if user's role is in allowed roles
            user_role = g.current_user.get('role')
            if user_role not in allowed_roles:
                return jsonify({'message': 'Insufficient permissions'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def get_current_user():
    """Get the current user from the Flask g object."""
    if hasattr(g, 'current_user'):
        return g.current_user
    return None


def is_authenticated():
    """Check if a user is authenticated."""
    return hasattr(g, 'current_user') and g.current_user is not None


def has_role(role):
    """Check if the current user has a specific role."""
    if not is_authenticated():
        return False
    return g.current_user.get('role') == role


def has_any_role(*roles):
    """Check if the current user has any of the specified roles."""
    if not is_authenticated():
        return False
    return g.current_user.get('role') in roles