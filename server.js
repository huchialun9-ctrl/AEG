import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 先定義 /docs 路由
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// 再服務 frontend 靜態資源
app.use(express.static(path.join(__dirname, 'frontend')));

// 首頁跳轉 (可省略，express.static 會自動尋找 frontend/index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// 文檔跳轉
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
