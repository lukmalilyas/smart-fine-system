import { pool } from "../libs/database.js";
import { body, validationResult } from 'express-validator';

// GET all restaurants
export const getRestaurants = async (req, res) => {
  try {
    const result = await pool.query({
      text: `SELECT * FROM "Domain"."Restaurants"`,
    });

    if (result.rows.length === 0) {
      return res.status(204).json({
        status: "Success",
        message: "No restaurants found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

// POST register a new restaurant
export const registerRestaurant = async (req, res) => {
  try {
    // Run validation
    await Promise.all([
      body('restaurantName').notEmpty().withMessage('Restaurant name is required').run(req),
      body('ownerFirstName').notEmpty().withMessage('Owner first name is required').run(req),
      body('ownerLastName').notEmpty().withMessage('Owner last name is required').run(req),
      body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number').run(req),
      body('address').notEmpty().withMessage('Address is required').run(req),
      body('district').notEmpty().withMessage('District is required').run(req),
      body('nic').optional().isLength({ min: 10 }).withMessage('NIC must be at least 10 characters').run(req),
      body('registrationNumber').optional().isLength({ min: 5 }).run(req),
      body('licenseNumber').optional().isLength({ min: 5 }).run(req)
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const {
      restaurantName,
      ownerFirstName,
      ownerLastName,
      phoneNumber,
      address,
      district,
      nic,
      registrationNumber,
      licenseNumber
    } = req.body;

    // Check for duplicate restaurant by registration number or license number
    const duplicateCheck = await pool.query({
      text: `SELECT * FROM "Domain"."Restaurants" WHERE "RegistrationNumber" = $1 OR "LicenseNumber" = $2`,
      values: [registrationNumber, licenseNumber]
    });

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        status: "Failed",
        message: "Restaurant with this registration or license number already exists."
      });
    }

    // Insert new restaurant
    const insertResult = await pool.query({
      text: `
        INSERT INTO "Domain"."Restaurants"(
          "RestaurantName", "OwnerFirstName", "OwnerLastName",
          "PhoneNumber", "Address", "District", "NIC",
          "RegistrationNumber", "LicenseNumber"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
      values: [
        restaurantName,
        ownerFirstName,
        ownerLastName,
        phoneNumber,
        address,
        district,
        nic,
        registrationNumber,
        licenseNumber
      ],
    });

    res.status(201).json({
      status: "Success",
      message: "Restaurant registered successfully",
      data: insertResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Failed", message: error.message });
  }
};
