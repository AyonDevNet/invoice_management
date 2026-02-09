from flask import Blueprint, request, jsonify
from models import db
from models.invoice import Invoice
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

# Create blueprint
invoice_bp = Blueprint('invoice', __name__)

# Get all invoices
@invoice_bp.route('/api/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        status = request.args.get('status')
        search = request.args.get('search')
        
        # Build query
        query = Invoice.query.filter_by(created_by=current_user_id)
        
        if status:
            query = query.filter_by(payment_status=status)
        
        if search:
            query = query.filter(
                (Invoice.serial_number.ilike(f'%{search}%')) |
                (Invoice.customer_name.ilike(f'%{search}%')) |
                (Invoice.device_name.ilike(f'%{search}%'))
            )
        
        invoices = query.order_by(Invoice.created_at.desc()).all()
        
        return jsonify({
            'invoices': [invoice.to_dict() for invoice in invoices]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Create new invoice
@invoice_bp.route('/api/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['serial_number', 'device_name', 'customer_name', 'invoice_date', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create invoice
        new_invoice = Invoice(
            serial_number=data['serial_number'],
            device_name=data['device_name'],
            customer_name=data['customer_name'],
            customer_email=data.get('customer_email', ''),
            customer_phone=data.get('customer_phone', ''),
            invoice_date=datetime.strptime(data['invoice_date'], '%Y-%m-%d').date(),
            amount=float(data['amount']),
            payment_status=data.get('payment_status', 'pending'),
            payment_method=data.get('payment_method', ''),
            notes=data.get('notes', ''),
            file_path=data.get('file_path', ''),
            created_by=current_user_id
        )
        
        db.session.add(new_invoice)
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice created successfully',
            'invoice_id': new_invoice.id,
            'invoice': new_invoice.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Get single invoice
@invoice_bp.route('/api/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    try:
        current_user_id = get_jwt_identity()
        
        invoice = Invoice.query.filter_by(
            id=invoice_id,
            created_by=current_user_id
        ).first()
        
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
        
        return jsonify({
            'invoice': invoice.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Update invoice
@invoice_bp.route('/api/invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        invoice = Invoice.query.filter_by(
            id=invoice_id,
            created_by=current_user_id
        ).first()
        
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
        
        # Update fields if provided
        if 'device_name' in data:
            invoice.device_name = data['device_name']
        if 'customer_name' in data:
            invoice.customer_name = data['customer_name']
        if 'customer_email' in data:
            invoice.customer_email = data['customer_email']
        if 'customer_phone' in data:
            invoice.customer_phone = data['customer_phone']
        if 'invoice_date' in data:
            invoice.invoice_date = datetime.strptime(data['invoice_date'], '%Y-%m-%d').date()
        if 'amount' in data:
            invoice.amount = float(data['amount'])
        if 'payment_status' in data:
            invoice.payment_status = data['payment_status']
        if 'payment_method' in data:
            invoice.payment_method = data['payment_method']
        if 'notes' in data:
            invoice.notes = data['notes']
        
        invoice.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice updated successfully',
            'invoice': invoice.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Delete invoice
@invoice_bp.route('/api/invoices/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    try:
        current_user_id = get_jwt_identity()
        
        invoice = Invoice.query.filter_by(
            id=invoice_id,
            created_by=current_user_id
        ).first()
        
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
        
        db.session.delete(invoice)
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Get invoice statistics
@invoice_bp.route('/api/invoices/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        current_user_id = get_jwt_identity()
        
        # Total invoices
        total_invoices = Invoice.query.filter_by(created_by=current_user_id).count()
        
        # Pending invoices
        pending_invoices = Invoice.query.filter_by(
            created_by=current_user_id,
            payment_status='pending'
        ).count()
        
        # Paid invoices
        paid_invoices = Invoice.query.filter_by(
            created_by=current_user_id,
            payment_status='paid'
        ).count()
        
        # Total revenue (paid invoices)
        paid_total = db.session.query(db.func.sum(Invoice.amount)).filter_by(
            created_by=current_user_id,
            payment_status='paid'
        ).scalar() or 0
        
        # Pending revenue
        pending_total = db.session.query(db.func.sum(Invoice.amount)).filter_by(
            created_by=current_user_id,
            payment_status='pending'
        ).scalar() or 0
        
        return jsonify({
            'stats': {
                'total_invoices': total_invoices,
                'pending_invoices': pending_invoices,
                'paid_invoices': paid_invoices,
                'total_revenue': float(paid_total),
                'pending_revenue': float(pending_total)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500