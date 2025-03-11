import firebaseAdmin from "../libs/firebase.js";

const authFirebase = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token); // Verify the token
    req.user = decodedToken; // You can store the decoded token's user info in `req.user` if needed
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authFirebase;
