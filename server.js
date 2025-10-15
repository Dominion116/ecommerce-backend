import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import config from './config.js';
import userRouter from './routers/userRouter.js';
import orderRouter from './routers/orderRouter.js';
import productRouter from './routers/productRouter.js';
import uploadRouter from './routers/uploadRouter.js';

const __dirname = path.resolve();

mongoose
  .connect(config.MONGODB_URL)
  .then(() => console.log('Connected to mongodb.'))
  .catch((error) => console.log(error));

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/uploads', uploadRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

app.get('/api/paypal/clientId', (req, res) => {
  res.send({ clientId: config.PAYPAL_CLIENT_ID });
});

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use(express.static(path.join(__dirname, '/frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/frontend/index.html'));
});

app.use((err, req, res, next) => {
  const status = err.name && err.name === 'ValidationError' ? 400 : 500;
  res.status(status).send({ message: err.message });
});

app.listen(config.PORT, () => {
  console.log(`serve at http://localhost:${config.PORT}`);
});
