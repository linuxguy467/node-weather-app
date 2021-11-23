const fs = require('fs');
const url = require('url');
const express = require('express');
const router = express.Router();
const needle = require('needle');
const redis = require('redis');

const API_BASE_URL = process.env.API_BASE_URL ?? '';
const API_KEY_NAME = process.env.API_KEY_NAME ?? '';
const API_KEY_VALUE = process.env.API_KEY_VALUE ?? '';
const REDIS_TLS_URL = process.env.REDIS_TLS_URL ?? '';
const REDIS_EXPIRY_TIME = process.env.REDIS_EXPIRY_TIME ?? 300;

// Cache settings
const client = redis.createClient(REDIS_TLS_URL, {
  tls: {
    rejectUnauthorized: false,
  },
});

router.get('/', (req, res) => {
  const key = `/api?q=${req.query.q}`;

  client.get(key, async (err, data) => {
    if (err) {
      res.status(500).json(err);
    }
    if (data) {
      // send the data from cache
      return res.status(200).json(JSON.parse(data));
    } else {
      try {
        const params = new URLSearchParams({
          [API_KEY_NAME]: API_KEY_VALUE,
          ...url.parse(req.url, true).query,
        });
        // request data from open weather map
        const apiRes = await needle('get', `${API_BASE_URL}?${params}`);
        const data = apiRes.body;

        if (process.env.NODE_ENV !== 'production') {
          console.log(`REQUEST: ${API_BASE_URL}?${params}`);
          console.log(`Sending requested data to ${REDIS_TLS_URL}...`);
        }

        // cache into Redis
        client.setex(key, REDIS_EXPIRY_TIME, JSON.stringify(data));

        // send data to client
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json(error);
      }
    }
  });
});

module.exports = router;
