const express = require("express");
const router = express.Router();
const vehicleController = require("./../controllers/VehicleController");

router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.post("/:id/favorite", vehicleController.markFavorite); 
router.post("/", vehicleController.createVehicle);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);


module.exports = router;
