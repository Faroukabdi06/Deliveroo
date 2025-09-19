import pytest
from app.models.address import Address

def test_address_creation(app):
    with app.app_context():
        address = Address(
            street="123 Main St",
            city="Springfield",
            county="County",
            country="USA",
            postal_code="12345",
            lat=40.7128,
            lng=-74.0060
        )
        app.db.session.add(address)
        app.db.session.commit()
        
        assert address.id is not None
        assert address.street == "123 Main St"
        assert address.city == "Springfield"
        assert address.country == "USA"

def test_address_to_dict(app):
    with app.app_context():
        address = Address(
            street="123 Main St",
            city="Springfield",
            county="County",
            country="USA",
            postal_code="12345",
            lat=40.7128,
            lng=-74.0060
        )
        app.db.session.add(address)
        app.db.session.commit()
        
        address_dict = address.to_dict()
        assert address_dict['street'] == "123 Main St"
        assert address_dict['city'] == "Springfield"
        assert address_dict['country'] == "USA"
        assert address_dict['lat'] == 40.7128

def test_address_without_coordinates(app):
    with app.app_context():
        address = Address(
            street="456 Oak Ave",
            city="Metropolis",
            country="USA",
            postal_code="67890"
        )
        app.db.session.add(address)
        app.db.session.commit()
        
        assert address.id is not None
        assert address.street == "456 Oak Ave"
        assert address.city == "Metropolis"
        assert address.lat is None
        assert address.lng is None
