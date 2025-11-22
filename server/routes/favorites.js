import express from 'express'
import auth from '../middleware/auth.js'
import {
  addFavorite,
  getFavoriteRecipeIds,
  getUserFavorites,
  removeFavorite
} from '../controllers/favoritesController.js'

const router = express.Router()

router.get('/', auth, getFavoriteRecipeIds)
router.post('/', auth, addFavorite)
router.delete('/', auth, removeFavorite)
router.get('/:userId', getUserFavorites)
