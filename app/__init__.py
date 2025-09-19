from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    
    # Make db accessible through app instance
    app.db = db
    
    # Register blueprints
    from app.routes.main import bp as main_bp
    app.register_blueprint(main_bp)
    
    # Import and register admin blueprint
    try:
        from app.routes.admin import bp as admin_bp
        app.register_blueprint(admin_bp)
    except ImportError:
        print("Admin routes not available")
    
    # Import models (ensure they are registered with SQLAlchemy)
    from app.models import address
    
    return app
