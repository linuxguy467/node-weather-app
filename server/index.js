const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW ?? 0;
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ?? 0;

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX,
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
