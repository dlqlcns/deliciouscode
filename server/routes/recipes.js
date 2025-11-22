import express from 'express'
import {
  getAllRecipes,
  getRecommendedRecipes,
  getRecipeById,
  searchRecipes
} from '../controllers/recipesController.js'

const router = express.Router()

router.get('/recommended', getRecommendedRecipes)
router.get('/search', searchRecipes)
router.get('/', getAllRecipes)
router.get('/:id', getRecipeById)

export default router
