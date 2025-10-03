# tests/test_auth.py
import pytest
import uuid
from app.models import User, UserRole
from app.extensions import db


def create_user(email=None, password="password123", role=UserRole.CUSTOMER):
    email = email or f"user{uuid.uuid4().hex}@test.com"
    user = User(
        name="Test User",
        email=email,
        phone_number=f"07{uuid.uuid4().int % 10**8:08d}",
        role=role,
        security_question="What is your pet's name?"
    )
    user.password = password
    user.set_security_answer("Fluffy")
    db.session.add(user)
    db.session.commit()
    return user

# Signup Tests
@pytest.mark.parametrize("role", ["customer", "admin"])
def test_signup(client, role):
    """Test signup with valid data."""
    unique_email = f"user{uuid.uuid4().hex}@test.com"  # use a valid domain
    unique_phone = f"07{uuid.uuid4().int % 10**8:08d}"

    payload = {
        "name": "Test User",
        "email": unique_email,
        "phone_number": unique_phone,
        "password": "password123",
        "role": "CUSTOMER" if role == "customer" else "ADMIN",
        "security_question": "What is your pet's name?",
        "security_answer": "Fluffy"
    }

    response = client.post("/api/auth/signup", json=payload)
    data = response.get_json()
    print(data)  # Debug any 400 response

    assert response.status_code == 201
    assert data["success"] is True
    assert "User created successfully" in data["msg"]

def test_signup_invalid_email(client):
    payload = {
        "name": "Test User",
        "email": "invalid-email",
        "phone_number": "0712345678",
        "password": "password123",
        "role": "CUSTOMER",
        "security_question": "What is your pet's name?",
        "security_answer": "Fluffy"
    }
    response = client.post("/api/auth/signup", json=payload)
    data = response.get_json()
    assert response.status_code == 400
    assert data["success"] is False
    assert "email" in data["msg"].lower()  # any email-validator message

# Login Tests
def test_login_success(client):
    user = create_user()
    payload = {"email": user.email, "password": "password123"}
    response = client.post("/api/auth/login", json=payload)
    data = response.get_json()
    assert response.status_code == 200
    assert data["success"] is True
    assert "access_token" in data
    assert "refresh_token" in data

def test_login_failure(client):
    user = create_user()
    payload = {"email": user.email, "password": "wrongpassword"}
    response = client.post("/api/auth/login", json=payload)
    data = response.get_json()
    assert response.status_code == 400
    assert data["success"] is False
    assert "invalid email or password" in data["msg"].lower()

# Forgot Password Tests
def test_forgot_password_existing_user(client):
    user = create_user()
    payload = {"email": user.email}
    response = client.post("/api/auth/forgot-password", json=payload)
    data = response.get_json()
    assert response.status_code == 200
    if "security_question" in data:
        assert data["security_question"] == user.security_question
    else:
        assert data["success"] is True

def test_forgot_password_nonexistent_user(client):
    payload = {"email": "nonexistent@test.com"}
    response = client.post("/api/auth/forgot-password", json=payload)
    data = response.get_json()
    assert response.status_code == 200
    assert "security_question" not in data

# Reset Password Tests
def test_reset_password_success(client):
    user = create_user()
    payload = {
        "email": user.email,
        "security_answer": "Fluffy",
        "new_password": "newpassword123"
    }
    response = client.post("/api/auth/reset-password", json=payload)
    data = response.get_json()
    assert response.status_code == 200
    assert data["success"] is True
    assert "Password has been reset" in data["msg"]

def test_reset_password_failure_wrong_answer(client):
    user = create_user()
    payload = {
        "email": user.email,
        "security_answer": "WrongAnswer",
        "new_password": "newpassword123"
    }
    response = client.post("/api/auth/reset-password", json=payload)
    data = response.get_json()
    assert response.status_code == 400
    assert data["success"] is False
    assert "incorrect security answer" in data["msg"].lower()
