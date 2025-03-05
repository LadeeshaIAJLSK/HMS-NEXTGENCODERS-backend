const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      // Check if headers exist
      if (!req.headers) {
        return res.status(401).json({ error: "Access Denied. No headers provided." });
      }

      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
      }

      const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'
      if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach decoded user data to request

      // Check if user has the required role
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access Denied. Insufficient permissions." });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;