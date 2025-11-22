import express from 'express'
import {
  getAllRecipes,
  getRecommendedRecipes,
  getRecipeById
} from '../controllers/recipesController.js'

const router = express.Router()

router.get('/recommended', getRecommendedRecipes)
router.get('/', getAllRecipes)
router.get('/:id', getRecipeById) // 👈 상세 페이지용 라우트 추가

export default router
