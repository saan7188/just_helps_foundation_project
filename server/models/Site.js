const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  heroTitle: { type: String, default: 'Small Acts. Massive Impact.' },
  heroSubtitle: { type: String, default: 'Your donation changes lives.' },
  maintenanceMode: { type: Boolean, default: false },
  announcement: { type: String, default: '' } // e.g. "Server Maintenance Tonight"
});

module.exports = mongoose.model('Site', SiteSchema);
