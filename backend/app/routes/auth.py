from flask import Blueprint, request, jsonify
from extensions import db
from models import User, UserRole
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)

# Create Blueprint for authentication routes
auth_bp = Blueprint('auth', __name__)

# Refresh Access Token
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)  # ensures only refresh tokens can call this
def refresh():
    """
    Generate a new access token using a valid refresh token.
    """
    # Get user ID from refresh token
    identity = get_jwt_identity()
    user = User.query.get(identity)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Attach role to new token so we can authorize later
    additional_claims = {"role": user.role.value}
    new_access_token = create_access_token(
        identity=identity,
        additional_claims=additional_claims
    )

    return jsonify(access_token=new_access_token), 200


# User Signup
@auth_bp.route("/signup", methods=['POST'])
def signup():
    """
    Register a new user.
    - Validates role, email, phone_number.
    - Hashes password before saving.
    - Does NOT issue tokens (only confirms creation).
    """
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone_number = data.get("phone_number")
    password = data.get("password")
    role_str = data.get("role", "customer")  # default role = CUSTOMER

    # Ensure role is valid
    try:
        role = UserRole(role_str.upper())
    except ValueError:
        return jsonify({"msg": "Invalid role"}), 400

    # Ensure required fields are present
    if not email or not password:
        return jsonify({"msg": "email and password required"}), 400

    # Check uniqueness for phone and email
    if User.query.filter_by(phone_number=phone_number).first():
        return jsonify({"msg": "phone number already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "email already exists"}), 400

    try:
        # Create new user
        user = User(
            name=name,
            email=email,
            phone_number=phone_number,
            role=role
        )
        user.password = password  # triggers password setter (hashing)
        db.session.add(user)
        db.session.commit()

        # Confirmation only (no tokens returned here)
        return jsonify({"msg": "User created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "error creating user"}), 500


# User Login
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return access + refresh tokens.
    - Verifies email & password.
    - Adds role as claim inside tokens.
    """
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    # Check user existence
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid email or password"}), 400

    # Attach user role into token claims
    additional_claims = {"role": user.role.value}

    # Generate access & refresh tokens
    access_token = create_access_token(identity=user.id, additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=user.id, additional_claims=additional_claims)

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200
