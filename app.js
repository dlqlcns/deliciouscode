import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// ES 모듈에서 __dirname 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public 폴더를 정적 파일 제공 폴더로 지정
app.use(express.static(path.join(__dirname, 'public')));

// 모든 경로를 public 하위 HTML로 연결
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/recipe_all', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'recipe_all.html'));
});

app.get('/recipe_detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'recipe_detail.html'));
});

// 포트 열기
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
