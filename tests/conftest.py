import pytest
from app import create_app, db

@pytest.fixture
def app():
    """Create application for the tests."""
    app = create_app('config.TestingConfig')
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Create a test client."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create a CLI runner."""
    return app.test_cli_runner()
