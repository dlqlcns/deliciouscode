import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// __dirname 설정 (ES Module 사용 시 필요)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 기본 라우팅
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Render에서 지정한 포트 사용
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
