import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedDatabaseIfEmpty } from './seed.js';
import { requireAuth } from './auth.js';
import { authRouter } from './routes/auth.js';
import { memberRouter } from './routes/member.js';
import { planRouter } from './routes/plan.js';
import { providersRouter } from './routes/providers.js';
import { claimsRouter } from './routes/claims.js';
import { priorAuthorizationsRouter } from './routes/priorAuthorizations.js';
import { paymentsRouter } from './routes/payments.js';
import { documentsRouter } from './routes/documents.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

seedDatabaseIfEmpty();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api', authRouter);
app.use('/api', requireAuth, memberRouter);
app.use('/api', requireAuth, planRouter);
app.use('/api', requireAuth, providersRouter);
app.use('/api', requireAuth, claimsRouter);
app.use('/api', requireAuth, priorAuthorizationsRouter);
app.use('/api', requireAuth, paymentsRouter);
app.use('/api', requireAuth, documentsRouter);

if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '..', 'dist');
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`CarePath API listening on http://localhost:${PORT}`);
});
