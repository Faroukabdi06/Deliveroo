import uuid
from app.models import Notification

def test_get_notifications(client, customer_token, create_parcel):
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = client.get("api/notifications/get/notifications", headers=headers)
    assert response.status_code == 200

def test_mark_notification_read(client, customer_token, create_parcel, db_session):
    notif = Notification(user_id=create_parcel.customer_id, message="Test", type="PARCEL_UPDATE")
    db_session.add(notif)
    db_session.commit()

    headers = {"Authorization": f"Bearer {customer_token}"}
    response = client.patch(f"api/notifications/mark/{notif.id}/read", headers=headers)
    assert response.status_code == 200
    updated_notif = Notification.query.get(notif.id)
    assert updated_notif.is_read is True

def test_delete_notification(client, customer_token, create_parcel, db_session):
    notif = Notification(user_id=create_parcel.customer_id, message="Delete me", type="PARCEL_UPDATE")
    db_session.add(notif)
    db_session.commit()

    headers = {"Authorization": f"Bearer {customer_token}"}
    response = client.delete(f"api/notifications/delete/{notif.id}", headers=headers)
    assert response.status_code == 200
    assert Notification.query.get(notif.id) is None
