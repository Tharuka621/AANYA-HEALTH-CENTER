const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  console.log("Checking admin access for user:", req.user);
  const userRole = req.user.role.toUpperCase();
  if (userRole !== "ADMIN") {
    return res.status(403).json({ 
      message: "Admin access required",
      currentRole: req.user.role 
    });
  }
  next();
};

// Middleware to check if user has one of the allowed roles
exports.hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role.toUpperCase();
    const allowed = allowedRoles.map(r => r.toUpperCase());
    
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }
    next();
  };
};
