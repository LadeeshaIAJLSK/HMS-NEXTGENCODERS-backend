import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;// Extract token from cookies
  // const token = req.headers.authorization?.split(" ")[1]; // Alternatively, you we extract from headers if needed,but we use ookies in this case

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using JWT secret

    if (!tokenDecode.id) { // Check if the token contains a valid user ID
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    req.body.userId = tokenDecode.id; // Attach user ID to request body for further use
    next(); // Proceed to  route handler

  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

export default userAuth; 
