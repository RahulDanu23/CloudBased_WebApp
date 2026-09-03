const supabase = require('../config/supabase');

// 1. Register / Sign Up
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Supabase handles unique email validation and password hashing
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Insert user into our public 'users' table
    if (data.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: name || '',
          },
        ]);
      
      if (dbError) {
        console.error("Database insert error:", dbError);
        // We shouldn't fail the whole registration if just the profile fails, 
        // but we need to log it so we know why the user is missing!
      }
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: data.user,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Login / Sign In
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Supabase automatically verifies if user exists and validates password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Login successful",
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Logout / Sign Out
const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Get Current User Profile
const getMe = async (req, res) => {
  try {
    const user = req.user; // populated by auth middleware
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ user: data });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 5. Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
      userData.id,
      { password: password }
    );

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
};