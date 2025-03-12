import { pool } from "../libs/database.js";
import { body, validationResult } from 'express-validator';

export const getVehicles = async (req, res) => {
    try {
      const vehicles = await pool.query({
        text: `SELECT * FROM "Domain"."Vehicles"`,
      });
  
      // Check if no vehicles are found
      if (vehicles.rows.length === 0) {
        return res.status(204).json({
          status: "Success",
          message: "No vehicles found",
        });
      }
  
      // Return the vehicles if found
      res.status(200).json({
        status: "Success",
        data: vehicles.rows,
      });
    } catch (error) {
      // Log the error (use a logging system in production)
      console.error(error);
      res.status(500).json({ status: "Failed", message: "Internal Server Error" });
    }
  };
  

  export const registerVehicle = async (req, res) => {
    try {
        body('licensePlate').notEmpty().withMessage('License plate is required').run(req),
        body('vehicleType').notEmpty().withMessage('Vehicle type is required').run(req),
        body('vehicleModel').notEmpty().withMessage('Vehicle model is required').run(req),
        body('vehicleColour').notEmpty().withMessage('Vehicle colour is required').run(req),
        body('firstName').notEmpty().withMessage('Owner\'s first name is required').run(req),
        body('lastName').notEmpty().withMessage('Owner\'s last name is required').run(req),
        body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number').run(req),
        body('address').notEmpty().withMessage('Address is required').run(req),
        body('district').notEmpty().withMessage('District is required').run(req),
        body('nic').optional().isLength({ min: 10 }).withMessage('NIC must be at least 10 characters').run(req),
        body('chassisNumber').optional().isLength({ min: 5 }).withMessage('Chassis number must be at least 5 characters').run(req),
        body('engineNumber').optional().isLength({ min: 5 }).withMessage('Engine number must be at least 5 characters').run(req),

        // Handle validation results
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Validation errors',
                errors: errors.array(),
            });
            }
        }


        const {
        licensePlate,
        vehicleType,
        vehicleModel,
        vehicleColour,
        firstName,
        lastName,
        phoneNumber,
        address,
        district,
        nic,
        chassisNumber,
        engineNumber
      } = req.body; // Destructure the incoming data for vehicle registration
  
      // Check if a vehicle with the given license plate already exists
      const vehicleExistResult = await pool.query({
        text: `SELECT * FROM "Domain"."Vehicles" WHERE "LicensePlate" = $1`,
        values: [licensePlate],
      });
  
      const vehicleExist = vehicleExistResult.rows[0];
  
      if (vehicleExist) {
        return res
          .status(409)
          .json({ status: "Failed", message: "Vehicle with this license plate already exists." });
      }
  
      // Insert the new vehicle into the Vehicles table
      const vehicle = await pool.query({
        text: `INSERT INTO "Domain"."Vehicles"(
          "LicensePlate", "VehicleType", "VehicleModel", "VehicleColour", 
          "FirstName", "LastName", "PhoneNumber", "Address", "District", 
          "NIC", "ChassisNumber", "EngineNumber"
        ) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING *`,
        values: [
          licensePlate,
          vehicleType,
          vehicleModel,
          vehicleColour,
          firstName,
          lastName,
          phoneNumber,
          address,
          district,
          nic,
          chassisNumber,
          engineNumber
        ],
      });
  
      res.status(201).json({
        status: "Success",
        message: "Vehicle registered successfully",
        data: vehicle.rows[0], // Return the inserted vehicle data
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "Failed", message: error.message });
    }
  };
  

