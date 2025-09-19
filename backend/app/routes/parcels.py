from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.parcels_model import Parcel, ParcelStatus
import uuid

parcels_bp = Blueprint("parcels", __name__, url_prefix="/parcels")


def parcel_to_dict(parcel: Parcel):
    return {
        "id": str(parcel.id),
        "tracking_id": parcel.tracking_id,
        "customer_id": str(parcel.customer_id),
        "pickup_address_id": str(parcel.pickup_address_id),
        "delivery_address_id": str(parcel.delivery_address_id),
        "weight_kg": parcel.weight_kg,
        "dimensions": parcel.dimensions,
        "status": parcel.status.value,
        "estimated_delivery_date": str(parcel.estimated_delivery_date) if parcel.estimated_delivery_date else None,
        "created_at": parcel.created_at.isoformat(),
        "updated_at": parcel.updated_at.isoformat(),
    }

@parcels_bp.route("", methods=["POST"])
def create_parcel():
    data = request.get_json()
    try:
        new_parcel = Parcel(
            tracking_id=data.get("tracking_id", str(uuid.uuid4())),
            customer_id=uuid.UUID(data["customer_id"]),
            pickup_address_id=uuid.UUID(data["pickup_address_id"]),
            delivery_address_id=uuid.UUID(data["delivery_address_id"]),
            weight_kg=data.get("weight_kg"),
            dimensions=data.get("dimensions"),
        )
        db.session.add(new_parcel)
        db.session.commit()
        return jsonify(parcel_to_dict(new_parcel)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@parcels_bp.route("/<uuid:parcel_id>/destination", methods=["PUT"])
def update_destination(parcel_id):
    data = request.get_json()
    parcel = Parcel.query.get(parcel_id)

    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404

    if parcel.status not in [ParcelStatus.CREATED, ParcelStatus.PICKED_UP]:
        return jsonify({"error": "Cannot update destination after delivery has started"}), 400

    new_address_id = data.get("delivery_address_id")
    if not new_address_id:
        return jsonify({"error": "delivery_address_id is required"}), 400

    parcel.delivery_address_id = uuid.UUID(new_address_id)
    db.session.commit()
    return jsonify(parcel_to_dict(parcel)), 200


@parcels_bp.route("/<uuid:parcel_id>/cancel", methods=["PUT"])
def cancel_parcel(parcel_id):
    parcel = Parcel.query.get(parcel_id)

    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404

    if parcel.status not in [ParcelStatus.CREATED, ParcelStatus.PICKED_UP]:
        return jsonify({"error": "Parcel cannot be cancelled after delivery has started"}), 400

    parcel.status = ParcelStatus.CANCELLED
    db.session.commit()
    return jsonify(parcel_to_dict(parcel)), 200


@parcels_bp.route("/<uuid:parcel_id>", methods=["GET"])
def get_parcel(parcel_id):
    parcel = Parcel.query.get(parcel_id)
    if not parcel:
        return jsonify({"error": "Parcel not found"}), 404
    return jsonify(parcel_to_dict(parcel)), 200



@parcels_bp.route("", methods=["GET"])
def list_parcels():
    customer_id = request.args.get("customer_id")
    query = Parcel.query
    if customer_id:
        query = query.filter_by(customer_id=uuid.UUID(customer_id))
    parcels = query.all()
    return jsonify([parcel_to_dict(p) for p in parcels]), 200
