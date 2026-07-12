from flask import Flask, render_template

app = Flask(__name__)
# Configures a local SQLite database named transitops.db
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transitops.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

@app.route('/')
def dashboard():
    return "<h1>TransitOps Server is Running!</h1>"

if __name__ == '__main__':
    app.run(debug=True)