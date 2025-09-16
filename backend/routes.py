from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, User, Address, Parcel, StatusHistory
from datetime import datetime
import uuid

api = Blueprint('api', __name__)

# Tracking route
@api.route('/track/<tracking_id>', methods=['GET'])
def track_parcel(tracking_id):
    parcel = Parcel.query.filter_by(tracking_id=tracking_id).first_or_404()
    
    return jsonify({
        'tracking_id': parcel.tracking_id,
        'status': parcel.status,
        'estimated_delivery_date': parcel.estimated_delivery_date.isoformat() if parcel.estimated_delivery_date else None,
        'status_history': [{
            'status': history.status,
            'notes': history.notes,
            'timestamp': history.timestamp.isoformat()
        } for history in parcel.status_history]
    })