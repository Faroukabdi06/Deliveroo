from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Parcel, Address, StatusHistory
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
        notes=data.get('notes'),
        status="CREATED",
        estimated_delivery_date=datetime.utcnow().date() + timedelta(days=2)
    )
    
    db.session.add(parcel)
    
    # Create initial status history
    status_history = StatusHistory(
        parcel_id=parcel.id,
        status="CREATED",
        user_id=current_user.id,
        notes=data.get('notes', 'Parcel created by customer')
    )
    
    db.session.add(status_history)
    db.session.commit()
    
    # Enhanced response with addresses and timestamps
    return jsonify({
        "success": True,
        "message": "Parcel created successfully",
        "data": {
            "id": str(parcel.id),
            "tracking_id": parcel.tracking_id,
            "status": parcel.status,
            "estimated_delivery_date": parcel.estimated_delivery_date.isoformat(),
            "pickup_address": {
                "street": pickup_address.street,
                "city": pickup_address.city,
                "country": pickup_address.country,
                "postal_code": pickup_address.postal_code,
                "lat": float(pickup_address.lat),
                "lng": float(pickup_address.lng)
            },
            "delivery_address": {
                "street": delivery_address.street,
                "city": delivery_address.city,
                "country": delivery_address.country,
                "postal_code": delivery_address.postal_code,
                "lat": float(delivery_address.lat),
                "lng": float(delivery_address.lng)
            },
            "created_at": parcel.created_at.isoformat(),
            "updated_at": parcel.updated_at.isoformat()
        }
    }), 201

@customer_bp.route('/parcels', methods=['GET'])
@jwt_required_customer
def get_parcels(current_user):
    parcels = Parcel.query.filter_by(customer_id=current_user.id).all()
    
    # Include status history in the response
    response_data = []
    for parcel in parcels:
        parcel_data = parcel_schema.dump(parcel)
        
        # Add status history to each parcel
        status_history = []
        for history in parcel.status_history:
            status_history.append({
                "status": history.status,
                "notes": history.notes,
                "timestamp": history.timestamp.isoformat(),
                "updated_by": history.user.name if history.user else "System"
            })
        
        parcel_data["status_history"] = status_history
        response_data.append(parcel_data)
    
    return jsonify({
        "success": True,
        "data": response_data
    }), 200

@customer_bp.route('/parcels/<uuid:parcel_id>', methods=['GET'])
@jwt_required_customer
def get_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    
    if not parcel:
        return jsonify({
            "success": False,
            "error": "Parcel not found"
        }), 404
    
    # Get parcel data with schema
    parcel_data = parcel_schema.dump(parcel)
    
    # Add detailed status history
    status_history = []
    for history in parcel.status_history:
        status_history.append({
            "status": history.status,
            "notes": history.notes,
            "timestamp": history.timestamp.isoformat(),
            "location": {
                "lat": float(history.lat) if history.lat else None,
                "lng": float(history.lng) if history.lng else None
            },
            "updated_by": history.user.name if history.user else "System"
        })
    
    parcel_data["status_history"] = status_history
    
    return jsonify({
        "success": True,
        "data": parcel_data
    }), 200

@customer_bp.route('/parcels/<uuid:parcel_id>', methods=['PATCH'])
@jwt_required_customer
def update_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    
    if not parcel:
        return jsonify({
            "success": False,
            "error": "Parcel not found"
        }), 404
        
    if parcel.status in ["DELIVERED", "CANCELLED"]:
        return jsonify({
            "success": False,
            "error": "Cannot update delivered or cancelled parcel"
        }), 400
        
    try:
        data = address_schema.load(request.json)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    
    # Update delivery address
    delivery_address = Address.query.get(parcel.delivery_address_id)
    for key, value in data.items():
        setattr(delivery_address, key, value)
    
    # Add status history entry for the update
    status_history = StatusHistory(
        parcel_id=parcel.id,
        status=parcel.status,  # Status remains the same
        user_id=current_user.id,
        notes="Delivery address updated by customer"
    )
    
    db.session.add(status_history)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Parcel updated successfully"
    }), 200

@customer_bp.route('/parcels/<uuid:parcel_id>/cancel', methods=['POST'])
@jwt_required_customer
def cancel_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    
    if not parcel:
        return jsonify({
            "success": False,
            "error": "Parcel not found"
        }), 404
        
    if parcel.status in ["DELIVERED", "CANCELLED"]:
        return jsonify({
            "success": False,
            "error": "Cannot cancel delivered or already cancelled parcel"
        }), 400
        
    # Update parcel status
    parcel.status = "CANCELLED"
    parcel.updated_at = datetime.utcnow()
    
    # Explicitly add parcel to session
    db.session.add(parcel)
    
    # Add status history
    status_history = StatusHistory(
        parcel_id=parcel.id,
        status="CANCELLED",
        user_id=current_user.id,
        notes="Parcel cancelled by customer"
    )
    
    db.session.add(status_history)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Parcel cancelled successfully"
    }), 200