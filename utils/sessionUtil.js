// Provides utility functions to manage user session data
function initializeSession(req, data = {}) {
  if (!req.session.userData) {
    req.session.userData = {};
  }

  for (const key in data) {
    req.session.userData[key] = data[key];
  }
}

// Clears the user session data
function clearSession(req) {
  req.session.userData = {};
}

module.exports = { initializeSession, clearSession };