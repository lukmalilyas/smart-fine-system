import { pool } from "../libs/database.js";

export const getSurveillance = async (req, res) => {
  try {
    const { licenseNumber } = req.params;
    const surveillanceData = await pool.query({
      text: `SELECT "LicenseNumber", "Date", "Time", "TrackID" FROM "Domain"."SurveillanceCount" WHERE "LicenseNumber" = $1`,
      values: [licenseNumber],
    });

    // Check if no data is found
    if (surveillanceData.rows.length === 0) {
      return res.status(204).json({
        status: "success",
        message: "No data found",
      });
    }

    // Return the surveillance data if found
    res.status(200).json({
      status: "Success",
      data: surveillanceData.rows,
    });
  } catch (error) {
    // Log the error (use a logging system in production)
    console.error(error);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};
