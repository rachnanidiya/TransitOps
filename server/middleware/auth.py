from functools import wraps
from flask import g, request, jsonify
import jwt
from werkzeug.security import check_password_hash
from datetime import datetime, timedelta
import os

# Secret key should be set as environment variable in production
SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'


def generate_token(user_id, email, role_name):
    """Generate a JWT token for the user."""
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role_name,
        'exp': datetime.utcnow() + timedelta(hours=24)  # Token expires in 24 hours
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def verify_token(token):
    """Verify a JWT token and return the payload if valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Token is invalid


def token_required(f):
    """Decorator to require a valid JWT token for access."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        # Verify the token
        payload = verify_token(token)
        if not payload:
            return jsonify({'message': 'Token is invalid or expired'}), 401

        # Attach the user info to the request context for use in the route
        g.current_user = {
            'id': payload['user_id'],
            'email': payload['email'],
            'role': payload['role']
        }

        return f(*args, **kwargs)

    return decorated


def verify_password(password, password_hash):
    """Verify a password against its hash."""
    return check_password_hash(password_hash, password)


def authenticate_user(email, password):
    """
    Authenticate a user by email and password.
    Returns user data if authentication is successful, None otherwise.
    """
    from models import User

    user = User.query.filter_by(email=email).first()
    if user and verify_password(password, user.password_hash):
        return {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }
    return None