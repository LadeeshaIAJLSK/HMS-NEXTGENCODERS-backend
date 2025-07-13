const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  siteTitle: String,
  siteLanguage: String,
  hotelName: String,
  hotelEmail: String,
  hotelPhone: String,
  hotelWebsite: String,
  hotelMobile: String,
  hotelAddress: String,
  hotelTagline: String,
  gstRoom: String,
  cgstRoom: String,
  gstFood: String,
  cgstFood: String,
  gstLaundry: String,
  cgstLaundry: String,
  gstin: String,
  currency: String,
  currencySymbol: String,
  nationality: String,
  country: String,
  filterDateRange: String,
  lHeight: String,
  lWidth: String
}, { collection: 'settings' });

module.exports = mongoose.model("Settings", settingSchema);