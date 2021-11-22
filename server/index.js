const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 10000, // 10 Mins
  max: 100,
});
app.use(limiter);
app.set('trust proxy', 1);

// Static folder
app.use(express.static('./public'));

// Routes
app.use('/api', require('./routes'));

// Enable cors
app.use(cors());

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
