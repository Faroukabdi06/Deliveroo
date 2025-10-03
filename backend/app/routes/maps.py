from flask import Blueprint, request, jsonify
import requests

maps_bp = Blueprint("maps", __name__)

OSRM_URL = "http://router.project-osrm.org/route/v1/driving"

@maps_bp.route("/distance", methods=["GET"])
def get_distance():
    origin = request.args.get("origin")      
    destination = request.args.get("destination")  

    if not origin or not destination:
        return jsonify({"error": "origin and destination are required"}), 400

    try:
        # Parse lat/lng
        o_lat, o_lng = map(float, origin.split(","))
        d_lat, d_lng = map(float, destination.split(","))

        # Request route with geometry (geojson)
        url = f"{OSRM_URL}/{o_lng},{o_lat};{d_lng},{d_lat}?overview=full&geometries=geojson"

        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if data.get("code") != "Ok":
            return jsonify({"error": "OSRM request failed", "details": data}), 500

        route = data["routes"][0]

        # Distance & Duration
        distance_km = round(route["distance"] / 1000, 2)
        duration_min = round(route["duration"] / 60, 2)

        # Geometry (list of [lat, lng])
        coordinates = [[lat, lng] for lng, lat in route["geometry"]["coordinates"]]

        return jsonify({
            "distance": f"{distance_km} km",
            "duration": f"{duration_min} mins",
            "coordinates": coordinates,  # for frontend Map polyline
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@maps_bp.route("/reverse-geocode", methods=["GET"])
def reverse_geocode():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    if not lat or not lng:
        return jsonify({"error": "lat and lng are required"}), 400

    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": lat,
            "lon": lng,
            "format": "json",
        }
        response = requests.get(url, params=params, headers={"User-Agent": "DeliverooApp"})
        response.raise_for_status()
        data = response.json()
        address = data.get("address", {})

        return jsonify({
            "street": address.get("road") or "",
            "city": address.get("city") or address.get("town") or address.get("village") or "",
            "country": address.get("country") or "",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

