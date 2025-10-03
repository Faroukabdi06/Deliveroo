# tests/test_admin.py
import json
import uuid
from datetime import datetime, timedelta
from app.models import Parcel, ParcelStatus, StatusHistory, Notification, User

def test_admin_list_parcels(client, admin_token, create_parcel):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("api/admin/parcels", headers=headers)
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert len(data["data"]) >= 1

    # Check that serialized status is string
    parcel_data = data["data"][0]
    assert isinstance(parcel_data["status"], str)
    assert parcel_data["tracking_id"] == create_parcel.tracking_id

def test_admin_get_parcel(client, admin_token, create_parcel):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get(f"api/admin/parcels/{create_parcel.id}", headers=headers)
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert data["data"]["tracking_id"] == create_parcel.tracking_id
    assert data["data"]["status"] == create_parcel.status.name  # schema returns string

def test_admin_update_parcel_status(client, admin_token, create_parcel, db_session):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "status": "PICKED_UP",
        "notes": "Picked up",
        "location": {"lat": 1.23, "lng": 4.56}
    }

    response = client.post(f"api/admin/parcels/{create_parcel.id}/status", headers=headers, json=payload)
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert "Parcel updated to PICKED_UP" in data["msg"]

    # Check model updated
    parcel = Parcel.query.get(create_parcel.id)
    assert parcel.status == ParcelStatus.PICKED_UP

    # Check status history
    history = StatusHistory.query.filter_by(parcel_id=create_parcel.id).first()
    assert history is not None
    assert history.status == ParcelStatus.PICKED_UP
    assert history.notes == "Picked up"
    assert float(history.location_lat) == 1.23
    assert float(history.location_lng) == 4.56


    # Check notification created
    notification = Notification.query.filter_by(user_id=parcel.customer_id).first()
    assert notification is not None
    assert "PICKED_UP" in notification.message

def test_admin_cancel_parcel(client, admin_token, create_parcel):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post(f"api/admin/parcels/{create_parcel.id}/cancel", headers=headers)
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert "cancelled by admin" in data["msg"]

    parcel = Parcel.query.get(create_parcel.id)
    assert parcel.status == ParcelStatus.CANCELLED

    history = StatusHistory.query.filter_by(parcel_id=create_parcel.id, status=ParcelStatus.CANCELLED).first()
    assert history is not None

    notification = Notification.query.filter_by(user_id=parcel.customer_id).first()
    assert notification is not None
    assert "cancelled by admin" in notification.message

def test_admin_stats(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("api/admin/stats", headers=headers)
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert "total_parcels" in data
    assert "created" in data
    assert "delivered" in data
