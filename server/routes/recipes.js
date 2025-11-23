import express from 'express'
import {
  getRecommendedRecipes,
  getAllRecipes,
  getRecipeById,
  searchRecipes
} from '../controllers/recipesController.js'

const router = express.Router()

router.get('/recipes/recommended', getRecommendedRecipes)
router.get('/', getAllRecipes)
router.get('/search', searchRecipes)
router.get('/:id', getRecipeById)

export default router
