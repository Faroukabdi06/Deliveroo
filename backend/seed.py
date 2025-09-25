import random
from datetime import datetime, timedelta, timezone

from faker import Faker
from app import create_app
from app.extensions import db
from app.models import (
    User, Address, Parcel, StatusHistory, Notification,
    UserRole, ParcelStatus, NotificationType
)

fake = Faker()
app = create_app("development")


@app.cli.command("seed")
def seed():
    with app.app_context():
        print("Seeding database...")

        # Clear existing data
        Notification.query.delete()
        StatusHistory.query.delete()
        Parcel.query.delete()
        Address.query.delete()
        User.query.delete()
        db.session.commit()

        # Create users
        users = []

        # Admin
        admin = User(
            name="Admin User",
            email="admin@example.com",
            phone_number=fake.unique.msisdn(),
            role=UserRole.ADMIN,
        )
        admin.password = "admin123"
        users.append(admin)
        db.session.add(admin)

        # Customers
        for _ in range(5):
            u = User(
                name=fake.name(),
                email=fake.unique.email(),
                phone_number=fake.unique.msisdn(),
                role=UserRole.CUSTOMER,
            )
            u.password = "password123"
            users.append(u)
            db.session.add(u)

        db.session.commit()

        # Create addresses
        addresses = []
        for _ in range(10):
            addr = Address(
                street=fake.street_address(),
                city=fake.city(),
                county=fake.state(),
                country="Kenya",
                postal_code=fake.postcode(),
                lat=round(random.uniform(-1.3, -1.0), 7),
                lng=round(random.uniform(36.7, 37.0), 7),
            )
            addresses.append(addr)
            db.session.add(addr)

        db.session.commit()

        # Create parcels
        parcels = []
        for _ in range(8):
            customer = random.choice([u for u in users if u.role == UserRole.CUSTOMER])
            p = Parcel(
                customer=customer,
                pickup_address=random.choice(addresses),
                delivery_address=random.choice(addresses),
                weight_kg=round(random.uniform(0.5, 10), 2),
                description=fake.sentence(nb_words=4),
                status=random.choice(list(ParcelStatus)),
                estimated_delivery_date=datetime.now(timezone.utc) + timedelta(days=random.randint(1, 5)),
            )
            parcels.append(p)
            db.session.add(p)

        db.session.commit()

        # Create status history
        for p in parcels:
            for _ in range(random.randint(1, 3)):
                sh = StatusHistory(
                    parcel=p,
                    status=random.choice(list(ParcelStatus)),
                    actor_id=random.choice(users).id,  # fixed
                    notes=fake.sentence(),
                    location_lat=round(random.uniform(-1.3, -1.0), 7),
                    location_lng=round(random.uniform(36.7, 37.0), 7),
                    timestamp=datetime.now(timezone.utc)
                )
                db.session.add(sh)

        db.session.commit()

        # Create notifications
        for u in users:
            for _ in range(2):
                notif = Notification(
                    user=u,
                    message=fake.sentence(),
                    type=random.choice(list(NotificationType)),
                    is_read=random.choice([True, False]),
                )
                db.session.add(notif)

        db.session.commit()
        print("✅ Database seeded successfully!")


if __name__ == "__main__":
    # Allows running directly: python seed.py
    with app.app_context():
        seed()
