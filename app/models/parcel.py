# app/models/parcel.py

from app import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime


class Parcel(db.Model):
    __tablename__ = "parcels"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = db.Column(db.String(50), default="PENDING", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pickup_address_id = db.Column(UUID(as_uuid=True), db.ForeignKey("addresses.id"), nullable=False)
    delivery_address_id = db.Column(UUID(as_uuid=True), db.ForeignKey("addresses.id"), nullable=False)

    history = db.relationship(
        "StatusHistory",
        backref="parcel",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "pickup_address_id": str(self.pickup_address_id),
            "delivery_address_id": str(self.delivery_address_id),
        }

    def __repr__(self):
        return f"<Parcel {self.id}>"
