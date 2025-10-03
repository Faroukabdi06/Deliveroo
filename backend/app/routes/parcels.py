from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Parcel, ParcelStatus, Notification, NotificationType, User,UserRole
import uuid
from flask_jwt_extended import jwt_required, get_jwt_identity

parcels_bp = Blueprint("parcels", __name__)


def parcel_to_dict(parcel: Parcel):
    return {
        "id": str(parcel.id),
        "tracking_id": parcel.tracking_id,
        "customer_id": str(parcel.customer_id),
        "pickup_address_id": str(parcel.pickup_address_id),
        "delivery_address_id": str(parcel.delivery_address_id),
        "weight_kg": parcel.weight_kg,
        "status": parcel.status.value,
        "estimated_delivery_date": str(parcel.estimated_delivery_date) if parcel.estimated_delivery_date else None,
        "created_at": parcel.created_at.isoformat(),
        "updated_at": parcel.updated_at.isoformat(),
    }


@parcels_bp.route("", methods=["POST"])
@jwt_required()
def create_parcel():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role != UserRole.CUSTOMER:
        return jsonify({"error": "Only customers can create parcels"}), 403


    data = request.get_json()
    if not data.get("pickup_address_id") or not data.get("delivery_address_id"):
        return jsonify({"error": "pickup_address_id and delivery_address_id are required"}), 400
    try:
        pickup = uuid.UUID(data["pickup_address_id"])
        delivery = uuid.UUID(data["delivery_address_id"])

        if pickup == delivery:
            return jsonify({"error": "Pickup and delivery cannot be the same"}), 400

        if not data.get("weight_kg") or data["weight_kg"] <= 0:
            return jsonify({"error": "weight_kg must be a positive number"}), 400


        new_parcel = Parcel(
            tracking_id=data.get("tracking_id", str(uuid.uuid4())),
            customer_id=user.id,
            pickup_address_id=pickup,
            delivery_address_id=delivery,
            weight_kg=data.get("weight_kg"),
        )
        db.session.add(new_parcel)


        # Notify admins of new parcel
        admins = User.query.filter(User.role == UserRole.ADMIN).all()
        for admin in admins:
            notif = Notification(
                user_id=admin.id,
                message=f"New parcel {new_parcel.tracking_id} created by customer {new_parcel.customer_id}",
                type=NotificationType.ALERT,
            )
            db.session.add(notif)
        # Notify customer
        notif_customer = Notification(
            user_id=new_parcel.customer_id,
            message=f"Your parcel {new_parcel.tracking_id} has been created successfully.",
            type=NotificationType.PARCEL_UPDATE,
        )
        db.session.add(notif_customer)
        db.session.commit()

        return jsonify(parcel_to_dict(new_parcel)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@parcels_bp.route("/<uuid:parcel_id>/destination", methods=["PUT"])
@jwt_required()
def update_destination(parcel_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    data = request.get_json()
    parcel = Parcel.query.get(parcel_id)

    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404

    if user.role != UserRole.CUSTOMER or parcel.customer_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    if parcel.status not in [ParcelStatus.CREATED, ParcelStatus.PICKED_UP]:
        return jsonify({"error": "Cannot update destination after delivery has started"}), 400

    new_address_id = data.get("delivery_address_id")
    if not new_address_id:
        return jsonify({"error": "delivery_address_id is required"}), 400

    try:
        new_uuid = uuid.UUID(new_address_id)
    except ValueError:
        return jsonify({"error": "Invalid UUID format"}), 400

    if new_uuid == parcel.pickup_address_id:
        return jsonify({"error": "Pickup and delivery cannot be the same"}), 400

    try:
        parcel.delivery_address_id = new_uuid

        # Notify customer
        notif_customer = Notification(
            user_id=parcel.customer_id,
            message=f"Your parcel {parcel.tracking_id} destination has been updated.",
            type=NotificationType.PARCEL_UPDATE
        )
        db.session.add(notif_customer)

        admins = User.query.filter(User.role == UserRole.ADMIN).all()
        for admin in admins:
            notif_admin = Notification(
                user_id=admin.id,
                message=f"Parcel {parcel.tracking_id} destination updated by customer {parcel.customer_id}",
                type=NotificationType.ALERT
            )
            db.session.add(notif_admin)

        db.session.commit()
        return jsonify(parcel_to_dict(parcel)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@parcels_bp.route("/<uuid:parcel_id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_parcel(parcel_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    parcel = Parcel.query.get(parcel_id)

    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404

    if parcel.customer_id != user.id:
        return jsonify({"error": "Only the customer can cancel their parcel"}), 403

    if parcel.status not in [ParcelStatus.CREATED, ParcelStatus.PICKED_UP]:
        return jsonify({"error": "Parcel cannot be cancelled after delivery has started"}), 400

    try:
        parcel.status = ParcelStatus.CANCELLED

        # Notify admins of cancellation
        admins = User.query.filter(User.role == UserRole.ADMIN).all()
        for admin in admins:
            notif = Notification(
                user_id=admin.id,
                message=f"Parcel {parcel.tracking_id} was cancelled by customer {parcel.customer_id}",
                type=NotificationType.ALERT
            )
            db.session.add(notif)

        # Notify customer
        customer_notif = Notification(
                    user_id=parcel.customer_id,
                    message=f"Your parcel {parcel.tracking_id} has been cancelled.",
                    type=NotificationType.PARCEL_UPDATE,
                )
        db.session.add(customer_notif)
        db.session.commit()

        return jsonify(parcel_to_dict(parcel)), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@parcels_bp.route("/<uuid:parcel_id>/status", methods=["PUT"])
@jwt_required()
def update_parcel_status(parcel_id):
    """Admin updates parcel status -> customer gets notified"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role != UserRole.ADMIN:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    new_status = data.get("status")

    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404

    if not new_status:
        return jsonify({"error": "status is required"}), 400

    try:
        new_status_enum = ParcelStatus[new_status.upper()]
    except KeyError:
        return jsonify({"error": "Invalid status"}), 400

    valid_transitions = {
        ParcelStatus.CREATED: [ParcelStatus.PICKED_UP, ParcelStatus.CANCELLED],
        ParcelStatus.PICKED_UP: [ParcelStatus.IN_TRANSIT, ParcelStatus.CANCELLED],
        ParcelStatus.IN_TRANSIT: [ParcelStatus.OUT_FOR_DELIVERY],
        ParcelStatus.OUT_FOR_DELIVERY: [ParcelStatus.DELIVERED],
        ParcelStatus.DELIVERED: [],
        ParcelStatus.CANCELLED: []
    }

    if new_status_enum not in valid_transitions[parcel.status]:
        return jsonify({
            "error": f"Cannot change status from {parcel.status.value} to {new_status_enum.value}"
        }), 400

    try:
        parcel.status = new_status_enum

        # Notify customer of status change
        notif = Notification(
            user_id=parcel.customer_id,
            message=f"Your parcel {parcel.tracking_id} status updated to {parcel.status.value}",
            type=NotificationType.PARCEL_UPDATE,
        )
        db.session.add(notif)
        db.session.commit()

        return jsonify(parcel_to_dict(parcel)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@parcels_bp.route("/<uuid:parcel_id>", methods=["GET"])
@jwt_required()
def get_parcel(parcel_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404

    if user.role != UserRole.ADMIN and parcel.customer_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify(parcel_to_dict(parcel)), 200


@parcels_bp.route("", methods=["GET"])
@jwt_required()
def list_parcels():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error":"user not found"}),404

    query = Parcel.query
    if user.role == UserRole.CUSTOMER:
        query = query.filter_by(customer_id=user.id)

    parcels =query.all()
    return jsonify([parcel_to_dict(p) for p in parcels]), 200
