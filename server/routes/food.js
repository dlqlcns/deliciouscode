import express from "express";
import { getFoodInfo } from "../controllers/foodController.js";

const router = express.Router();

// /api/food-info?q=김치
router.get("/food-info", getFoodInfo);

export default router;
