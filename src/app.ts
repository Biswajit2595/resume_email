import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimiter } from './middlewares/rateLimiter';
// import { sentry } from './middlewares/sentry';
import { errorHandler } from './middlewares/errorHandler';
import { connectMongo } from './services/mongo';
import routes from './routes';

export const app = express();

// app.use(sentry.requestHandler);
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny'));
app.use(rateLimiter);

app.use(routes);

// app.use(sentry.errorHandler);
app.use(errorHandler);

// Connect to MongoDB (fire-and-forget)
connectMongo().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('MongoDB connection error', error);
});
