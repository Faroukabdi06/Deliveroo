# conftest.py

import pytest
from app import create_app, db

@pytest.fixture(scope='session')
def app():
    """Create a session-wide application for the tests."""
    app = create_app()  # Assumes create_app can be called without args
    
    # Override configuration for testing
    app.config.update({
        "TESTING": True,
        # Use an in-memory SQLite database for fast, isolated tests
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        # Disable CSRF protection in forms for tests
        "WTF_CSRF_ENABLED": False, 
    })

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture()
def client(app):
    """Create a test client for the application."""
    return app.test_client()

@pytest.fixture()
def runner(app):
    """Create a CLI runner for the application."""
    return app.test_cli_runner()