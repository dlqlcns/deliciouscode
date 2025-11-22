import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import recipeRoutes from './routes/recipes.js'

const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/auth', authRoutes)
app.use('/api/recipes', recipeRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
