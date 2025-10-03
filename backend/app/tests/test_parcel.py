# tests/test_parcel.py
import uuid
from app.models import Parcel, ParcelStatus




def test_create_parcel_route(client, db_session, customer_user, admin_user):
    pickup_id = uuid.uuid4()
    delivery_id = uuid.uuid4()

    # insert dummy addresses
    pickup_address = Address(id=pickup_id, street="Pickup Street")
    delivery_address = Address(id=delivery_id, street="Delivery Street")
    db_session.add_all([pickup_address, delivery_address])
    db_session.commit()

    token = customer_user.get_access_token()

    res = client.post(
        "/parcels",
        json={
            "pickup_address_id": str(pickup_id),      # send str in JSON ✅
            "delivery_address_id": str(delivery_id),
            "weight_kg": 2.5,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 201
    data = res.get_json()
    assert data["pickup_address_id"] == str(pickup_id)
    assert data["delivery_address_id"] == str(delivery_id)
    assert data["weight_kg"] == 2.5



def test_update_parcel_status_admin(client, db_session, admin_user, customer_user, parcel_factory):
    parcel = parcel_factory(customer_id=customer_user.id)  # make sure id is uuid.UUID
    token = admin_user.get_access_token()

    res = client.put(
        f"/parcels/{parcel.id}/status",
        json={"status": "picked_up"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "picked_up"



def test_cancel_parcel_route(client, db_session, customer_user, parcel_factory):
    parcel = parcel_factory(customer_id=customer_user.id)
    token = customer_user.get_access_token()

    res = client.put(
        f"/parcels/{parcel.id}/cancel",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "CANCELLED"
