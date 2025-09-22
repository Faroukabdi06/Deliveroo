import uuid
from sqlalchemy.sql import func
from .extensions import db

def gen_uuid():
    return str(uuid.uuid4())

class StatusHistory(db.Model):
    __tablename__ = 'status_history'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
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