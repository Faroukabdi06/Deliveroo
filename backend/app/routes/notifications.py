from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Notification, User
import uuid

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("/get/notifications")
@jwt_required()
def get_notifications():
    user_id_str = get_jwt_identity()
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    notifications = (
        Notification.query.filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "id": str(n.id),
            "message": n.message,
            "type": n.type.value,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifications
    ]), 200


@notifications_bp.patch("/mark/<uuid:notification_id>/read")
@jwt_required()
def mark_notification_read(notification_id):
    user_id_str = get_jwt_identity()
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    notif.is_read = True
    db.session.commit()

    return jsonify({"message": "Notification marked as read"}), 200


@notifications_bp.patch("/mark/read-all")
@jwt_required()
def mark_all_notifications_read():
    user_id_str = get_jwt_identity()
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    updated = Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()

    return jsonify({"message": f"{updated} notifications marked as read"}), 200


@notifications_bp.delete("/delete/<uuid:notification_id>")
@jwt_required()
def delete_notification(notification_id):
    user_id_str = get_jwt_identity()
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    db.session.delete(notif)
    db.session.commit()

    return jsonify({"message": "Notification deleted"}), 200


@notifications_bp.delete("/delete/all")
@jwt_required()
def delete_all_notifications():
    user_id_str = get_jwt_identity()
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    deleted_count = Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()

    return jsonify({"message": f"{deleted_count} notifications deleted"}), 200
