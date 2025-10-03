// src/pages/customer/CustomerParcels.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/customer/spinner";
import ParcelCard from "../../components/customer/ParcelCard";
import { fetchCustomerParcels } from "../../features/customer/customerSlice";
import "../../styles/parcelpage.css";

function CustomerParcels() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { parcels, loading, error } = useSelector((state) => state.customer);

  useEffect(() => {
    dispatch(fetchCustomerParcels());
  }, [dispatch]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="customer-parcels-container">
      {/* Back Button */}
      <button
        onClick={() => navigate("/customer")}
        className="back-button"
      >
        ← Back to Dashboard
      </button>

      <h1 className="customer-parcels-title">My Parcels</h1>

      {parcels.length === 0 ? (
        <p className="no-parcels-text">No parcels found.</p>
      ) : (
        <div className="parcels-grid">
          {parcels.map((parcel) => (
            <ParcelCard key={parcel.id} parcel={parcel} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerParcels;
