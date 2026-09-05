import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { paymentService } from '../services';
import { plan } from '../data/plan';
import type { Payment } from '../types/domain';

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    paymentService.list().then((result) => {
      setPayments(result);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  const upcoming = payments.find((p) => p.status === 'scheduled' || p.status === 'pending');

  async function handlePayNow(id: string) {
    setPayingId(id);
    const updated = await paymentService.payNow(id);
    setPayingId(null);
    if (updated) {
      setConfirmation(`Payment of ${formatMoney(updated.amount)} received for ${updated.periodLabel}. This is a demo — no real charge was made.`);
      refresh();
    }
  }

  return (
    <Box>
      <PageHeader title="Billing & Payments" description="Manage your premium payments and view your billing history." breadcrumbs={['Overview', 'Billing & Payments']} />

      {confirmation && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setConfirmation(null)}>
          {confirmation}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Monthly premium
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {formatMoney(plan.premiumMonthly)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {plan.name} · Autopay enabled
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Next payment
            </Typography>
            {upcoming ? (
              <>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {formatMoney(upcoming.amount)}
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Due {new Date(upcoming.dueDate).toLocaleDateString()} · {upcoming.method}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PaymentsOutlinedIcon />}
                    disabled={payingId === upcoming.id}
                    onClick={() => handlePayNow(upcoming.id)}
                  >
                    {payingId === upcoming.id ? 'Processing…' : 'Pay now'}
                  </Button>
                </Stack>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                You're all caught up — no payment due.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Typography variant="h3" sx={{ mb: 1.5 }}>
        Payment history
      </Typography>
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Due date</TableCell>
                <TableCell>Method</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.periodLabel}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{p.invoiceNumber}</TableCell>
                  <TableCell>{new Date(p.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell align="right">{formatMoney(p.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
