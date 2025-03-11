import express from 'express';
import authRoutes from "./authRoutes.js";
import vehicleOwners from "./vehicleOwners.js";
import fines from "./fines.js";

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/vehicleOwners", vehicleOwners);
routes.use("/fines", fines);

export default routes;