import { pool } from "../libs/database.js";
import { createJWT } from "../libs/index.js";
import { body, validationResult } from 'express-validator';

export const signupUser = async (req, res) => {
  try {
    // Input validation using express-validator
    await body('firebaseUID').notEmpty().run(req);
    await body('email').isEmail().run(req);
    await body('name').notEmpty().run(req);
    await body('provider').notEmpty().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'failed',
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { firebaseUID, email, name, provider } = req.body;

    const userExist = await pool.query({
      text: "SELECT 1 FROM Identity.User WHERE email = $1 LIMIT 1",
      values: [email],
    });

    if (userExist.rows.length > 0) {
      return res.status(409).json({
        status: "failed",
        message: "Email Address already exists. Try Login",
      });
    }

    const user = await pool.query({
      text: `INSERT INTO Identity.User (firebaseUID, email, name, provider) VALUES ($1, $2, $3, $4) RETURNING firebaseUID, email, name, provider`,
      values: [firebaseUID, email, name, provider],
    });

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
