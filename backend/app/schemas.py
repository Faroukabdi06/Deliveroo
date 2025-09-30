from marshmallow import Schema, fields, validate, post_dump
from app.models import Parcel, Address, StatusHistory, ParcelStatus,User


class AddressSchema(Schema):
    id = fields.UUID()
    street = fields.Str()
    city = fields.Str()
    country = fields.Str()
    postal_code = fields.Str()
    lat = fields.Float()
    lng = fields.Float()


class StatusHistorySchema(Schema):
    status = fields.Method("get_status")
    notes = fields.Str()
    timestamp = fields.DateTime()
    updated_by = fields.Method("get_updated_by")
    location = fields.Method("get_location")

    def get_status(self, obj):
        return obj.status.name if isinstance(obj.status, ParcelStatus) else str(obj.status)

    def get_updated_by(self, obj):
        return obj.user.name if obj.user else "System"

    def get_location(self, obj):
        if obj.location_lat is not None and obj.location_lng is not None:
            return {"lat": float(obj.location_lat), "lng": float(obj.location_lng)}
        return None


class ParcelSchema(Schema):
    id = fields.UUID()
    tracking_id = fields.Str()
    status = fields.Method("get_status")
    notes = fields.Str()
    estimated_delivery_date = fields.Date()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    pickup_address = fields.Nested(AddressSchema)
    delivery_address = fields.Nested(AddressSchema)
    status_history = fields.List(fields.Nested(StatusHistorySchema))

    def get_status(self, obj):
        return obj.status.name if isinstance(obj.status, ParcelStatus) else str(obj.status)


class AddressRequestSchema(Schema):
    street = fields.Str(required=True)
    city = fields.Str(required=True)
    country = fields.Str(required=True)
    postal_code = fields.Str(required=True)
    lat = fields.Float(required=False, allow_none=True)
    lng = fields.Float(required=False, allow_none=True)


class ParcelCreateSchema(Schema):
    weight_kg = fields.Float(required=True, validate=validate.Range(min=0.1))
    pickup_address = fields.Nested(AddressRequestSchema, required=True)
    delivery_address = fields.Nested(AddressRequestSchema, required=True)

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("_password_hash", "_security_answer_hash")

