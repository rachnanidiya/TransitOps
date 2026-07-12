import os
from server.app import create_app

# Create the Flask application using the application factory
app = create_app()

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the application
    # debug=True allows for auto-reloading when code changes
    app.run(host='127.0.0.1', port=port, debug=True)