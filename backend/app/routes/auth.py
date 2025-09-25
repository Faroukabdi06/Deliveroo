from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, UserRole
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from email_validator import validate_email, EmailNotValidError
from marshmallow import ValidationError
from datetime import datetime

auth_bp = Blueprint('auth', __name__)


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    user = User.query.get(identity)
    if not user:
        return jsonify({"success": False, "msg": "User not found"}), 404

    additional_claims = {"role": user.role.value}
    new_access_token = create_access_token(identity=identity, additional_claims=additional_claims)

    return jsonify({
        "success": True,
        "access_token": new_access_token,
        "expires_in": 3600  # access token lifetime in seconds
    }), 200


@auth_bp.route("/signup", methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone_number = data.get("phone_number")
    password = data.get("password")
    role_str = data.get("role", "CUSTOMER")
    security_question = data.get("security_question")
    security_answer = data.get("security_answer")

    # Validates role
    try:
        role = UserRole[role_str.upper()]
    except KeyError:
        return jsonify({"success": False, "msg": "Invalid role"}), 400

    # Validates required fields
    if not email or not password or not name or not phone_number:
        return jsonify({"success": False, "msg": "Name, email, phone number, and password are required"}), 400

    # Validates email format
    try:
        email = validate_email(email).email
    except EmailNotValidError as e:
        return jsonify({"success": False, "msg": str(e)}), 400

    # Password strength
    if len(password) < 8:
        return jsonify({"success": False, "msg": "Password must be at least 8 characters"}), 400

    # Checks duplicates
    if User.query.filter_by(phone_number=phone_number).first():
        return jsonify({"success": False, "msg": "Phone number already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "msg": "Email already exists"}), 400

    try:
        user = User(
            name=name,
            email=email,
            phone_number=phone_number,
            role=role,
            security_question=security_question
        )
        user.password = password  # hashes internally
        if security_answer:
            user.set_security_answer(security_answer)

        db.session.add(user)
        db.session.commit()

        return jsonify({"success": True, "msg": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "msg": f"Error creating user: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "msg": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "msg": "Invalid email or password"}), 400

    additional_claims = {"role": user.role.value}
    access_token = create_access_token(identity=user.id, additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=user.id, additional_claims=additional_claims)

    # update last_login timestamp
    user.last_login = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token
        "role": user.role,
    }), 200

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "msg": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.security_question:
        # Security: avoid revealing if email exists
        return jsonify({"success": True, "msg": "If the user exists, security question is sent"}), 200

    return jsonify({"success": True, "security_question": user.security_question}), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    answer = data.get("security_answer")
    new_password = data.get("new_password")

    if not email or not answer or not new_password:
        return jsonify({"success": False, "msg": "Email, security answer, and new password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"success": False, "msg": "User not found"}), 404

    if not user.check_security_answer(answer):
        return jsonify({"success": False, "msg": "Incorrect security answer"}), 400

    if len(new_password) < 8:
        return jsonify({"success": False, "msg": "Password must be at least 8 characters"}), 400

    user.password = new_password
    db.session.commit()

    return jsonify({"success": True, "msg": "Password has been reset successfully"}), 200
