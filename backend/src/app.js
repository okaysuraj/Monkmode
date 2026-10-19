import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    name: 'Monkmode Backend API',
    status: 'online',
    docs: '/api',
  });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
