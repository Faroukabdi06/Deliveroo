# app/models/address.py

from app import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime


class Address(db.Model):
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

    def to_dict(self):
        return {
            "id": str(self.id),
            "street": self.street,
            "city": self.city,
            "county": self.county,
            "country": self.country,
            "postal_code": self.postal_code,
            "lat": self.lat,
            "lng": self.lng,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<Address {self.street}, {self.city}>"
