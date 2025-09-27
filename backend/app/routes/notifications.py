from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Notification, User, UserRole

notifications_bp = Blueprint("notifications", __name__)

# Get notifications (works for both customers and admins)
@notifications_bp.get("/notifications")
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
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


# Mark a single notification as read
@notifications_bp.patch("/notifications/<uuid:notification_id>/read")
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()
    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first_or_404()

    notif.is_read = True
    db.session.commit()

    return jsonify({"message": "Notification marked as read"}), 200


# (Optional) Mark all notifications as read
@notifications_bp.patch("/notifications/read-all")
@jwt_required()
def mark_all_notifications_read():
    user_id = get_jwt_identity()
    updated = Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()

    return jsonify({"message": f"{updated} notifications marked as read"}), 200
