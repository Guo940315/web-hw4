// app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();
const db = require('./db');

// 資料庫連線測試
db.serialize(() => {
    db.get('SELECT 1', (err) => {
        if (err) {
            console.error('資料庫連線測試失敗:', err.message);
            process.exit(1);
        } else {
            console.log('資料庫連線測試成功');
        }
    });
});

// CORS 設定
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 新增 GET /api 測試路由
app.get('/api', (req, res) => {
    res.json({ message: 'API 已啟動，請使用 /api/price, /api/query, /api/insert 等路由。' });
});

// 新增雞排價格資料
app.post('/api/insert', (req, res) => {
    const { date, name, price } = req.body;
    if (!date || !name || !price) {
        return res.status(400).json({ error: '請提供完整的 date, name, price 參數' });
    }
    const sql = `INSERT INTO product_prices (date, name, price) VALUES (?, ?, ?)`;
    db.run(sql, [date, name, price], function(err) {
        if (err) {
            console.error('新增雞排資料失敗:', err.message);
            return res.status(500).json({ error: '資料庫新增失敗', details: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// 查詢價格
app.get('/api/price', (req, res) => {
    const keyword = req.query.keyword || '';
    db.all('SELECT * FROM product_prices WHERE name LIKE ? ORDER BY date DESC', [`%${keyword}%`], (err, rows) => {
        if (err) {
            console.error('查詢失敗:', err.message);
            return res.status(500).json({ error: '資料庫查詢失敗', details: err.message });
        }
        res.json(rows);
    });
});

// 查詢特定資料
app.post('/api/query', (req, res) => {
    const { date, name } = req.body;
    if (!date && !name) {
        return res.status(400).json({ error: '請提供 date 或 name 其中一項參數' });
    }
    let sql = 'SELECT * FROM product_prices WHERE ';
    const params = [];
    if (date) {
        sql += 'date = ?';
        params.push(date);
    }
    if (date && name) {
        sql += ' AND ';
    }
    if (name) {
        sql += 'name = ?';
        params.push(name);
    }
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('查詢失敗:', err.message);
            return res.status(500).json({ error: '資料庫查詢失敗', details: err.message });
        }
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: '查無資料' });
        }
        res.json(rows);
    });
});

module.exports = app;
