from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Parcel, Address, StatusHistory, ParcelStatus
from app.schemas import ParcelSchema, ParcelCreateSchema, AddressRequestSchema
from app.utils.auth import jwt_required_customer
from app.utils.helpers import generate_tracking_id
from datetime import datetime, timedelta
import uuid

customer_bp = Blueprint('customer', __name__)
parcel_schema = ParcelSchema()
parcel_create_schema = ParcelCreateSchema()
address_schema = AddressRequestSchema()

@customer_bp.route('/parcels', methods=['POST'])
@jwt_required_customer
def create_parcel(current_user):
    try:
        data = parcel_create_schema.load(request.json)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    # Create addresses
    pickup_address = Address(**data['pickup_address'])
    delivery_address = Address(**data['delivery_address'])
    
    db.session.add(pickup_address)
    db.session.add(delivery_address)
    db.session.flush()  # To get the IDs
    
    # Create parcel
    parcel = Parcel(
        tracking_id=generate_tracking_id(),
        customer_id=current_user.id,
        pickup_address_id=pickup_address.id,
        delivery_address_id=delivery_address.id,
        weight_kg=data['weight_kg'],
        dimensions=data.get('dimensions'),
        estimated_delivery_date=datetime.utcnow().date() + timedelta(days=2)
    )
    
    db.session.add(parcel)
    
    # Create initial status history
    status_history = StatusHistory(
        parcel_id=parcel.id,
        status=ParcelStatus.CREATED,
        actor_id=current_user.id,
        notes=data.get('notes', 'Parcel created by customer')
    )
    
    db.session.add(status_history)
    db.session.commit()
    
    return jsonify({
        "id": str(parcel.id),
        "tracking_id": parcel.tracking_id,
        "status": parcel.status.value,
        "estimated_delivery_date": parcel.estimated_delivery_date.isoformat()
    }), 201

@customer_bp.route('/parcels', methods=['GET'])
@jwt_required_customer
def get_parcels(current_user):
    parcels = Parcel.query.filter_by(customer_id=current_user.id).all()
    return jsonify(parcel_schema.dump(parcels, many=True)), 200

@customer_bp.route('/parcels/<uuid:parcel_id>', methods=['GET'])
@jwt_required_customer
def get_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    
    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404
        
    return jsonify(parcel_schema.dump(parcel)), 200

@customer_bp.route('/parcels/<uuid:parcel_id>', methods=['PATCH'])
@jwt_required_customer
def update_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    
    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404
        
    if parcel.status in [ParcelStatus.DELIVERED, ParcelStatus.CANCELLED]:
        return jsonify({"error": "Cannot update delivered or cancelled parcel"}), 400
        
    try:
        data = address_schema.load(request.json)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    # Update delivery address
    delivery_address = Address.query.get(parcel.delivery_address_id)
    for key, value in data.items():
        setattr(delivery_address, key, value)
    
    db.session.commit()
    
    return jsonify({"message": "Parcel updated successfully"}), 200

@customer_bp.route('/parcels/<uuid:parcel_id>/cancel', methods=['POST'])
@jwt_required_customer
def cancel_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    
    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404
        
    if parcel.status in [ParcelStatus.DELIVERED, ParcelStatus.CANCELLED]:
        return jsonify({"error": "Cannot cancel delivered or already cancelled parcel"}), 400
        
    # Update parcel status
    parcel.status = ParcelStatus.CANCELLED
    parcel.updated_at = datetime.utcnow()
    
    # Add status history
    status_history = StatusHistory(
        parcel_id=parcel.id,
        status=ParcelStatus.CANCELLED,
        actor_id=current_user.id,
        notes="Parcel cancelled by customer"
    )
    
    db.session.add(status_history)
    db.session.commit()
    
    return jsonify({"message": "Parcel cancelled successfully"}), 200