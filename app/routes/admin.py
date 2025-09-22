# app/routes/admin.py

from flask import Blueprint, jsonify
from app.models.parcel import Parcel
from app import db
from datetime import date

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# Dummy decorator to bypass admin_required for now
def admin_required(func=None):
    """Placeholder until real auth is implemented."""
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_system_stats():
    """Provides an overview of system activity."""
    stats = {
        "total_parcels": db.session.query(Parcel.id).count(),
        "active_parcels": db.session.query(Parcel.id).filter(
            Parcel.status.notin_(["DELIVERED", "CANCELLED"])
        ).count(),
        "delivered_today": db.session.query(Parcel.id).filter(
            Parcel.status == "DELIVERED",
            db.func.date(Parcel.updated_at) == date.today()
        ).count(),
        "cancelled": db.session.query(Parcel.id).filter_by(status="CANCELLED").count(),
        "total_customers": 0  # ✅ placeholder until User model exists
    }
    return jsonify(stats), 200
