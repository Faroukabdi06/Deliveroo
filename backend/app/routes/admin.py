from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models import User, Parcel, StatusHistory, ParcelStatus, Notification, Address
from app.schemas import ParcelSchema, AddressRequestSchema
from datetime import datetime
from sqlalchemy import func

admin_bp = Blueprint("admin", __name__)
parcel_schema = ParcelSchema()
parcel_schema_many = ParcelSchema(many=True)
address_schema = AddressRequestSchema()

# Admin-only decorator
def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "ADMIN":
            return jsonify({"msg": "Admins only!"}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route("/parcels", methods=["GET"])
@jwt_required()
@admin_required
def list_parcels():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    status_filter = request.args.get("status")

    query = Parcel.query.order_by(Parcel.created_at.desc())
    if status_filter:
        try:
            status_enum = ParcelStatus(status_filter)
            query = query.filter(Parcel.status == status_enum)
        except ValueError:
            return jsonify({"success": False, "msg": "Invalid status filter"}), 400

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    parcels = pagination.items

    data = parcel_schema_many.dump(parcels)

    return jsonify({
        "success": True,
        "data": data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "total_pages": pagination.pages
        }
    }), 200

@admin_bp.route("/parcels/<uuid:parcel_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_parcel(parcel_id):
    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"success": False, "msg": "Parcel not found"}), 404

    parcel_data = parcel_schema.dump(parcel)
    return jsonify({"success": True, "data": parcel_data}), 200


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
        return jsonify({"success": False, "msg": "Parcel not found"}), 404

    try:
        status_enum = ParcelStatus(new_status)
    except ValueError:
        return jsonify({"success": False, "msg": "Invalid status"}), 400

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
    return jsonify({"success": True, "msg": f"Parcel updated to {status_enum.value}"}), 200


@admin_bp.route("/parcels/<uuid:parcel_id>", methods=["PATCH"])
@jwt_required()
@admin_required
def update_parcel_details(parcel_id):
    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"success": False, "msg": "Parcel not found"}), 404

    data = request.get_json()

    # Update pickup/delivery addresses
    if "pickup_address" in data:
        try:
            address_data = address_schema.load(data["pickup_address"])
        except Exception as e:
            return jsonify({"success": False, "errors": str(e)}), 400
        pickup_address = Address.query.get(parcel.pickup_address_id)
        for key, value in address_data.items():
            setattr(pickup_address, key, value)
        db.session.add(pickup_address)

    if "delivery_address" in data:
        try:
            address_data = address_schema.load(data["delivery_address"])
        except Exception as e:
            return jsonify({"success": False, "errors": str(e)}), 400
        delivery_address = Address.query.get(parcel.delivery_address_id)
        for key, value in address_data.items():
            setattr(delivery_address, key, value)
        db.session.add(delivery_address)

    if "estimated_delivery_date" in data:
        parcel.estimated_delivery_date = data["estimated_delivery_date"]

    db.session.commit()
    return jsonify({"success": True, "msg": "Parcel details updated"}), 200


@admin_bp.route("/parcels/<uuid:parcel_id>/cancel", methods=["POST"])
@jwt_required()
@admin_required
def cancel_parcel(parcel_id):
    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"success": False, "msg": "Parcel not found"}), 404

    parcel.status = ParcelStatus.CANCELLED

    history = StatusHistory(
        parcel_id=parcel.id,
        status=ParcelStatus.CANCELLED,
        actor_id=get_jwt_identity(),
        notes="Cancelled by admin"
    )
    db.session.add(history)

    notification = Notification(
        user_id=parcel.customer_id,
        message=f"Your parcel {parcel.tracking_id} was cancelled by admin",
        type="ALERT"
    )
    db.session.add(notification)

    db.session.commit()
    return jsonify({"success": True, "msg": f"Parcel {parcel.tracking_id} cancelled by admin"}), 200


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@admin_required
def system_stats():
    total_parcels = Parcel.query.count()
    active_parcels = Parcel.query.filter(Parcel.status.notin_([ParcelStatus.DELIVERED, ParcelStatus.CANCELLED])).count()
    delivered_today = Parcel.query.filter(
        Parcel.status == ParcelStatus.DELIVERED,
        func.date(Parcel.updated_at) == datetime.utcnow().date()
    ).count()
    cancelled = Parcel.query.filter(Parcel.status == ParcelStatus.CANCELLED).count()
    total_customers = User.query.filter(User.role == "CUSTOMER").count()

    return jsonify({
        "success": True,
        "total_parcels": total_parcels,
        "active_parcels": active_parcels,
        "delivered_today": delivered_today,
        "cancelled": cancelled,
        "total_customers": total_customers
    }), 200
