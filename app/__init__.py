# app/__init__.py

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Initialize extensions globally
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
cors = CORS()


def create_app(config_class=None):
    """Creates and configures the Flask application."""
    app = Flask(__name__, instance_relative_config=True)

    if config_class is None:
        # Load the default configuration
        app.config.from_mapping(
            SECRET_KEY=os.environ.get("SECRET_KEY", "dev"),
            SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL", "sqlite:///dev.db"),
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", "dev-jwt")  # ✅ JWT secret key
        )
    else:
        app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    with app.app_context():
        # Import models so SQLAlchemy knows them
        from . import models

        # Import and register blueprints
        from .routes.admin import admin_bp
        app.register_blueprint(admin_bp)

    return app
