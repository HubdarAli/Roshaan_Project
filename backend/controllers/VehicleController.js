const Vehicle = require("../models/Vehicle");
const Transportation = require("../models/Transportation");
const User = require("../models/User");

// Middleware to check Admin Access
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // ✅ Admin Allowed
  } else {
    return res.status(403).json({ message: "Access Denied! Admin Only" });
  }
};

// 🚗 Get All Vehicles (Admin Only)
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("car"); 
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// 🚗 Get Vehicle by ID (User Can Access Their Own, Admin Can Access Any)
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("car");
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }


    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 🚗 Create Vehicle (User Can Register Their Own Vehicle)
exports.createVehicle = async (req, res) => {

  const { firstName, lastName, email, password, homeAddress, companyAddress, car } = req.body;
  const user = await User.findOne({ email });
  try {
    // ✅ Create Transportation first
    const newCar = new Transportation({
      name: car.name,
      type: car.type,
      licensePlate: car.licensePlate,
      companyCar: car.companyCar,
    });

    const savedCar = await newCar.save();

    // ✅ Create Vehicle and reference the Transportation _id
    const newVehicle = new Vehicle({
      firstName,
      lastName,
      email,
      password,
      homeAddress,
      companyAddress,
      car: savedCar._id, 
    });

    const savedVehicle = await newVehicle.save();

    // ✅ Assign and save vehicleId in Transportation model
    await Transportation.findByIdAndUpdate(savedCar._id, { vehicleId: savedVehicle._id }, { new: true });

    res.status(201).json({ message: "Vehicle registered successfully", vehicle: savedVehicle });
  } catch (err) {
    console.error("Error creating vehicle:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// 🚗 Update Vehicle (User Can Update Their Own, Admin Can Update Any)
exports.updateVehicle = async (req, res) => {
  const { firstName, lastName, email, password, homeAddress, companyAddress, car } = req.body;

  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }


    if (car) {
      const existingCar = await Transportation.findById(vehicle.car);
      if (existingCar) {
        Object.assign(existingCar, car);
        await existingCar.save();
      }
    }

    Object.assign(vehicle, {
      firstName,
      lastName,
      email,
      password,
      homeAddress,
      companyAddress,
    });

    const updatedVehicle = await vehicle.save();
    const updatedCar = await Transportation.findById(updatedVehicle.car);

    res.json({ vehicle: updatedVehicle, car: updatedCar });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 🚗 Delete Vehicle (Admin Can Delete Any, User Can Delete Their Own)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }


    await Transportation.findByIdAndDelete(vehicle.car);
    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 🚗 Mark Vehicle as Favorite (User Feature)
exports.markFavorite = async (req, res) => {
  try {
    console.log("Vehicle ID:", req.params.id);

    const vehicle = await Vehicle.findById(req.params.id);
    console.log("Found Vehicle:", vehicle);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // ✅ Check if `userId` exists before calling `.toString()`
    if (vehicle.userId && vehicle.userId.toString()) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    vehicle.isFavorite = !vehicle.isFavorite;
    await vehicle.save();

    res.json({ message: "Favorite Updated!", vehicle });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🚗 Get User-Specific Vehicles
exports.getUserVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
