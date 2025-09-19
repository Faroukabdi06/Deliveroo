from flask import Blueprint, jsonify, request
from app import db
from app.models.address import Address

bp = Blueprint('admin', __name__, url_prefix='/admin')

# Simple authentication (for development only)
def require_admin_auth():
    auth_header = request.headers.get('Authorization')
    if not auth_header or auth_header != 'Bearer admin-token':
        return jsonify({'error': 'Unauthorized'}), 401
    return None

@bp.route('/addresses', methods=['GET'])
def get_all_addresses():
    # Check authentication
    auth_error = require_admin_auth()
    if auth_error:
        return auth_error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    addresses = Address.query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'addresses': [address.to_dict() for address in addresses.items],
        'total': addresses.total,
        'pages': addresses.pages,
        'current_page': page
    })

@bp.route('/addresses/<int:id>', methods=['DELETE'])
def delete_address(id):
    # Check authentication
    auth_error = require_admin_auth()
    if auth_error:
        return auth_error
    
    address = Address.query.get_or_404(id)
    db.session.delete(address)
    db.session.commit()
    
    return jsonify({'message': 'Address deleted successfully'})

@bp.route('/stats', methods=['GET'])
def get_stats():
    # Check authentication
    auth_error = require_admin_auth()
    if auth_error:
        return auth_error
    
    total_addresses = Address.query.count()
    
    return jsonify({
        'total_addresses': total_addresses,
        'endpoints': {
            'addresses': '/admin/addresses',
            'delete_address': '/admin/addresses/<id>'
        }
    })
