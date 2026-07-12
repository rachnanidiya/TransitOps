# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the TransitOps Smart Transport Operations Platform repository.

## Project Overview

TransitOps is a Flask-based REST API for managing transportation operations, including vehicles, drivers, trips, maintenance, expenses, fuel logs, and reporting. The application uses SQLAlchemy for ORM, JWT for authentication, and role-based access control (RBAC). A simple SQLite database is used for storage.

## Development Setup

### Prerequisites
- Python 3.8+
- pip

### Local Setup
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd TransitOps

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize the database (runs on first startup)
python app.py
```

The server will start on `http://127.0.0.1:5000` by default.

### Environment Variables
- `FLASK_CONFIG`: Configuration to use (`development`, `production`, `testing`). Defaults to `development`.
- `SECRET_KEY`: Secret key for JWT and Flask sessions (default: `'dev-secret-key-change-in-production'`).
- `DATABASE_URL`: Database connection string (default: SQLite file `transitops.db` in the `server` directory).
- `JWT_EXPIRATION`: JWT expiration time in seconds (default: `3600`).
- `JWT_SECRET_KEY`: Secret key for JWT signing (default: `'jwt-secret-string'`).

## Available Scripts

### Run the Development Server
```bash
python app.py
```
Runs the Flask application with debug enabled and auto-reload on code changes.

### Run Tests
There is no formal test suite in the repository yet. If tests are added, they can be run with:
```bash
pytest
```
or
```bash
python -m unittest discover
```

### Linting
No formal linting configuration exists. You can use common Python linters such as:
```bash
flake8 .
pylint **/*.py
```

### Database Management
The database is initialized automatically via `server/db/database.py` when the app starts. The function `init_db_app` creates tables and populates sample data if the database is empty.

To reset the database, delete the `transitops.db` file in the `server/` directory and restart the application.

## Project Structure

```
TransitOps/
├── app.py                  # Application entry point; imports and runs the Flask app
├── models.py               # SQLAlchemy models (User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense)
├── requirements.txt        # Python dependencies
├── server/
│   ├── __init__.py
│   ├── app.py              # Application factory (create_app) and extension setup
│   ├── config.py           # Configuration classes (development, production, testing)
│   ├── db/
│   │   ├── __init__.py
│   │   └── database.py     # Database initialization and sample data seeding
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py         # JWT token generation, verification, and authentication decorator
│   │   └── rbac.py         # Role-based access control decorators and helpers
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py         # Authentication endpoints (register, login, profile, logout)
│   │   ├── vehicles.py     # Vehicle CRUD endpoints
│   │   ├── drivers.py      # Driver CRUD endpoints
│   │   ├── trips.py        # Trip CRUD endpoints
│   │   ├── maintenance.py  # Maintenance log endpoints
│   │   ├── expenses.py     # Expense tracking endpoints
│   │   ├── reports.py      # Reporting and analytics endpoints
│   │   └── settings.py     # System settings endpoints
│   └── utils/
│       ├── __init__.py
│       └── validators.py   # Input validation helper functions for each model
├── templates/              # HTML templates (if server‑side rendering is used)
└── instance/               # Instance folder (used by Flask for configs, ignored by git)
```

### Key Components

- **Application Factory** (`server/app.py`): Creates and configures the Flask app, registers blueprints, initializes extensions (SQLAlchemy, CORS), and sets up error handlers.
- **Configuration** (`server/config.py`): Environment‑specific settings.
- **Authentication** (`server/middleware/auth.py`): JWT token handling, `@token_required` decorator, and `authenticate_user` helper.
- **Authorization** (`server/middleware/rbac.py`): Role‑based decorators (`@roles_required`) and helper functions.
- **Routes** (`server/routes/`): Blueprint‑organized RESTful endpoints grouped by resource.
- **Models** (`models.py`): SQLAlchemy model definitions with relationships.
- **Validators** (`server/utils/validators.py`: Validation functions for request payloads.

## Common Development Tasks

### Adding a New API Endpoint
1. Create or edit a file in `server/routes/` (e.g., `newfeature.py`).
2. Define a `Blueprint` and register it in `server/app.py` under `create_app`.
3. Implement route functions, using `@token_required` for authentication and optionally `@roles_required` for authorization.
4. Use the appropriate model(s) from `models.py` and validate input with functions from `server/utils/validators.py` (or create new ones).

### Adding a New Model
1. Define a new class in `models.py` that inherits from `db.Model`.
2. Add any necessary relationships.
3. Run the application; the table will be created automatically on startup (if using SQLite with `create_all`).
4. If you need to modify existing tables, you would need to handle migrations manually (e.g., using Flask‑Migrate) or delete the database to let it be recreated with sample data.

### Running Background Jobs / Tasks
The project does not currently include a task queue. For background work, consider integrating Celery or using Flask‑CLI commands.

## Coding Conventions

- Follow PEP 8 for Python code style.
- Use descriptive variable and function names.
- Keep route handlers thin; delegate business logic to service functions or model methods.
- Use the provided validation helpers in `server/utils/validators.py` when possible.
- Add docstrings to all public functions and classes.
- Ensure new endpoints are protected with appropriate authentication and authorization decorators.

## Notes

- The repository contains a `.gitignore` that excludes the virtual environment (`venv/`), instance folder (`instance/`), bytecode (`__pycache__/`), and compiled Python files (`*.pyc`).
- The SQLite database file (`transitops.db`) is located in the `server/` directory and is included in the repository for convenience; in production, you would likely change `DATABASE_URL` to a production‑grade database (e.g., PostgreSQL).
- The frontend templates in the `templates/` folder are not currently used by the API but are available if you decide to add server‑rendered pages.