import express from "express";
import { generateRecipeList, generateRecipeDetail } from "../controllers/aiController.js";

const router = express.Router();

router.post("/list", generateRecipeList);
router.post("/detail", generateRecipeDetail);

export default router;
