const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // 啟用 CORS
app.use(express.json());

// ...existing code for routes...

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
