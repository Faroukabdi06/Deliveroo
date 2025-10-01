import ParcelDetails from "./pages/customer/ParcelDetails";
import AdminParcelManage from "./pages/admin/AdminParcelManage";
import "./App.css";

function App() {
  return (
    <div className="p-6 space-y-10">
      {/* Customer View */}
      <ParcelDetails />

      <hr className="my-6" />

      {/* Admin View */}
      <AdminParcelManage />
    </div>
  );
}

export default App;
