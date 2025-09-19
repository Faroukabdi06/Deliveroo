from app import db

class Address(db.Model):
    __tablename__ = 'addresses'
    
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    county = db.Column(db.String(50))
    country = db.Column(db.String(50), nullable=False)
    postal_code = db.Column(db.String(20))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    
    def to_dict(self):
        return {
            'id': self.id,
            'street': self.street,
            'city': self.city,
            'county': self.county,
            'country': self.country,
            'postal_code': self.postal_code,
            'lat': self.lat,
            'lng': self.lng
        }
    
    def __repr__(self):
        return f'<Address {self.street}, {self.city}>'
