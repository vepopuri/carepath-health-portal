import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedDatabaseIfEmpty } from './seed.js';
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

app.use('/api', memberRouter);
app.use('/api', planRouter);
app.use('/api', providersRouter);
app.use('/api', claimsRouter);
app.use('/api', priorAuthorizationsRouter);
app.use('/api', paymentsRouter);
app.use('/api', documentsRouter);

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
