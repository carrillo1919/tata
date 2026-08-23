import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { env } from './config/env.js';
import { csrfGuard } from './middlewares/csrfGuard.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const swaggerDocument = YAML.load(new URL('./docs/openapi.yaml', import.meta.url).pathname);

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(csrfGuard);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', routes);

app.use(errorHandler);
