from flask import Flask
from app.config import DevConfig, ProdConfig, TestingConfig
from app.extensions import db, migrate, bcrypt, jwt, cors


from app.routes.auth import auth_bp
from app.routes.parcels import parcels_bp
from app.routes.customer import customer_bp
from app.routes.admin import admin_bp
from app.routes.notifications import notifications_bp
from app.routes.maps import maps_bp


from . import models


def create_app(config_name="development"):
    """Application factory"""

    app = Flask(__name__)

    # Configs
    config_dict = {
        "development": DevConfig,
        "production": ProdConfig,
        "testing": TestingConfig,
    }
    app.config.from_object(config_dict[config_name])

    # Initializing extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app,
    resources={r"/*": {"origins": "http://localhost:5173","https://deliveroo-4lqr.onrender.com/"}},
    supports_credentials=True,
    methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allow_headers=["Content-Type", "Authorization"])


    # blueprints registration
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(customer_bp, url_prefix="/api/customer")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(parcels_bp, url_prefix="/api/parcels")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(maps_bp, url_prefix="/api/maps")


    @app.route("/")
    def index():
        return {"msg": "API is running"}, 200

    return app
