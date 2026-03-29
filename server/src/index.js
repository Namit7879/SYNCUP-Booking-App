import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import eventTypeRoutes from './routes/eventTypeRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import bufferTimeRoutes from './routes/bufferTimeRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_PORT_RETRIES = 10;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';

function isAllowedVercelOrigin(origin) {
  if (!allowVercelPreviews) return false;
  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server and same-origin requests without an Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (isAllowedVercelOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/buffer-time', bufferTimeRoutes);

app.use(errorHandler);

function startServer(port, retriesLeft = MAX_PORT_RETRIES) {
  const server = app
    .listen(port, () => {
      console.log(`Server running on port ${port}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retriesLeft > 0) {
        const nextPort = Number(port) + 1;
        console.warn(`Port ${port} is in use. Retrying on port ${nextPort}...`);
        startServer(nextPort, retriesLeft - 1);
        return;
      }

      throw err;
    });

  return server;
}

startServer(PORT);

export default app;
