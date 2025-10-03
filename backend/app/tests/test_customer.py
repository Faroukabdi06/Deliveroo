# tests/test_customer.py

import json
from app.models import Parcel, ParcelStatus

def test_customer_create_parcel(client, customer_token, sample_address):
    headers = {"Authorization": f"Bearer {customer_token}"}
    payload = {
        "pickup_address": sample_address,
        "delivery_address": sample_address,
        "weight_kg": 3.5
    }

    response = client.post("/api/customer/parcels", headers=headers, json=payload)
    data = response.get_json()

    assert response.status_code == 201
    assert data["success"] is True
    assert "tracking_id" in data["data"]
