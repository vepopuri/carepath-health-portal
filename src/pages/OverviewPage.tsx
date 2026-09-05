import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { useNavigate } from 'react-router-dom';
import { DemoDataChip } from '../components/common/DemoDataChip';
import { StatusBadge } from '../components/common/StatusBadge';
import { memberService, planService, claimService, priorAuthService, paymentService } from '../services';
import type { Claim, Dependent, Member, Payment, Plan, PriorAuthorization } from '../types/domain';

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function OverviewPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [priorAuths, setPriorAuths] = useState<PriorAuthorization[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      memberService.getMember(),
      memberService.getDependents(),
      planService.getPlan(),
      claimService.list(),
      priorAuthService.list(),
      paymentService.list(),
    ]).then(([m, deps, p, c, pa, pay]) => {
      if (cancelled) return;
      setMember(m);
      setDependents(deps);
      setPlan(p);
      setClaims(c);
      setPriorAuths(pa);
      setPayments(pay);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const recentActivity = useMemo(() => {
    const items = [
      ...claims.slice(0, 4).map((c) => ({
        ts: c.submittedDate,
        icon: <ReceiptLongOutlinedIcon fontSize="small" />,
        text: `${c.serviceType} for ${c.patientName} — ${c.providerName}`,
        status: c.status,
      })),
      ...priorAuths.slice(0, 2).map((p) => ({
        ts: p.requestedDate,
        icon: <FactCheckOutlinedIcon fontSize="small" />,
        text: `Prior authorization: ${p.serviceRequested} for ${p.patientName}`,
        status: p.status,
      })),
    ];
    return items.sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 6);
  }, [claims, priorAuths]);

  const nextPayment = payments.find((p) => p.status === 'scheduled' || p.status === 'pending');
  const pendingPriorAuths = priorAuths.filter((p) => p.status === 'pending').length;
  const activeClaims = claims.filter((c) => c.status === 'submitted' || c.status === 'in_review').length;

  if (!member || !plan) {
    return (
      <Box>
        <LinearProgress sx={{ mb: 2 }} />
      </Box>
    );
  }

  const deductiblePct = Math.min(100, Math.round((plan.deductibleMetIndividual / plan.deductibleIndividual) * 100));
  const oopPct = Math.min(100, Math.round((plan.outOfPocketMetIndividual / plan.outOfPocketMaxIndividual) * 100));

  return (
    <Box>
      <Paper
        sx={{
          mx: { xs: -2, md: -3 },
          mt: { xs: -2, md: -3 },
          p: { xs: 4, sm: 6, md: 8 },
          mb: { xs: 4, md: 6 },
          background: 'linear-gradient(135deg, #093E3E 0%, #0D7377 100%)',
          color: '#fff',
          borderRadius: 0,
        }}
      >
        <Stack direction="row" sx={{ mb: 2 }}>
          <DemoDataChip label="Demo member" />
        </Stack>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 800, mb: 1 }}>
          Welcome back, {member.name.split(' ')[0]}
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 3, maxWidth: 560 }}>
          {plan.name} · Member #{member.memberNumber} · Group {plan.groupNumber}
        </Typography>
        <Stack direction="row" gap={1.5} flexWrap="wrap">
          <Button variant="contained" sx={{ bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#EAF4F4' } }} startIcon={<SearchOutlinedIcon />} onClick={() => navigate('/find-care')}>
            Find care
          </Button>
          <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }} startIcon={<ReceiptLongOutlinedIcon />} onClick={() => navigate('/claims')}>
            File a claim
          </Button>
          <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }} startIcon={<BadgeOutlinedIcon />} onClick={() => navigate('/documents')}>
            View ID card
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="overline" color="text.secondary">
              Deductible (individual)
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {formatMoney(plan.deductibleMetIndividual)} <Typography component="span" variant="body2" color="text.secondary">of {formatMoney(plan.deductibleIndividual)}</Typography>
            </Typography>
            <LinearProgress variant="determinate" value={deductiblePct} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {deductiblePct}% met for {new Date(plan.effectiveDate).getUTCFullYear()}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="overline" color="text.secondary">
              Out-of-pocket max (individual)
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {formatMoney(plan.outOfPocketMetIndividual)} <Typography component="span" variant="body2" color="text.secondary">of {formatMoney(plan.outOfPocketMaxIndividual)}</Typography>
            </Typography>
            <LinearProgress variant="determinate" value={oopPct} color="secondary" sx={{ height: 8, borderRadius: 4, mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {oopPct}% of your annual maximum reached
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2.5, cursor: 'pointer' }} onClick={() => navigate('/claims')}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <ReceiptLongOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{activeClaims}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Claims in progress
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2.5, cursor: 'pointer' }} onClick={() => navigate('/prior-authorizations')}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <FactCheckOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{pendingPriorAuths}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Authorizations pending
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2.5, cursor: 'pointer' }} onClick={() => navigate('/billing')}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <PaymentsOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{nextPayment ? formatMoney(nextPayment.amount) : '—'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {nextPayment ? `Due ${new Date(nextPayment.dueDate).toLocaleDateString()}` : 'No payment due'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              Recent activity
            </Typography>
            <List dense disablePadding>
              {recentActivity.map((item, i) => (
                <Box key={i}>
                  <ListItem disableGutters>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'grey.200', color: 'text.primary' }}>{item.icon}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.text}
                      secondary={new Date(item.ts).toLocaleDateString()}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <StatusBadge status={item.status} />
                  </ListItem>
                  {i < recentActivity.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="h3">Who's covered</Typography>
              <Button size="small" onClick={() => navigate('/family')}>
                Manage
              </Button>
            </Stack>
            <Stack gap={1.5}>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{member.name.slice(0, 1)}</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {member.name}
                  </Typography>
                  <Chip size="small" label="Policyholder" variant="outlined" />
                </Box>
              </Stack>
              {dependents.map((d) => (
                <Stack direction="row" alignItems="center" gap={1.5} key={d.id}>
                  <Avatar sx={{ bgcolor: 'grey.300', color: 'text.primary' }}>{d.name.slice(0, 1)}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {d.name}
                    </Typography>
                    <Chip size="small" label={d.relationship} variant="outlined" sx={{ textTransform: 'capitalize' }} />
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
