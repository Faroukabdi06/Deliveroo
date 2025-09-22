from flask import Blueprint, request, jsonify
from extensions import db
from models import User,UserRole
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,create_refresh_token


auth_bp = Blueprint('auth',__name__)

@auth_bp.route("/signup",methods=['POST'])
def signup():

    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone_number = data.get("phone_number")
    password = data.get("password")
    role_str = data.get("role","customer")

    try:
        role = UserRole(role_str.upper())
    except ValueError:
        return jsonify({"msg":"Invalid role"}),400

    if not email or not password:
        return jsonify({"msg": "email and password required"}), 400

    if User.query.filter_by(phone_number=phone_number).first():
    return jsonify({"msg": "phone number already exists"}), 400

    if User.query.filter_by(email = email).first():
        return jsonify({"msg":"email already exists"}),400
    try:
        user = User(name = name,
                    email = email,
                    phone_number = phone_number,
                    role = role
                )
        user.password = password
        db.session.add(user)
        db.session.commit()

        return jsonify({"msg": "user created", "user": user.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "error creating user"}), 500

@auth_bp.route("/login",methods = ["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg":"Invalid email or password"}),400

    additional_claims = {"role": user.role.value}
    access_token = create_access_token(identity = user.id,additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity = user.id,additional_claims=additional_claims)

    return jsonify({"access_token":access_token, "refresh_token":refresh_token}),200

