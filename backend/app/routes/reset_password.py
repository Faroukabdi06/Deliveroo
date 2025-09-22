from zxcvbn import zxcvbn
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from models.reset_password_model import ResetPasswordToken
from models.user import User #change to your actual user model path
from app.extensions import get_db
from datetime import datetime, timedelta
from passlib.hash import bcrypt
import secrets




router = APIRouter(prefix="/auth", tags=["Auth"])

class EmailRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    new_password: str

@router.post("/request-reset")
def request_password_reset(payload: EmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        token = secrets.token_urlsafe(32)
        expires = datetime.utcnow() + timedelta(hours=1)

        db_token = ResetPasswordToken(
            user_id=user.id,
            token=token,
            expires_at=expires
        )
        db.add(db_token)
        db.commit()

        reset_link = f"https://frontend.com/reset-password/{token}"
        print(f"Reset password link: {reset_link}") #add email sending logic here

    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password/{token}")
def reset_password(token: str, payload: PasswordResetRequest, db: Session = Depends(get_db)):
    db_token = db.query(ResetPasswordToken).filter(ResetPasswordToken.token == token).first()

    result = zxcvbn(payload.new_password)
    if result['score'] < 3:
        raise HTTPException(status_code=400, detail="Password too weak.")
    
    if bcrypt.verify(payload.new_password, db_token.user.password):
        raise HTTPException(status_code=400, detail='New password must be different from the old one.')
    
    if not db_token or not db_token.is_valid():
        if db_token:
            db.delete(db_token)
            db.commit()
            
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password = bcrypt.hash(payload.new_password)
    db.delete(db_token)
    db.commit()

    return {"message": "Password reset successful."}
