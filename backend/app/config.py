import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///deliveroo.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecret")
    SECRET_KEY = os.getenv("SECRET_KEY", "devsecret")
    BCRYPT_LOG_ROUNDS = 12

class DevConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProdConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False
    BCRYPT_LOG_ROUNDS = 4
