# tests/conftest.py
import pytest
import uuid
import random
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db as _db
from app.models import User, UserRole, Parcel, ParcelStatus, Address
from flask_jwt_extended import create_access_token

# -------------------------
# APP & DB FIXTURES
# -------------------------
@pytest.fixture(scope="session")
def app():
    app = create_app("testing")
    with app.app_context():
        yield app

@pytest.fixture(scope="session")
def db(app):
    _db.app = app
    _db.create_all()
    yield _db
    _db.drop_all()

@pytest.fixture(scope="function", autouse=True)
def db_session(db):
    yield db.session
    db.session.rollback()

@pytest.fixture(scope="function")
def client(app):
    with app.test_client() as client:
        yield client



@pytest.fixture
def customer_user(db):
    user = User(
        id=uuid.uuid4(),
        name="Customer User",
        email=f"customer_{uuid.uuid4().hex[:6]}@example.com",
        password="password123",
        role=UserRole.CUSTOMER,
        phone_number=f"09{random.randint(10000000, 99999999)}",  # unique phone per test
    )
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def admin_user(db):
    user = User(
        id=uuid.uuid4(),
        name="Admin User",
        email=f"admin_{uuid.uuid4().hex[:6]}@example.com",
        password="password123",
        role=UserRole.ADMIN,
        phone_number=f"12{random.randint(10000000, 99999999)}",  # unique phone per test
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def admin_token(admin_user, app):
    with app.app_context():
        return create_access_token(
            identity=str(admin_user.id),
            additional_claims={"role": "ADMIN"}
        )

@pytest.fixture
def customer_token(customer_user, app):
    with app.app_context():
        return create_access_token(
            identity=str(customer_user.id),
            additional_claims={"role": "CUSTOMER"}
        )

@pytest.fixture
def sample_address():
    return {
        "street": "123 Test St",
        "city": "Testville",
        "country": "Testland",
        "postal_code":"5679"
    }


@pytest.fixture
def create_address(db):
    addr = Address(
        id=uuid.uuid4(),
        street="123 Test St",
        city="Testville",
        country="Testland",
        postal_code="12345"
    )
    db.session.add(addr)
    db.session.commit()
    return addr

# -------------------------
# PARCEL FIXTURES
# -------------------------
@pytest.fixture
def create_parcel(db, customer_user, create_address):
    parcel = Parcel(
        id=uuid.uuid4(),
        tracking_id=str(uuid.uuid4())[:8],
        customer_id=customer_user.id,
        pickup_address_id=create_address.id,
        delivery_address_id=create_address.id,
        weight_kg=2.5,
        status=ParcelStatus.CREATED,
        estimated_delivery_date=datetime.utcnow().date() + timedelta(days=2),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(parcel)
    db.session.commit()
    return parcel
