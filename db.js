// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 資料庫檔案路徑
const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

// 確保 db 資料夾存在
if (!fs.existsSync(dbDir)) {
    try {
        fs.mkdirSync(dbDir);
        console.log('成功建立 db 資料夾:', dbDir);
    } catch (err) {
        console.error('無法建立 db 資料夾:', err.message);
        process.exit(1);
    }
}

// 開啟（或建立）資料庫
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('無法開啟資料庫:', err.message);
        console.error('資料庫路徑:', dbPath);
        process.exit(1);
    } else {
        console.log('成功開啟資料庫:', dbPath);
        // 建立 product_prices 資料表
        db.run(`CREATE TABLE IF NOT EXISTS product_prices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    name TEXT NOT NULL,
                    price REAL NOT NULL
                )`, (err) => {
            if (err) {
                console.error('建立 product_prices 資料表失敗:', err.message);
                process.exit(1);
            } else {
                console.log('product_prices 資料表已確認存在');
                // 檢查資料表是否有資料
                db.get('SELECT COUNT(*) AS count FROM product_prices', (err, row) => {
                    if (err) return console.error('讀取資料筆數失敗:', err.message);
                    if (row.count === 0) {
                        console.log('首次建立，插入資料...');
                        const data = [
                            ['2010', '一般夜市雞排', 50],
                            ['2013-12', '豪大大雞排', 60],
                            ['2016', '一般雞排', 60],
                            ['2019', '一般雞排', 70],
                            ['2021', '派克雞排', 70],
                            ['2022', '派克雞排', 80],
                            ['2023-04-01', '天使雞排', 100],
                            ['2023-06', '桃城雞排', 85],
                            ['2024', '豪大大雞排', 90],
                            ['2025-01-02', '一志雞排', 90],
                            ['2025-01-02', '潮麻吉雞排', 95],
                            ['2025', '巨無霸雞排', 130]
                        ];
                        const insertSQL = `INSERT INTO product_prices (date, name, price) VALUES (?, ?, ?)`;
                        data.forEach(row => {
                            db.run(insertSQL, row, (err) => {
                                if (err) {
                                    console.error('插入資料失敗:', err.message, '資料:', row);
                                }
                            });
                        });
                        console.log('資料插入完成');
                    } else {
                        console.log(`已有 ${row.count} 筆資料，不再重複插入`);
                    }
                });
            }
        });
    }
});

module.exports = db;