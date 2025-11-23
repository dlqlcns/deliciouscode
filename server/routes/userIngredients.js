import express from "express";
import { addIngredient, getIngredients, deleteAllIngredients, deleteOneIngredient } from "../controllers/userIngredientsController.js";
import auth from "../middleware/auth.js"; // 로그인 인증 미들웨어

const router = express.Router();

// 모든 요청은 로그인 필수
router.use(auth);

router.get("/", getIngredients);
router.post("/", addIngredient);
router.delete("/", deleteAllIngredients);
router.delete("/:ingredient", deleteOneIngredient);

export default router;
