from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models import User, Parcel, StatusHistory, ParcelStatus, Notification, Address
from datetime import datetime
from sqlalchemy import func

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")

# Restrict routes to admins
def admin_required(fn):
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "ADMIN":
            return jsonify({"msg": "Admins only!"}), 403
        return fn(*args, **kwargs)

    return wrapper


# List All Parcels
@admin_bp.route("/parcels", methods=["GET"])
@jwt_required()
@admin_required
def list_all_parcels():
    parcels = Parcel.query.all()
    return jsonify([{
        "id": str(p.id),
        "tracking_id": p.tracking_id,
        "status": p.status.value,
        "customer_id": str(p.customer_id),
        "created_at": p.created_at.isoformat()
    } for p in parcels]), 200


# Get Parcel Details
@admin_bp.route("/parcels/<uuid:parcel_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_parcel_details(parcel_id):
    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"msg": "Parcel not found"}), 404

    return jsonify({
        "id": str(parcel.id),
        "tracking_id": parcel.tracking_id,
        "status": parcel.status.value,
        "customer_id": str(parcel.customer_id),
        "pickup_address": parcel.pickup_address.to_dict() if parcel.pickup_address else None,
        "delivery_address": parcel.delivery_address.to_dict() if parcel.delivery_address else None,
        "status_history": [{
            "status": h.status.value,
            "actor_id": str(h.actor_id),
            "notes": h.notes,
            "location": {"lat": float(h.location_lat) if h.location_lat else None,
                         "lng": float(h.location_lng) if h.location_lng else None},
            "timestamp": h.timestamp.isoformat()
        } for h in parcel.status_history]
    }), 200


# Update Parcel Status

@admin_bp.route("/parcels/<uuid:parcel_id>/status", methods=["POST"])
@jwt_required()
@admin_required
def update_parcel_status(parcel_id):
    data = request.get_json()
    new_status = data.get("status")
    notes = data.get("notes", "")
    location = data.get("location", {})

    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"msg": "Parcel not found"}), 404

    try:
        status_enum = ParcelStatus(new_status)
    except ValueError:
        return jsonify({"msg": "Invalid status"}), 400

    # Update parcel status
    parcel.status = status_enum

    # Log history
    history = StatusHistory(
        parcel_id=parcel.id,
        status=status_enum,
        actor_id=get_jwt_identity(),
        notes=notes,
        location_lat=location.get("lat"),
        location_lng=location.get("lng"),
        timestamp=datetime.utcnow()
    )
    db.session.add(history)

    # Notify customer
    notification = Notification(
        user_id=parcel.customer_id,
        message=f"Your parcel {parcel.tracking_id} is now {status_enum.value}",
        type="PARCEL_UPDATE"
    )
    db.session.add(notification)

    db.session.commit()
    return jsonify({"msg": f"Parcel {parcel.tracking_id} updated to {status_enum.value}"}), 200


# Update Parcel Details

@admin_bp.route("/parcels/<uuid:parcel_id>", methods=["PATCH"])
@jwt_required()
@admin_required
def update_parcel_details(parcel_id):
    data = request.get_json()
    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"msg": "Parcel not found"}), 404

    # Allow updates for address and delivery date
    if "delivery_address_id" in data:
        parcel.delivery_address_id = data["delivery_address_id"]
    if "pickup_address_id" in data:
        parcel.pickup_address_id = data["pickup_address_id"]
    if "estimated_delivery_date" in data:
        parcel.estimated_delivery_date = data["estimated_delivery_date"]

    db.session.commit()
    return jsonify({"msg": "Parcel details updated"}), 200



# Cancel Parcel (Admin Override)

@admin_bp.route("/parcels/<uuid:parcel_id>/cancel", methods=["POST"])
@jwt_required()
@admin_required
def cancel_parcel(parcel_id):
    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"msg": "Parcel not found"}), 404

    parcel.status = ParcelStatus.CANCELLED

    # Log history
    history = StatusHistory(
        parcel_id=parcel.id,
        status=ParcelStatus.CANCELLED,
        actor_id=get_jwt_identity(),
        notes="Cancelled by admin"
    )
    db.session.add(history)

    # Notify customer
    notification = Notification(
        user_id=parcel.customer_id,
        message=f"Your parcel {parcel.tracking_id} was cancelled by admin",
        type="ALERT"
    )
    db.session.add(notification)

    db.session.commit()
    return jsonify({"msg": f"Parcel {parcel.tracking_id} cancelled by admin"}), 200


# System Stats / Dashboard

@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@admin_required
def system_stats():
    total_parcels = Parcel.query.count()
    active_parcels = Parcel.query.filter(Parcel.status != ParcelStatus.DELIVERED,
                                         Parcel.status != ParcelStatus.CANCELLED).count()
    delivered_today = Parcel.query.filter(
        Parcel.status == ParcelStatus.DELIVERED,
        func.date(Parcel.updated_at) == datetime.utcnow().date()
    ).count()
    cancelled = Parcel.query.filter(Parcel.status == ParcelStatus.CANCELLED).count()
    total_customers = User.query.filter(User.role == "CUSTOMER").count()

    return jsonify({
        "total_parcels": total_parcels,
        "active_parcels": active_parcels,
        "delivered_today": delivered_today,
        "cancelled": cancelled,
        "total_customers": total_customers
    }), 200
