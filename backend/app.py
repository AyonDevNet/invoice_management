from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from models.user import User
from models.invoice import Invoice
from dotenv import load_dotenv
from datetime import datetime
import os

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Get absolute path to database
basedir = os.path.abspath(os.path.dirname(__file__))
database_folder = os.path.join(basedir, 'database')
database_path = os.path.join(database_folder, 'invoices.db')

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{database_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# IMPORTANT: JWT Configuration
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)
db.init_app(app)

# JWT error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f'Invalid token error: {error}')
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def unauthorized_callback(error):
    print(f'Unauthorized error: {error}')
    return jsonify({'error': 'Missing authorization header'}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    print('Token expired')
    return jsonify({'error': 'Token has expired'}), 401

# Create database tables
with app.app_context():
    os.makedirs(database_folder, exist_ok=True)
    print('\n' + '='*60)
    print('Creating database tables...')
    db.create_all()
    print('✅ Database tables created!')
    
    # Create super admin if doesn't exist
    try:
        if not User.query.filter_by(role='super-admin').first():
            super_admin = User(
                name='System Administrator',
                email='mohammedayon2021@gmail.com',
                role='super-admin',
                status='active'
            )
            super_admin.set_password('Ayon')
            db.session.add(super_admin)
            db.session.commit()
            print('\n' + '='*60)
            print('✅ Super Admin Account Created!')
            print('='*60)
            print('   Email: mohammedayon2021@gmail.com')
            print('   Password: Ayon')
            print('='*60 + '\n')
        else:
            print('✅ Super Admin already exists\n')
    except Exception as e:
        print(f'Error creating super admin: {e}\n')

# Register blueprints
from routes.auth import auth_bp
from routes.invoice import invoice_bp

app.register_blueprint(auth_bp)
app.register_blueprint(invoice_bp)

# Base routes
@app.route('/')
def index():
    return jsonify({
        'message': 'Invoice Management System API',
        'version': 'v6',
        'status': 'running',
        'database': 'SQLite',
        'endpoints': {
            'auth': {
                'register': 'POST /api/register',
                'login': 'POST /api/login',
                'current_user': 'GET /api/current-user',
                'logout': 'POST /api/logout'
            },
            'invoices': {
                'list': 'GET /api/invoices',
                'create': 'POST /api/invoices',
                'get': 'GET /api/invoices/<id>',
                'update': 'PUT /api/invoices/<id>',
                'delete': 'DELETE /api/invoices/<id>',
                'stats': 'GET /api/invoices/stats'
            }
        }
    })

@app.route('/api/health')
def health():
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'database': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print('\n' + '='*60)
    print('🚀 Starting Invoice Management System API...')
    print('='*60)
    print('   Server: http://127.0.0.1:5000')
    print('   Health: http://127.0.0.1:5000/api/health')
    print('\n   Login Credentials:')
    print('   Email: mohammedayon2021@gmail.com')
    print('   Password: Ayon')
    print('\n   Authentication APIs:')
    print('   - POST /api/register')
    print('   - POST /api/login')
    print('   - GET /api/current-user (requires token)')
    print('   - POST /api/logout')
    print('\n   Invoice APIs:')
    print('   - GET /api/invoices (requires token)')
    print('   - POST /api/invoices (requires token)')
    print('   - GET /api/invoices/<id> (requires token)')
    print('   - PUT /api/invoices/<id> (requires token)')
    print('   - DELETE /api/invoices/<id> (requires token)')
    print('   - GET /api/invoices/stats (requires token)')
    print('='*60 + '\n')
    app.run(debug=True, port=5000)