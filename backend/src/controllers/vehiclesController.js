import { pool } from "../libs/database.js";

export const getVehicles = async (req, res) => {
    try {
      const vehicles = await pool.query({
        text: `SELECT * FROM Domain.Vehicles`,
      });
  
      // Check if no vehicles are found
      if (vehicles.rows.length === 0) {
        return res.status(204).json({
          status: "success",
          message: "No vehicles found",
        });
      }
  
      // Return the vehicles if found
      res.status(200).json({
        status: "success",
        data: vehicles.rows,
      });
    } catch (error) {
      // Log the error (use a logging system in production)
      console.error(error);
      res.status(500).json({ status: "failed", message: "Internal Server Error" });
    }
  };
  

export const registerVehicle = async (req, res) => {
  try {
    const { name, amount, account_number } = req.body;

    const accountExistQuery = {
      text: `SELECT * FROM tblaccount WHERE account_name = $1 AND user_id = $2`,
      values: [name, userId],
    };

    const accountExistResult = await pool.query(accountExistQuery);

    const accountExist = accountExistResult.rows[0];

    if (accountExist) {
      return res
        .status(409)
        .json({ status: "failed", message: "Account already created." });
    }

    const createAccountResult = await pool.query({
      text: `INSERT INTO tblaccount(user_id, account_name, account_number, account_balance) VALUES($1, $2, $3, $4) RETURNING *`,
      values: [userId, name, account_number, amount],
    });
    const account = createAccountResult.rows[0];

    const userAccounts = Array.isArray(name) ? name : [name];

    const updateUserAccountQuery = {
      text: `UPDATE tbluser SET accounts = array_cat(accounts, $1), updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      values: [userAccounts, userId],
    };
    await pool.query(updateUserAccountQuery);

    // Add initial deposit transaction
    const description = account.account_name + " (Initial Deposit)";

    const initialDepositQuery = {
      text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      values: [
        userId,
        description,
        "income",
        "Completed",
        amount,
        account.account_name,
      ],
    };
    await pool.query(initialDepositQuery);

    res.status(201).json({
      status: "success",
      message: account.account_name + " Account created successfully",
      data: account,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

