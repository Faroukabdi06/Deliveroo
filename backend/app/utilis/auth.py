# app/utils/auth.py
import uuid
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import User, UserRole

def jwt_required_customer(fn):
    """
    Protects routes so only CUSTOMER role can access.
    Passes current_user to the route function.
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        try:
            user_uuid = uuid.UUID(user_id)
        except (ValueError, TypeError):
            return {"msg": "Invalid user ID"}, 400

        user = User.query.get(user_uuid)
        if not user or user.role != UserRole.CUSTOMER:
            return {"msg": "Customer access only"}, 403
        return fn(user, *args, **kwargs)
    return wrapper


def jwt_required_admin(fn):
    """
    Protects routes so only ADMIN role can access.
    Passes current_user to the route function.
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        try:
            user_uuid = uuid.UUID(user_id)
        except (ValueError, TypeError):
            return {"msg": "Invalid user ID"}, 400

        user = User.query.get(user_uuid)
        if not user or user.role != UserRole.ADMIN:
            return {"msg": "Admin access only"}, 403
        return fn(user, *args, **kwargs)
    return wrapper


def get_current_user():
    """
    Helper to get the current user from JWT identity.
    """
    user_id = get_jwt_identity()
    try:
        user_uuid = uuid.UUID(user_id)
    except (ValueError, TypeError):
        return None
    return User.query.get(user_uuid)


def get_current_user_role():
    """
    Helper to get the current user's role from JWT claims.
    """
    claims = get_jwt()
    return claims.get("role")
