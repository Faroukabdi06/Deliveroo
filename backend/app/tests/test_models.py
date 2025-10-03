# app/tests/test_models.py
import pytest
from app.models import User, Parcel, StatusHistory, Address, Notification, ParcelStatus, NotificationType
from .factories import UserFactory, ParcelFactory, StatusHistoryFactory, AddressFactory, NotificationFactory

def test_user_password_and_security(db_session):
    user = UserFactory()
    db_session.add(user)
    db_session.commit()

    # Password
    assert user.check_password("password123")
    assert not user.check_password("wrongpassword")

    # Security answer
    assert user.check_security_answer("Fluffy")
    assert not user.check_security_answer("WrongAnswer")

def test_parcel_creation(db_session):
    parcel = ParcelFactory()
    db_session.add(parcel)
    db_session.commit()

    assert parcel.customer is not None
    assert parcel.pickup_address is not None
    assert parcel.delivery_address is not None
    assert parcel.status == ParcelStatus.CREATED
    assert repr(parcel).startswith("<Parcel(tracking_id=")

def test_status_history(db_session):
    history = StatusHistoryFactory()
    db_session.add(history)
    db_session.commit()

    assert history.parcel is not None
    assert history.user is not None
    assert history.status == ParcelStatus.IN_TRANSIT
    assert history.notes == "Parcel picked up"

def test_address_creation(db_session):
    address = AddressFactory()
    db_session.add(address)
    db_session.commit()

    assert address.street is not None
    assert address.city is not None
    assert address.country is not None
    assert repr(address).startswith("<Address ")

def test_notification(db_session):
    notification = NotificationFactory()
    db_session.add(notification)
    db_session.commit()

    assert notification.user is not None
    assert notification.is_read is False
    assert notification.type == NotificationType.PARCEL_UPDATE
    assert repr(notification).startswith("<Notification(")
