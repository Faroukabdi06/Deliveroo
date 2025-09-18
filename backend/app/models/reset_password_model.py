
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime,timezone
from app.extensions import db

class ResetPasswordToken(db.Model):
    __tablename__ = 'reset_password_tokens'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="reset_tokens")

    def is_valid(self):
        return datetime.now(timezone.utc) < self.expires_at
