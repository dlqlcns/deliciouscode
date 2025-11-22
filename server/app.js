import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import recipeRoutes from './routes/recipes.js'
import favoriteRoutes from './routes/favorites.js'
import userRoutes from './routes/users.js'
import aiRoutes from "./routes/ai.js";

const app = express()
const PORT = process.env.PORT || 3000
const API_PREFIX = '/api'

dotenv.config()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// 라우트 연결
app.use(`${API_PREFIX}/auth`, authRoutes)
app.use(`${API_PREFIX}/recipes`, recipeRoutes)
app.use(`${API_PREFIX}/favorites`, favoriteRoutes)
app.use(`${API_PREFIX}/users`, userRoutes)
app.use("/api/ai", aiRoutes)

// 기본 404 처리
app.use((req, res) => {
  res.status(404).json({ error: '요청하신 경로를 찾을 수 없습니다.' })
})

// 예기치 못한 서버 오류 처리
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: '서버 오류가 발생했습니다.' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.listen(3000, () => console.log("✅ AI 서버 실행 중"));
