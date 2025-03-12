import { pool } from "../libs/database.js";

export const getFines = async (req, res) => {
    try {
      const { licensePlate } = req.params;
      const fines = await pool.query({
        text: `SELECT "LicensePlate", "FineAmount", "Location", "CreatedAt" FROM "Domain"."Fines" WHERE "LicensePlate" = $1`,
        values: [licensePlate],
      });
  
      // Check if no fines are found
      if (fines.rows.length === 0) {
        return res.status(204).json({
          status: "success",
          message: "No fines found",
        });
      }
  
      // Return the vehicles if found
      res.status(200).json({
        status: "Success",
        data: fines.rows,
      });
    } catch (error) {
      // Log the error (use a logging system in production)
      console.error(error);
      res.status(500).json({ status: "Failed", message: "Internal Server Error" });
    }
  };