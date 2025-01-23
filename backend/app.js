import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './router';
import errorMiddleware from './middlewares/errorMiddleware';

const app = express();

app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(morgan('dev'));

const state = { isShutdown: false };

process.on('SIGTERM', () => {
  state.isShutdown = true;
});

app.get('/health', async (req, res) => {
  if (state.isShutdown) {
    res.status(500);
    return res.json({ ok: false });
  }
  if (mongoose.connection.readyState !== 1) {
    res.status(500);
    return res.json({ ok: false });
  }

  return res.json({ ok: true });
});

app.use('/api', routes);
app.use(errorMiddleware);

export default app;
