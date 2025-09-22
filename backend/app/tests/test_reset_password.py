import uuid
from datetime import datetime, timedelta
from app.models.reset_password_model import ResetPassword
from app.extensions import db

def test_create_reset_token_model(app):
    reset = ResetPassword(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        token="sometoken",
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.session.add(reset)
    db.session.commit()

    saved = ResetPassword.query.first()
    assert saved.token == "sometoken"
    assert saved.expires_at > datetime.utcnow()

def test_reset_password_routes(client, app):
    
    response = client.post("/reset-password", json={"email": "user@example.com"})
    assert response.status_code in [200, 201]  

    
    with app.app_context():
        reset = ResetPassword.query.first()
        assert reset is not None
        token = reset.token

    
    response = client.post("/reset-password/confirm", json={
        "token": token,
        "new_password": "newsecurepassword123"
    })
    assert response.status_code == 200
    assert response.get_json()["message"].lower().startswith("password updated")
