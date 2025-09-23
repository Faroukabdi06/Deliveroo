import uuid
import enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy_serializer import SerializerMixin
from .extensions import db,bcrypt
from datetime import datetime,timezone
from email_validator import validate_email, EmailNotValidError
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Enum, Text, Numeric





def gen_uuid():
    return uuid.uuid4()

class UserRole(enum.Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"

class User(db.Model,SerializerMixin):
    __tablename__ = "users"

    id =  db.Column(UUID(as_uuid=True),
                   primary_key=True,
                   default=gen_uuid,
                   unique=True,
                   nullable=False)
    name = db.Column(db.String(100),nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone_number = db.Column(db.String(20),nullable=False,unique=True)
    _password_hash = db.Column(db.String, nullable=False)

    created_at = db.Column(db.DateTime,default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,default=datetime.utcnow,onupdate = datetime.utcnow)
    role = db.Column(
        db.Enum(UserRole,name = "user_role"),
        nullable = False,
        default = UserRole.CUSTOMER
    )
    parcels = relationship("Parcel", back_populates="customer", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    status_updates = relationship("StatusHistory", back_populates="user", cascade="all, delete-orphan")



    serialize_rules = ('-_password_hash',)



    def set_email(self, email: str):
        try:
            valid = validate_email(email)
            self.email = valid.email
        except EmailNotValidError as e:
            raise ValueError(f"Invalid email: {str(e)}")

    @property
    def password(self):
        raise AttributeError ("Password is not readable")

    @password.setter
    def password(self,plain_password):
        self._password_hash = bcrypt.generate_password_hash(plain_password).decode('utf-8')

    def check_password(self,plain_password):
        return bcrypt.check_password_hash(self._password_hash,plain_password)


def generate_tracking_id():

    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_part = str(uuid.uuid4())[:4]
    return f"PD-{date_str}-{random_part}"

class ParcelStatus(enum.Enum):
    CREATED = "CREATED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Parcel(db.Model,SerializerMixin):
    __tablename__ = "parcels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tracking_id = Column(String, index=True, unique=True, nullable=False, default=generate_tracking_id)

    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False,index=True)
    pickup_address_id = Column(UUID(as_uuid=True), ForeignKey("addresses.id"), nullable=False)
    delivery_address_id = Column(UUID(as_uuid=True), ForeignKey("addresses.id"), nullable=False,index=True)

    weight_kg = Column(Float, nullable=True)
    description = Column(String, nullable=True)

    status = Column(Enum(ParcelStatus), default=ParcelStatus.CREATED, nullable=False,index=True)

    estimated_delivery_date = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    customer = relationship("User", back_populates="parcels")
    pickup_address = relationship("Address", foreign_keys=[pickup_address_id] , back_populates="pickup_parcels")
    delivery_address = relationship("Address", foreign_keys=[delivery_address_id], back_populates='delivery_parcels')
    status_history = relationship("StatusHistory", back_populates="parcel", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Parcel(tracking_id={self.tracking_id}, status={self.status.name})>"




class StatusHistory(db.Model,SerializerMixin):
    __tablename__ = 'status_history'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    parcel_id = db.Column(UUID(as_uuid=True), db.ForeignKey('parcels.id'), nullable=False)
    status = db.Column(db.Enum(ParcelStatus), nullable=False)
    actor_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    notes = db.Column(db.Text)
    location_lat = db.Column(db.Numeric(10, 7))
    location_lng = db.Column(db.Numeric(10, 7))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    parcel = relationship("Parcel", back_populates="status_history")
    user = relationship("User", back_populates="status_updates")


# app/models/address.py

from app import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime


class Address(db.Model,SerializerMixin):
    __tablename__ = "addresses"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    street = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    county = db.Column(db.String(50))
    country = db.Column(db.String(50), nullable=False)
    postal_code = db.Column(db.String(20))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    pickup_parcels = db.relationship(
        "Parcel",
        foreign_keys="Parcel.pickup_address_id",
        backref="pickup_address",
        lazy=True
    )

    delivery_parcels = db.relationship(
        "Parcel",
        foreign_keys="Parcel.delivery_address_id",
        backref="delivery_address",
        lazy=True
    )

    def __repr__(self):
        return f"<Address {self.street}, {self.city}>"