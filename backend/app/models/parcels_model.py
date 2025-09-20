import uuid
import enum
from datetime import datetime,timezone
from sqlalchemy import (
    Column, String, DateTime, Enum, Date, ForeignKey, Float
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.extensions import db



class ParcelStatus(enum.Enum):
    CREATED = "CREATED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Parcel(db.Model):
    __tablename__ = "parcels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tracking_id = Column(String, index=True, nullable=False, unique=True)

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
