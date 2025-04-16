import express from 'express';
import authRoutes from "./authRoutes.js";
import restaurant from "./restaurent.js";
import surveillance from "./surveillance.js";

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/restaurant", restaurant);
routes.use("/surveillance", surveillance);

export default routes;