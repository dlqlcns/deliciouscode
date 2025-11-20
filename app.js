import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // public 폴더 안 HTML/CSS/JS 제공

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
