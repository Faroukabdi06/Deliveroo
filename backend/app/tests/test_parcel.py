import uuid
from app.models.parcels_model import ParcelStatus, Parcel
from app.extensions import db

def test_create_parcel_model(app):
    parcel = Parcel(
        id=uuid.uuid4(),
        description="Test Parcel",
        status=ParcelStatus.CREATED
    )
    db.session.add(parcel)
    db.session.commit()

    saved = Parcel.query.first()
    assert saved.description == "Test Parcel"
    assert saved.status == ParcelStatus.CREATED

def test_parcel_routes(client, app):
    
    response = client.post("/parcels", json={
        "description": "My Parcel",
        "status": "CREATED"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert "id" in data
    assert data["status"] == "CREATED"

    
    response = client.get("/parcels")
    assert response.status_code == 200
    parcels = response.get_json()
    assert len(parcels) > 0

   
    parcel_id = parcels[0]["id"]
    response = client.get(f"/parcels/{parcel_id}")
    assert response.status_code == 200
    assert response.get_json()["id"] == parcel_id
