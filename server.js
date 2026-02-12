import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 先定義 /docs 路由
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// 服務 frontend 靜態資源 (React Build Output)
app.use(express.static(path.join(__dirname, 'frontend/dist'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// 首頁跳轉 (SPA Catch-all)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/docs')) return next();
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// 文檔跳轉
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
