const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const vehicleSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    homeAddress: { type: String, required: true },
    companyAddress: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isFavorite: { type: Boolean, default: false },
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Transportation" },
    jwtToken: {
      type: String, // Field to store JWT token
      default: function () {
        return jwt.sign(
          { userId: this._id, role: this.role },
          process.env.JWT_EMPLOYEE_SECRET,
          { expiresIn: "1h" }
        );
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
