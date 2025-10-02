from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User,UserRole, Parcel, Address, StatusHistory, ParcelStatus, Notification, NotificationType,_generate_tracking_id
from app.schemas import ParcelSchema, ParcelCreateSchema, AddressRequestSchema, UserSchema
from app.utilis.auth import jwt_required_customer
from datetime import datetime, timedelta
from marshmallow import ValidationError

customer_bp = Blueprint('customer', __name__)
parcel_schema = ParcelSchema()
parcel_create_schema = ParcelCreateSchema()
address_schema = AddressRequestSchema()
user_schema = UserSchema()


@customer_bp.route('/parcels', methods=['POST'])
@jwt_required_customer
def create_parcel(current_user):
    try:
        data = parcel_create_schema.load(request.json)
    except ValidationError as e:
        return jsonify({"success": False, "errors": e.messages}), 400

    # Create pickup and delivery addresses
    pickup_address = Address(**data['pickup_address'])
    delivery_address = Address(**data['delivery_address'])
    db.session.add(pickup_address)
    db.session.add(delivery_address)
    db.session.flush()  # ensure IDs are available

    # Create the parcel
    parcel = Parcel(
        tracking_id=_generate_tracking_id(),
        customer_id=current_user.id,
        pickup_address_id=pickup_address.id,
        delivery_address_id=delivery_address.id,
        weight_kg=data['weight_kg'],
        status=ParcelStatus.CREATED,
        estimated_delivery_date=datetime.utcnow().date() + timedelta(days=2)
    )
    db.session.add(parcel)
    db.session.flush()  # ensure parcel.id is available for status history

    # Add status history
    status_history = StatusHistory(
        parcel_id=parcel.id,
        status=ParcelStatus.CREATED,
        actor_id=current_user.id,
        notes=data.get('notes') or "Parcel created by customer"
    )
    db.session.add(status_history)

    # Notify all admins
    admins = User.query.filter_by(role=UserRole.ADMIN).all()
    for admin in admins:
        notif_admin = Notification(
            user_id=admin.id,
            message=f"New parcel {parcel.tracking_id} created by {current_user.name}",
            type=NotificationType.ALERT
        )
        db.session.add(notif_admin)

    # Notify the customer
    notif_customer = Notification(
        user_id=current_user.id,
        message=f"Your parcel {parcel.tracking_id} has been created successfully.",
        type=NotificationType.PARCEL_UPDATE
    )
    db.session.add(notif_customer)

    # Commit everything
    db.session.commit()

    parcel_data = parcel_schema.dump(parcel)
    return jsonify({"success": True, "data": parcel_data, "message": "Parcel created successfully"}), 201



@customer_bp.route('/parcels', methods=['GET'])
@jwt_required_customer
def get_parcels(current_user):
    parcels = Parcel.query.filter_by(customer_id=current_user.id).all()
    data = parcel_schema.dump(parcels, many=True)
    return jsonify({"success": True, "data": data}), 200


@customer_bp.route('/parcels/<uuid:parcel_id>', methods=['GET'])
@jwt_required_customer
def get_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    if not parcel:
        return jsonify({"success": False, "error": "Parcel not found"}), 404

    parcel_data = parcel_schema.dump(parcel)
    return jsonify({"success": True, "data": parcel_data}), 200


@customer_bp.route('/parcels/<uuid:parcel_id>', methods=['PATCH'])
@jwt_required_customer
def update_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    if not parcel:
        return jsonify({"success": False, "error": "Parcel not found"}), 404

    if parcel.status in [ParcelStatus.DELIVERED, ParcelStatus.CANCELLED]:
        return jsonify({"success": False, "error": "Cannot update delivered or cancelled parcel"}), 400

    try:
        data = address_schema.load(request.json)
    except ValidationError as e:
        return jsonify({"success": False, "errors": e.messages}), 400

    delivery_address = Address.query.get(parcel.delivery_address_id)
    for key, value in data.items():
        setattr(delivery_address, key, value)

    # Status history
    status_history = StatusHistory(
        parcel_id=parcel.id,
        status=parcel.status,
        actor_id=current_user.id,
        notes="Delivery address updated by customer"
    )
    db.session.add(status_history)
    
    # Notify customer
    notif_customer = Notification(
        user_id=current_user.id,
        message=f"Your parcel {parcel.tracking_id} delivery address has been updated.",
        type=NotificationType.PARCEL_UPDATE
    )
    db.session.add(notif_customer)

    # Commit all changes at once
    db.session.commit()

    # Dump the updated parcel
    parcel_data = parcel_schema.dump(parcel)

    return jsonify({
        "success": True,
        "message": "Parcel updated successfully",
        "data": parcel_data  # <-- include updated parcel
    }), 200



@customer_bp.route('/parcels/<uuid:parcel_id>/cancel', methods=['POST'])
@jwt_required_customer
def cancel_parcel(current_user, parcel_id):
    parcel = Parcel.query.filter_by(id=parcel_id, customer_id=current_user.id).first()
    if not parcel:
        return jsonify({"success": False, "error": "Parcel not found"}), 404

    if parcel.status in [ParcelStatus.DELIVERED, ParcelStatus.CANCELLED]:
        return jsonify({"success": False, "error": "Cannot cancel delivered or already cancelled parcel"}), 400

    parcel.status = ParcelStatus.CANCELLED
    parcel.updated_at = datetime.utcnow()
    db.session.add(parcel)

    status_history = StatusHistory(
        parcel_id=parcel.id,
        status=ParcelStatus.CANCELLED,
        actor_id=current_user.id,
        notes="Parcel cancelled by customer"
    )
    db.session.add(status_history)

    # Notify admins
    admins = User.query.filter_by(role=UserRole.ADMIN).all()
    for admin in admins:
        notif_admin = Notification(
            user_id=admin.id,
            message=f"Parcel {parcel.tracking_id} was cancelled by {current_user.name}",
            type=NotificationType.ALERT
        )
        db.session.add(notif_admin)

    # Notify customer
    notif_customer = Notification(
        user_id=current_user.id,
        message=f"Your parcel {parcel.tracking_id} has been cancelled.",
        type=NotificationType.PARCEL_UPDATE
    )
    db.session.add(notif_customer)

    db.session.commit()

    return jsonify({"success": True, "message": "Parcel cancelled successfully"}), 200
#Get userprofile
@customer_bp.route('/profile', methods=['GET'])
@jwt_required_customer
def get_profile(current_user):
    user_data = user_schema.dump(current_user)
    return jsonify({"success": True, "data": user_data}), 200


# PATCH customer profile
@customer_bp.route('/profile', methods=['PATCH'])
@jwt_required_customer
def update_profile(current_user):
    json_data = request.json
    if not json_data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    # Only allow certain fields to be updated
    allowed_fields = ['name', 'email', 'phone_number', 'password']
    for field in allowed_fields:
        if field in json_data:
            if field == 'password':
                current_user.password = json_data[field]
            else:
                setattr(current_user, field, json_data[field])

    current_user.updated_at = datetime.utcnow()
    db.session.add(current_user)
    db.session.commit()

    user_data = user_schema.dump(current_user)
    return jsonify({"success": True, "data": user_data, "message": "Profile updated successfully"}), 200
