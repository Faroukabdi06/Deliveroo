import uuid
from sqlalchemy.sql import func
from .extensions import db

def gen_uuid():
    return str(uuid.uuid4())

class User:
    pass