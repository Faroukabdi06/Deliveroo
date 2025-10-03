import api from "../../api/axios";

// Get distance, duration, and route coordinates via OSRM
export const getDistanceDuration = async (origin, destination) => {
  try {
    const response = await api.get("/maps/distance", {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
      },
    });

    // response.data should contain { distance, duration, coordinates }
    return response.data;
  } catch (error) {
    console.error("Error fetching distance from OSRM:", error);
    return null;
  }
};

// Reverse geocode using Nominatim (via your backend or direct request)
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await api.get("/maps/reverse-geocode", {
      params: { lat, lng },
    });

    // Nominatim usually returns { road, city, state, country, postcode }
    const data = response.data;

    return {
      street: data.road || "",
      city: data.city || data.town || data.village || "",
      country: data.country || "",
      postal_code: data.postcode || "",
    };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return { street: "", city: "", country: "", postal_code: "" };
  }
};
