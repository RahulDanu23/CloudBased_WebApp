const supabase = require('../config/supabase');

const requireAuth = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authentication token is missing or invalid" });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    // 3. Attach user to the request object so controllers can access it
    req.user = user;
    
    // 4. Continue to the next middleware or controller
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ message: "Internal server error during authentication" });
  }
};

module.exports = { requireAuth };
