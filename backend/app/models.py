import uuid
import enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy_serialzer import SerializerMixin
from .extensions import db,bcrypt
from datetime import datetime
from email_validator import validate_email, EmailNotValidError

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
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")



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

