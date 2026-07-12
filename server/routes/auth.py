from flask import Blueprint, request, jsonify, g
from server.middleware.auth import authenticate_user, generate_token, token_required
from server.middleware.rbac import roles_required
from models import User
import os

# Create blueprint
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate required fields
    required_fields = ['email', 'password', 'name', 'role']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    # Validate role
    valid_roles = ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst']
    if data['role'] not in valid_roles:
        return jsonify({'message': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'message': 'User with this email already exists'}), 409

    try:
        # Create new user
        from werkzeug.security import generate_password_hash
        new_user = User(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            name=data['name'],
            role=data['role']
        )

        # Save to database
        from models import db
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'name': new_user.name,
                'role': new_user.role
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to register user', 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token."""
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Validate required fields
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    # Authenticate user
    user = authenticate_user(data['email'], data['password'])
    if not user:
        return jsonify({'message': 'Invalid email or password'}), 401

    # Generate token
    token = generate_token(user['id'], user['email'], user['role'])

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role']
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@auth_bp.route('/profile', methods=['GET'])
@auth_bp.route('/me/profile', methods=['GET'])
@token_required
def get_current_user():
    """Get current user information."""
    if not hasattr(g, 'current_user') or not g.current_user:
        return jsonify({'message': 'Authentication required'}), 401

    # Get full user details from database
    user = User.query.get(g.current_user['id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user (invalidate token on client side)."""
    # In a stateless JWT system, logout is handled client-side by removing the token
    # This endpoint is here for consistency and could be used for token blacklisting in the future
    return jsonify({'message': 'Logged out successfully'}), 200