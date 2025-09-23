from flask import Flask
from .config import DevConfig, ProdConfig, TestingConfig
from .extensions import db, migrate, bcrypt, jwt, cors


def create_app(config_name="development"):
    app = Flask(__name__)

    # Map string names to config classes
    config_dict = {
        "development": DevConfig,
        "production": ProdConfig,
        "testing": TestingConfig,
    }

    # Pick the right config
    app.config.from_object(config_dict[config_name])

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # register blueprints here later (auth, customer, parcels, etc.)

    return app
