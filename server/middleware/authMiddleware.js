const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get Token
  const token = req.header('x-auth-token');
  console.log("🔑 [Auth Middleware] Checking Token...");

  // 2. Check if no token
  if (!token) {
    console.log("❌ [Auth Middleware] No token found in header!");
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify Token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log("✅ [Auth Middleware] Token Verified. User ID:", req.user.id);
    next();
  } catch (err) {
    console.log("❌ [Auth Middleware] Token Verification FAILED:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};