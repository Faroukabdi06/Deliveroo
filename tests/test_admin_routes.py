import pytest
import json

def test_admin_get_addresses_unauthorized(client):
    response = client.get('/admin/addresses')
    assert response.status_code == 401
    assert response.get_json() == {'error': 'Unauthorized'}

def test_admin_get_addresses_authorized(client):
    # First create some addresses
    addresses_data = [
        {
            'street': '123 Main St',
            'city': 'Springfield',
            'country': 'USA',
            'postal_code': '12345'
        },
        {
            'street': '456 Oak Ave',
            'city': 'Metropolis',
            'country': 'USA',
            'postal_code': '67890'
        }
    ]
    
    for address_data in addresses_data:
        client.post('/addresses', 
                   data=json.dumps(address_data),
                   content_type='application/json')
    
    # Now try to access admin endpoint with authorization
    response = client.get('/admin/addresses', 
                         headers={'Authorization': 'Bearer admin-token'})
    assert response.status_code == 200
    result = response.get_json()
    assert 'addresses' in result
    assert 'total' in result
    assert 'pages' in result
    assert 'current_page' in result
    assert len(result['addresses']) >= 2

def test_admin_delete_address(client):
    # First create an address
    address_data = {
        'street': '123 Main St',
        'city': 'Springfield',
        'country': 'USA',
        'postal_code': '12345'
    }
    
    create_response = client.post('/addresses', 
                                data=json.dumps(address_data),
                                content_type='application/json')
    address_id = create_response.get_json()['id']
    
    # Try to delete without authorization
    delete_response = client.delete(f'/admin/addresses/{address_id}')
    assert delete_response.status_code == 401
    
    # Try to delete with authorization
    delete_response = client.delete(f'/admin/addresses/{address_id}',
                                  headers={'Authorization': 'Bearer admin-token'})
    assert delete_response.status_code == 200
    assert delete_response.get_json() == {'message': 'Address deleted successfully'}
    
    # Verify the address is gone
    get_response = client.get(f'/addresses/{address_id}')
    assert get_response.status_code == 404

def test_admin_stats(client):
    # Try to access without authorization
    response = client.get('/admin/stats')
    assert response.status_code == 401
    
    # Try to access with authorization
    response = client.get('/admin/stats',
                         headers={'Authorization': 'Bearer admin-token'})
    assert response.status_code == 200
    result = response.get_json()
    assert 'total_addresses' in result
    assert 'endpoints' in result
