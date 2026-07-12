import os
from flask import Flask, jsonify
from flask_cors import CORS
from server.config import config
from models import db
from server.db.database import init_db as init_db_app
from server.routes import auth, vehicles, drivers, trips, maintenance, expenses, reports, settings


def create_app(config_name=None):
    """Application factory pattern."""
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    CORS(app)  # Enable CORS for all routes

    # Initialize database with app
    init_db_app(app)

    # Register blueprints
    app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vehicles.vehicles_bp, url_prefix='/api/vehicles')
    app.register_blueprint(drivers.drivers_bp, url_prefix='/api/drivers')
    app.register_blueprint(trips.trips_bp, url_prefix='/api/trips')
    app.register_blueprint(maintenance.maintenance_bp, url_prefix='/api/maintenance')
    app.register_blueprint(expenses.expenses_bp, url_prefix='/api/expenses')
    app.register_blueprint(reports.reports_bp, url_prefix='/api/reports')
    app.register_blueprint(settings.settings_bp, url_prefix='/api/settings')

    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'TransitOps API is running',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'vehicles': '/api/vehicles',
                'drivers': '/api/drivers',
                'trips': '/api/trips',
                'maintenance': '/api/maintenance',
                'expenses': '/api/expenses',
                'reports': '/api/reports',
                'settings': '/api/settings'
            }
        })

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy'}), 200

    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'message': 'Bad request'}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'message': 'Unauthorized'}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'message': 'Forbidden'}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'message': 'Internal server error'}), 500

    return app