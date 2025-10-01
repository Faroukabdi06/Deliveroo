from flask import Blueprint, request, jsonify
import requests
import os

maps_bp = Blueprint("maps", __name__)

GOOGLE_API_KEY = os.getenv("AIzaSyAwysK0-Tr-LDnmh2VKBVUhg-NJh6FiB2U")  

@maps_bp.route("/distance", methods=["GET"])
def get_distance():
    origin = request.args.get("origin")
    destination = request.args.get("destination")

    if not origin or not destination:
        return jsonify({"error": "origin and destination are required"}), 400

    url = (
        f"https://maps.googleapis.com/maps/api/distancematrix/json?"
        f"units=metric&origins={origin}&destinations={destination}&key={GOOGLE_API_KEY}"
    )

    try:
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
