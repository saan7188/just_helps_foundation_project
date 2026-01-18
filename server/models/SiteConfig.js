const mongoose = require('mongoose');

const SiteConfigSchema = new mongoose.Schema({
  heroTitle: { type: String, default: "Small Acts. Massive Impact." },
  heroSubtitle: { type: String, default: "Kindness has no minimum limit." },
  maintenanceMode: { type: Boolean, default: false },
  announcement: { type: String, default: "" } // e.g. "Server updating in 10 mins"
});

module.exports = mongoose.model('siteConfig', SiteConfigSchema);