// models/CheckoutModel.js (re-export Reservation)

const mongoose = require("mongoose");
const Reservation = require("./Reservation");

module.exports = Reservation;
