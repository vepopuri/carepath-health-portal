import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { planService } from '../services';
import type { Plan } from '../types/domain';

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function MyPlanPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    let cancelled = false;
    planService.getPlan().then((p) => {
      if (!cancelled) setPlan(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    if (!plan) return [];
    const byCategory = new Map<string, typeof plan.coverage>();
    for (const item of plan.coverage) {
      if (!byCategory.has(item.category)) byCategory.set(item.category, []);
      byCategory.get(item.category)!.push(item);
    }
    return Array.from(byCategory.entries());
  }, [plan]);

  if (!plan) {
    return (
      <Box>
        <LinearProgress sx={{ mb: 2 }} />
      </Box>
    );
  }

  const deductiblePct = Math.min(100, Math.round((plan.deductibleMetIndividual / plan.deductibleIndividual) * 100));
  const oopPct = Math.min(100, Math.round((plan.outOfPocketMetIndividual / plan.outOfPocketMaxIndividual) * 100));
  const familyDeductiblePct = Math.min(100, Math.round((plan.deductibleMetFamily / plan.deductibleFamily) * 100));
  const familyOopPct = Math.min(100, Math.round((plan.outOfPocketMetFamily / plan.outOfPocketMaxFamily) * 100));

  return (
    <Box>
      <PageHeader
        title="My Plan"
        description={`${plan.name} — ${plan.type} · Effective ${new Date(plan.effectiveDate).toLocaleDateString()} through ${new Date(plan.renewalDate).toLocaleDateString()}`}
        breadcrumbs={['Overview', 'My Plan']}
        actions={
          <Button variant="outlined" startIcon={<DescriptionOutlinedIcon />} onClick={() => navigate('/documents')}>
            View plan document
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Deductible
            </Typography>
            <Stack gap={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Individual (you)</Typography>
                  <Typography variant="body2">{formatMoney(plan.deductibleMetIndividual)} / {formatMoney(plan.deductibleIndividual)}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={deductiblePct} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Family</Typography>
                  <Typography variant="body2">{formatMoney(plan.deductibleMetFamily)} / {formatMoney(plan.deductibleFamily)}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={familyDeductiblePct} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Out-of-pocket maximum
            </Typography>
            <Stack gap={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Individual (you)</Typography>
                  <Typography variant="body2">{formatMoney(plan.outOfPocketMetIndividual)} / {formatMoney(plan.outOfPocketMaxIndividual)}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={oopPct} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Family</Typography>
                  <Typography variant="body2">{formatMoney(plan.outOfPocketMetFamily)} / {formatMoney(plan.outOfPocketMaxFamily)}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={familyOopPct} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stack direction="row" gap={3} flexWrap="wrap" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Monthly premium
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatMoney(plan.premiumMonthly)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Group number
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {plan.groupNumber}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Plan type
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {plan.type} · {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h3" sx={{ mb: 1.5 }}>
        Coverage details
      </Typography>
      {groups.map(([category, items]) => (
        <Paper key={category} sx={{ mb: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2">{category}</Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell>{item.costShare}</TableCell>
                    <TableCell align="right">
                      {item.priorAuthRequired && <Chip size="small" label="Prior auth required" color="warning" variant="outlined" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Box>
  );
}
