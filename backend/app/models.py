from sqlalchemy import (
    Column, String, Float, Date, DateTime, ForeignKey,
    Enum, Text, Numeric, Boolean, Index
)
from email_validator import validate_email, EmailNotValidError
from datetime import datetime, timezone
import uuid
import enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy_serializer import SerializerMixin
from app.extensions import db, bcrypt


# Helpers
def gen_uuid():
    return uuid.uuid4()


def _generate_tracking_id():
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_part = str(uuid.uuid4())[:4]
    return f"PD-{date_str}-{random_part}"


# Enums
class UserRole(enum.Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"


class ParcelStatus(enum.Enum):
    CREATED = "CREATED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class NotificationType(enum.Enum):
    INFO = "INFO"
    ALERT = "ALERT"
    PARCEL_UPDATE = "PARCEL_UPDATE"


# Models
class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid, unique=True, nullable=False)
    name = Column(String(100), nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    _password_hash = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), index=True)

    role = Column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.CUSTOMER, index=True)
    security_question = Column(String(255), nullable=True)
    _security_answer_hash = Column(String, nullable=True)

    # Relationships
    parcels = relationship("Parcel", back_populates="customer", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    status_updates = relationship("StatusHistory", back_populates="user", cascade="all, delete-orphan")

    serialize_rules = ('-_password_hash', '-_security_answer_hash')

    @property
    def password(self):
        raise AttributeError("Password is not readable")

    @password.setter
    def password(self, plain_password):
        self._password_hash = bcrypt.generate_password_hash(plain_password).decode("utf-8")

    def check_password(self, plain_password):
        return bcrypt.check_password_hash(self._password_hash, plain_password)

    def set_security_answer(self, answer: str):
        self._security_answer_hash = bcrypt.generate_password_hash(answer.lower().strip()).decode("utf-8")

    def check_security_answer(self, answer: str) -> bool:
        return bcrypt.check_password_hash(self._security_answer_hash, answer.lower().strip())


class Parcel(db.Model, SerializerMixin):
    __tablename__ = "parcels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    tracking_id = Column(String, index=True, unique=True, nullable=False, default=_generate_tracking_id)

    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    pickup_address_id = Column(UUID(as_uuid=True), ForeignKey("addresses.id"), nullable=False, index=True)
    delivery_address_id = Column(UUID(as_uuid=True), ForeignKey("addresses.id"), nullable=False, index=True)

    weight_kg = Column(Float)
    description = Column(String)

    status = Column(Enum(ParcelStatus, name="parcel_status"), default=ParcelStatus.CREATED, nullable=False, index=True)
    estimated_delivery_date = Column(Date, index=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    customer = relationship("User", back_populates="parcels")
    pickup_address = relationship("Address", foreign_keys=[pickup_address_id], back_populates="pickup_parcels")
    delivery_address = relationship("Address", foreign_keys=[delivery_address_id], back_populates="delivery_parcels")
    status_history = relationship("StatusHistory", back_populates="parcel", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Parcel(tracking_id={self.tracking_id}, status={self.status.name})>"


class StatusHistory(db.Model, SerializerMixin):
    __tablename__ = "status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id"), nullable=False, index=True)
    status = Column(Enum(ParcelStatus), nullable=False, index=True)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    notes = Column(Text)
    location_lat = Column(Numeric(10, 7))
    location_lng = Column(Numeric(10, 7))
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    parcel = relationship("Parcel", back_populates="status_history")
    user = relationship("User", back_populates="status_updates")


class Address(db.Model, SerializerMixin):
    __tablename__ = "addresses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    street = Column(String(100), nullable=False, index=True)
    city = Column(String(50), nullable=False, index=True)
    county = Column(String(50), index=True)
    country = Column(String(50), nullable=False, index=True)
    postal_code = Column(String(20), index=True)
    lat = Column(Numeric(10, 7), index=True)
    lng = Column(Numeric(10, 7), index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    pickup_parcels = relationship("Parcel", foreign_keys="Parcel.pickup_address_id", back_populates="pickup_address")
    delivery_parcels = relationship("Parcel", foreign_keys="Parcel.delivery_address_id", back_populates="delivery_address")

    def __repr__(self):
        return f"<Address {self.street}, {self.city}>"


class Notification(db.Model, SerializerMixin):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType, name="notification_type"), nullable=False, default=NotificationType.INFO, index=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(user_id={self.user_id}, type={self.type.name}, is_read={self.is_read})>"
