import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaHome, FaPlusCircle } from "react-icons/fa";
import VehicleRegisterPage from "./VehicleRegister";
import UpdateVehicle from "./UpdateVehicle";

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegModel, setIsRegModel] = useState(false);
  const [isModalVisible, setModalVisible] = useState(null);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/vehicles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const deleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/vehicles/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        });

        if (response.ok) {
          setVehicles(vehicles.filter((vehicle) => vehicle._id !== id));
        } else {
          throw new Error("Failed to delete vehicle");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const editVehicle = (vehicle) => {
    setModalVisible(vehicle);
  };

  const regVehicle = (e) => {
    setIsRegModel(e);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsRegModel(false);
  };
  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="alert">
          Loading Vehicles...
        </div>
      </div>
    );
  }

  const handleProfileUpdate = (updatedData) => {
    localStorage.setItem("userObj", JSON.stringify(updatedData));
    window.location.reload();
  };

  return (
    <div>
      {/* Navbar with Home Icon */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <span className="navbar-brand ms-3">
            <div className="card-header d-flex align-items-center">
              <i className="fas fa-users fa-1x me-3"></i>
              <h4 className="card-title mb-0">Vehicles</h4>
            </div>
          </span>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/dashboard")}
          >
            <FaHome className="me-2" /> Home
          </button>
        </div>
      </nav>

      {/* Vehicle Listing Table */}
      <div className="container py-5">
        <div className="table-responsive">
          <div className="d-flex justify-content-between align-items-center">
            <p>Total: {vehicles.length}</p>
            <button
              className="btn btn-outline-success d-flex align-items-center px-4 py-1 rounded-3 shadow-sm hover-shadow"
              onClick={() => regVehicle(true)}
              style={{ marginBottom: "13px" }}
            >
              <FaPlusCircle className="me-2" />
              Register Vehicle
            </button>
          </div>
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Home Address</th>
                <th>Company Address</th>
                <th>Transportation Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle, index) => (
                  <tr key={vehicle._id}>
                    <td>{index + 1}</td>
                    <td>{`${vehicle.firstName} ${vehicle.lastName}`}</td>
                    <td>{vehicle.homeAddress}</td>
                    <td>{vehicle.companyAddress}</td>
                    <td>{vehicle.car?.name || "N/A"}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => editVehicle(vehicle)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteVehicle(vehicle._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Update Modal */}
      {isModalVisible && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Update Profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <UpdateVehicle
                  userData={isModalVisible}
                  isModalVisible={isModalVisible}
                  onUpdate={(updatedData) => handleProfileUpdate(updatedData)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Vehicle Modal */}
      {isRegModel && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Vehicle Registration
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <VehicleRegisterPage
                  userData={isRegModel}
                  isModalVisible={false}
                  isAdmin={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclePage;
