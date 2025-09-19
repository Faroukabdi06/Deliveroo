import pytest
import json

def test_index(client):
    response = client.get('/')
    assert response.status_code == 200
    assert response.get_json() == {'message': 'Deliveroo API'}

def test_create_address(client):
    data = {
        'street': '123 Test St',
        'city': 'Test City',
        'country': 'Test Country',
        'postal_code': '12345'
    }
    
    response = client.post('/addresses', 
                         data=json.dumps(data),
                         content_type='application/json')
    
    assert response.status_code == 201
    result = response.get_json()
    assert result['street'] == '123 Test St'
    assert result['city'] == 'Test City'
    assert result['country'] == 'Test Country'

def test_get_addresses(client):
    # First create an address
    data = {
        'street': '456 Another St',
        'city': 'Another City',
        'country': 'Another Country',
        'postal_code': '67890'
    }
    
    client.post('/addresses', 
               data=json.dumps(data),
               content_type='application/json')
    
    # Now get all addresses
    response = client.get('/addresses')
    assert response.status_code == 200
    addresses = response.get_json()
    assert len(addresses) > 0
    assert addresses[0]['street'] == '456 Another St'
