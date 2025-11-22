import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import recipeRoutes from './routes/recipes.js'
import favoriteRoutes from './routes/favorites.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// 라우트 연결
app.use('/api/auth', authRoutes)
app.use('/api/recipes', recipeRoutes)
app.use('/api/favorites', favoriteRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
