# app/tests/factories.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from app.models import User, Parcel, Address, StatusHistory, Notification, UserRole, ParcelStatus, NotificationType
from app.extensions import db, bcrypt
from datetime import date

def hash_password(password):
    return bcrypt.generate_password_hash(password).decode("utf-8")

def hash_security_answer(answer):
    return bcrypt.generate_password_hash(answer.lower().strip()).decode("utf-8")

class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    name = factory.Faker("name")
    email = factory.Faker("email")
    phone_number = factory.Faker("phone_number")
    _password_hash = factory.LazyFunction(lambda: hash_password("password123"))
    role = UserRole.CUSTOMER
    security_question = "What is your pet's name?"
    _security_answer_hash = factory.LazyFunction(lambda: hash_security_answer("Fluffy"))

class AddressFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Address
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    street = factory.Faker("street_address")
    city = factory.Faker("city")
    county = factory.Faker("state")
    country = factory.Faker("country")
    postal_code = factory.Faker("postcode")
    lat = factory.Faker("latitude")
    lng = factory.Faker("longitude")

class ParcelFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Parcel
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    customer = factory.SubFactory(UserFactory)
    pickup_address = factory.SubFactory(AddressFactory)
    delivery_address = factory.SubFactory(AddressFactory)
    weight_kg = 5.0
    description = "Test parcel"
    status = ParcelStatus.CREATED
    estimated_delivery_date = factory.LazyFunction(lambda: date.today())

class StatusHistoryFactory(SQLAlchemyModelFactory):
    class Meta:
        model = StatusHistory
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    parcel = factory.SubFactory(ParcelFactory)
    user = factory.SubFactory(UserFactory)
    status = ParcelStatus.IN_TRANSIT
    notes = "Parcel picked up"
    location_lat = 1.2345678
    location_lng = 36.1234567

class NotificationFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Notification
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    user = factory.SubFactory(UserFactory)
    message = "Parcel is on the way"
    type = NotificationType.PARCEL_UPDATE
    is_read = False
