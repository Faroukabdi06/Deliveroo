from flask import Blueprint, jsonify, request
from app import db
from app.models.address import Address

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return jsonify({'message': 'Deliveroo API'})

@bp.route('/addresses', methods=['GET'])
def get_addresses():
    addresses = Address.query.all()
    return jsonify([address.to_dict() for address in addresses])

@bp.route('/addresses', methods=['POST'])
def create_address():
    data = request.get_json()
    
    address = Address(
        street=data.get('street'),
        city=data.get('city'),
        county=data.get('county'),
        country=data.get('country'),
        postal_code=data.get('postal_code'),
        lat=data.get('lat'),
        lng=data.get('lng')
    )
    
    db.session.add(address)
    db.session.commit()
    
    return jsonify(address.to_dict()), 201

@bp.route('/addresses/<int:id>', methods=['GET'])
def get_address(id):
    address = Address.query.get_or_404(id)
    return jsonify(address.to_dict())

@bp.route('/addresses/<int:id>', methods=['PUT'])
def update_address(id):
    address = Address.query.get_or_404(id)
    data = request.get_json()
    
    address.street = data.get('street', address.street)
    address.city = data.get('city', address.city)
    address.county = data.get('county', address.county)
    address.country = data.get('country', address.country)
    address.postal_code = data.get('postal_code', address.postal_code)
    address.lat = data.get('lat', address.lat)
    address.lng = data.get('lng', address.lng)
    
    db.session.commit()
    
    return jsonify(address.to_dict())

@bp.route('/addresses/<int:id>', methods=['DELETE'])
def delete_address(id):
    address = Address.query.get_or_404(id)
    db.session.delete(address)
    db.session.commit()
    
    return jsonify({'message': 'Address deleted'})
