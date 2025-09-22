# app/models/status_history.py

from app import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime


class StatusHistory(db.Model):
    __tablename__ = "status_history"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id = db.Column(UUID(as_uuid=True), db.ForeignKey("parcels.id"), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "parcel_id": str(self.parcel_id),
            "status": self.status,
            "timestamp": self.timestamp.isoformat(),
        }

    def __repr__(self):
        return f"<StatusHistory {self.id} - {self.status}>"
