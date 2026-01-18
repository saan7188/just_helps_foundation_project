module.exports = function (req, res, next) {
  // SIMPLE CHECK: Trust the token we just issued
  // (req.user is set by authMiddleware)
  
  if (req.user && req.user.isAdmin) {
    next(); // You are an Admin, proceed!
  } else {
    // If not admin, block them
    res.status(403).json({ msg: 'Access denied. You are not an Admin.' });
  }
};
