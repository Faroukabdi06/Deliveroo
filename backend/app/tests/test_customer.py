import pytest
import json
import uuid
from app.models import Parcel, Address, ParcelStatus

def test_create_parcel(client, session, auth_headers):
    """Test creating a new parcel."""
    data = {
        "pickup_address": {
            "street": "123 Test St",
            "city": "Test City",
            "state": "Test State",
            "country": "Test Country",
            "postal_code": "12345",
            "lat": 1.234567,
            "lng": 2.345678
        },
        "delivery_address": {
            "street": "456 Delivery St",
            "city": "Delivery City",
            "state": "Delivery State",
            "country": "Delivery Country",
            "postal_code": "67890",
            "lat": 3.456789,
            "lng": 4.567890
        },
        "weight_kg": 5.0,
        "notes": "Fragile contents"
    }
    
    response = client.post('/api/v1/parcels', 
                          data=json.dumps(data),
                          content_type='application/json',
                          headers=auth_headers)
    
    assert response.status_code == 201
    assert 'tracking_id' in response.json
    assert response.json['status'] == "CREATED"
    assert 'estimated_delivery_date' in response.json
    
    # Check that parcel was actually created in the database
    parcel = Parcel.query.filter_by(tracking_id=response.json['tracking_id']).first()
    assert parcel is not None
    assert parcel.weight_kg == 5.0

def test_get_parcels(client, session, auth_headers, test_parcel):
    """Test getting a list of parcels for the authenticated user."""
    response = client.get('/api/v1/parcels', headers=auth_headers)
    
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) == 1
    assert response.json[0]['tracking_id'] == "TEST123"

def test_get_parcel(client, session, auth_headers, test_parcel):
    """Test getting a specific parcel."""
    response = client.get(f'/api/v1/parcels/{test_parcel.id}', headers=auth_headers)
    
    assert response.status_code == 200
    assert response.json['tracking_id'] == "TEST123"
    assert response.json['status'] == "CREATED"

def test_get_nonexistent_parcel(client, session, auth_headers):
    """Test getting a parcel that doesn't exist."""
    nonexistent_id = uuid.uuid4()
    response = client.get(f'/api/v1/parcels/{nonexistent_id}', headers=auth_headers)
    
    assert response.status_code == 404
    assert response.json['error'] == "Parcel not found"

def test_update_parcel(client, session, auth_headers, test_parcel):
    """Test updating a parcel's delivery address."""
    data = {
        "street": "Updated Delivery St",
        "city": "Updated City",
        "state": "Updated State",
        "country": "Updated Country",
        "postal_code": "99999",
        "lat": 5.678901,
        "lng": 6.789012
    }
    
    response = client.patch(f'/api/v1/parcels/{test_parcel.id}', 
                           data=json.dumps(data),
                           content_type='application/json',
                           headers=auth_headers)
    
    assert response.status_code == 200
    assert response.json['message'] == "Parcel updated successfully"
    
    # Check that the address was actually updated
    parcel = Parcel.query.get(test_parcel.id)
    assert parcel.delivery_address.street == "Updated Delivery St"
    assert parcel.delivery_address.city == "Updated City"

def test_cancel_parcel(client, session, auth_headers, test_parcel):
    """Test canceling a parcel."""
    response = client.post(f'/api/v1/parcels/{test_parcel.id}/cancel', headers=auth_headers)
    
    assert response.status_code == 200
    assert response.json['message'] == "Parcel cancelled successfully"
    
    # Check that the parcel status was updated
    parcel = Parcel.query.get(test_parcel.id)
    assert parcel.status == ParcelStatus.CANCELLED
    
    # Check that status history was added
    status_history = parcel.status_history[-1]
    assert status_history.status == ParcelStatus.CANCELLED

def test_cancel_delivered_parcel(client, session, auth_headers, test_parcel):
    """Test canceling a parcel that's already delivered."""
    # Set parcel status to DELIVERED
    test_parcel.status = ParcelStatus.DELIVERED
    session.commit()
    
    response = client.post(f'/api/v1/parcels/{test_parcel.id}/cancel', headers=auth_headers)
    
    assert response.status_code == 400
    assert "Cannot cancel" in response.json['error']