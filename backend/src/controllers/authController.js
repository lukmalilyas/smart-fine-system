import { pool } from "../libs/database.js";
import { createJWT } from "../libs/index.js";
import { body, validationResult } from 'express-validator';

export const signupUser = async (req, res) => {
  try {
    // Input validation using express-validator
    await body('firebaseUID').notEmpty().run(req);
    await body('email').isEmail().run(req);
    await body('displayName').notEmpty().run(req);
    await body('provider').notEmpty().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'failed',
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { firebaseUID, email, displayName, provider } = req.body;

    const userExist = await pool.query({
      text: 'SELECT 1 FROM "Identity"."Users" WHERE "Email" = $1 LIMIT 1',
      values: [email],
    });

    if (userExist.rows.length > 0) {
      return res.status(409).json({
        status: "failed",
        message: "Email Address already exists. Try Login",
      });
    }

    const user = await pool.query({
      text: `INSERT INTO "Identity"."Users" ("FirebaseUID", "Email", "DisplayName", "Provider") 
             VALUES ($1, $2, $3, $4) 
             RETURNING "Email", "DisplayName", "Provider"`, // Make sure column names match
      values: [firebaseUID, email, displayName, provider],
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
    // Input validation using express-validator
    await body('email').isEmail().run(req);
    await body('firebaseUID').notEmpty().run(req); // You need firebaseUID to identify the user.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'failed',
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { firebaseUID, email } = req.body;

    // Check if the user exists in the database by email
    const userExist = await pool.query({
      text: `SELECT * FROM "Identity"."Users" WHERE "Email" = $1 LIMIT 1`,
      values: [email],
    });

    const user = userExist?.rows?.[0];

    if (!user || user.FirebaseUID !== firebaseUID) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid email or firebaseUID.",
      });
    }

    // Generate JWT
    const token = createJWT(user.ID);  // Ensure `user.ID` is available from the query result.

    user.FirebaseUID = undefined;

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: user,  // Return user information (standardized return value).
      token,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ status: "failed", message: "Internal Server Error" });
  }
};