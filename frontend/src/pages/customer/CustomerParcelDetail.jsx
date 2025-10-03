import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../../components/customer/spinner";
import MapComponent from "../../components/Maps/Maps";
import { reverseGeocode as getAddressFromCoords } from "../../components/Maps/Distance";
import {
  fetchCustomerParcelById,
  updateCustomerParcel,
  cancelCustomerParcel,
} from "../../features/customer/customerSlice";
import "../../styles/ParcelDetails.css";

export default function CustomerParcelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentParcel: parcel, loading, error } = useSelector(
    (state) => state.customer
  );

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newDestination, setNewDestination] = useState({
    street: "",
    city: "",
    country: "",
    postal_code: "",
    lat: null,
    lng: null,
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch parcel by ID
  useEffect(() => {
    if (id) dispatch(fetchCustomerParcelById(id));
  }, [id, dispatch]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this parcel?")) return;

    try {
      await dispatch(cancelCustomerParcel(id)).unwrap();
      navigate("/customer/parcels");
    } catch (err) {
      console.error("Error cancelling parcel:", err);
    }
  };

  const handleUpdateSubmit = async () => {
    const { street, city, country, postal_code, lat, lng } = newDestination;
    if (!street || !city || !country || !postal_code || !lat || !lng) {
      alert("Please fill in all fields and select a location on the map");
      return;
    }

    try {
      await dispatch(
        updateCustomerParcel({
          id,
          updates: { street, city, country, postal_code, lat, lng },
        })
      ).unwrap();

      setShowUpdateModal(false);
      setSuccessMessage("Destination updated successfully!");
      setNewDestination({ street: "", city: "", country: "", postal_code: "", lat: null, lng: null });
      dispatch(fetchCustomerParcelById(id));
    } catch (err) {
      console.error("Error updating destination:", err);
      alert("Failed to update destination. Check the values and try again.");
    }
  };

  const handleMapPinChange = async (lat, lng) => {
    try {
      const address = await getAddressFromCoords(lat, lng);
      setNewDestination({
        lat,
        lng,
        street: address.street,
        city: address.city,
        country: address.country,
        postal_code: address.postal_code,
      });
    } catch (err) {
      console.error("Error reverse geocoding:", err);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr;
    return `${addr.street || ""}, ${addr.city || ""}, ${addr.postal_code || ""}, ${addr.country || ""}`;
  };

  if (loading) return <Spinner />;
  if (!parcel) return <p className="parcel-detail-error">{error || "Parcel not found."}</p>;

  return (
    <div className="parcel-detail-container">
      <button className="parcel-back-button" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <h1 className="parcel-detail-title">Parcel Details</h1>

      {successMessage && <p className="parcel-success-message">{successMessage}</p>}
      {error && <p className="parcel-detail-error">{error}</p>}

      <div className="parcel-detail-card">
        <p>
          <span className="parcel-detail-label">Tracking ID:</span> {parcel.tracking_id}
        </p>
        <p>
          <span className="parcel-detail-label">Status:</span> {parcel.status}
        </p>
        <p>
          <span className="parcel-detail-label">Pickup:</span> {formatAddress(parcel.pickup_address)}
        </p>
        <p>
          <span className="parcel-detail-label">Destination:</span> {formatAddress(parcel.delivery_address)}
        </p>
      </div>

      {/* Current Route Map */}
      {parcel.pickup_address?.lat && parcel.delivery_address?.lat && (
        <div className="parcel-map-section">
          <h3>Route</h3>
          <MapComponent
            pickup={{
              lat: parseFloat(parcel.pickup_address.lat),
              lng: parseFloat(parcel.pickup_address.lng),
            }}
            destination={{
              lat: parseFloat(parcel.delivery_address.lat),
              lng: parseFloat(parcel.delivery_address.lng),
            }}
          />
        </div>
      )}

      {/* Actions */}
      {parcel.status !== "DELIVERED" && parcel.status !== "CANCELLED" && (
        <div className="parcel-detail-actions">
          <button onClick={handleCancel} disabled={loading} className="parcel-detail-btn cancel">
            Cancel Parcel
          </button>
          <button
            onClick={() => {
              setNewDestination({
                ...parcel.delivery_address,
                lat: parcel.delivery_address.lat,
                lng: parcel.delivery_address.lng,
              });
              setShowUpdateModal(true);
            }}
            disabled={loading}
            className="parcel-detail-btn update"
          >
            Update Destination
          </button>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="parcel-update-modal-overlay">
          <div className="parcel-update-modal">
            <h2 className="parcel-update-modal-title">Update Destination</h2>

            <MapComponent
              pickup={{ lat: newDestination.lat, lng: newDestination.lng }}
              destination={null}
              isAdmin={true} // draggable
              onMapClick={handleMapPinChange}
            />

            <input
              type="text"
              placeholder="Street"
              value={newDestination.street}
              onChange={(e) =>
                setNewDestination((prev) => ({ ...prev, street: e.target.value }))
              }
              className="parcel-update-modal-input"
            />
            <input
              type="text"
              placeholder="City"
              value={newDestination.city}
              onChange={(e) =>
                setNewDestination((prev) => ({ ...prev, city: e.target.value }))
              }
              className="parcel-update-modal-input"
            />
            <input
              type="text"
              placeholder="Country"
              value={newDestination.country}
              onChange={(e) =>
                setNewDestination((prev) => ({ ...prev, country: e.target.value }))
              }
              className="parcel-update-modal-input"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={newDestination.postal_code}
              onChange={(e) =>
                setNewDestination((prev) => ({ ...prev, postal_code: e.target.value }))
              }
              className="parcel-update-modal-input"
            />

            <div className="parcel-update-modal-actions">
              <button onClick={handleUpdateSubmit} className="parcel-detail-btn update">
                Save
              </button>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="parcel-detail-btn cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status History */}
      <section className="status-history">
        <h2>Status History</h2>
        <ul>
          {parcel.status_history?.map((h) => (
            <li key={h.id}>
              <strong>{h.status}</strong> - {new Date(h.timestamp).toLocaleString()}
              <br />
              Notes: {h.notes || "None"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
