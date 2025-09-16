from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import uuid

db = SQLAlchemy()

class StatusHistory(db.Model):
    __tablename__ = 'status_history'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    parcel_id = db.Column(db.String(36), db.ForeignKey('parcels.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    notes = db.Column(db.Text)
    lat = db.Column(db.Numeric(10, 7))
    lng = db.Column(db.Numeric(10, 7))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
