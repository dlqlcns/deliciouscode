import express from 'express'
import { getAllRecipes, getRecommendedRecipes } from '../controllers/recipesController.js'

const router = express.Router()

router.get('/recommended', getRecommendedRecipes)
router.get('/', getAllRecipes)
