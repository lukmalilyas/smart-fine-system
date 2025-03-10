import { pool } from "../libs/database.js";
import { comparePassword, createJWT, hashPassword } from "../libs/index.js";

export const signupUser = async (req, res) => {
  try {
    const { firstName, email, password } = req.body;

    if (!(firstName && email && password)) {
      return res.status(400).json({
        status: "failed",
        message: "Provide Required Fields!",
      });
    }

    const userExist = await pool.query({
      text: "SELECT EXISTS (SELECT * FROM tbluser WHERE email = $1)",
      values: [email],
    });

    if (userExist.rows[0].exists) {
      return res.status(409).json({
        status: "failed",
        message: "Email Address already exists. Try Login",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await pool.query({
      text: `INSERT INTO tbluser (firstname, email, password) VALUES ($1, $2, $3) RETURNING *`,
      values: [firstName, email, hashedPassword],
    });

    user.rows[0].password = undefined;

    res.status(201).json({
      status: "success",
      message: "User account created successfully",
      user: user.rows[0],
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ status: "failed", message: "Internal Server Error" });
  }
};

export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({
        status: "failed",
        message: "Provide Required Fields!",
      });
    }

    const result = await pool.query({
      text: `SELECT * FROM tbluser WHERE email = $1`,
      values: [email],
    });

    const user = result?.rows?.[0];

    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid email or password.",
      });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid email or password",
      });
    }

    const token = createJWT(user.id);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: user, // Include user info directly
      token,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ status: "failed", message: "Internal Server Error" });
  }
};
