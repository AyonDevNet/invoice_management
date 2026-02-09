from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db
from models.user import User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Name, email and password are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            role=data.get('role', 'user'),
            department=data.get('department', ''),
            status='active'
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'Registration error: {str(e)}')
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if user is active
        if user.status != 'active':
            return jsonify({'error': 'Account is inactive'}), 403
        
        # Update last login
        user.update_last_login()
        
        # CRITICAL FIX: Convert user.id to STRING
        access_token = create_access_token(
            identity=str(user.id),  # ← CONVERT TO STRING!
            expires_delta=timedelta(hours=24)
        )
        
        print(f'✅ Login successful for user: {user.email} (ID: {user.id})')
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f'Login error: {str(e)}')
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/current-user', methods=['GET'])
@jwt_required()
def current_user():
    """Get current authenticated user"""
    try:
        # Get user ID from JWT token (it's a string now)
        user_id_str = get_jwt_identity()
        
        # Convert back to integer for database query
        user_id = int(user_id_str)
        
        print(f'🔍 Looking up user ID: {user_id}')
        
        # Find user
        user = User.query.get(user_id)
        
        if not user:
            print(f'❌ User {user_id} not found')
            return jsonify({'error': 'User not found'}), 404
        
        if user.status != 'active':
            print(f'❌ User {user_id} is inactive')
            return jsonify({'error': 'Account is inactive'}), 403
        
        print(f'✅ Current user: {user.email}')
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except ValueError as e:
        print(f'❌ Invalid user ID format: {str(e)}')
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        print(f'❌ Current user error: {str(e)}')
        return jsonify({'error': 'Failed to get user'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client-side token removal)"""
    try:
        user_id_str = get_jwt_identity()
        print(f'🚪 User {user_id_str} logged out')
        return jsonify({
            'message': 'Logout successful'
        }), 200
    except Exception as e:
        print(f'Logout error: {str(e)}')
        return jsonify({
            'message': 'Logout successful'
        }), 200