import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { claimService, providerService } from '../services';
import type { Claim, Provider } from '../types/domain';

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AmountRow({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography variant="body2" fontWeight={emphasize ? 700 : 400}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={emphasize ? 700 : 400}>
        {formatMoney(value)}
      </Typography>
    </Stack>
  );
}

export function ClaimDetailsPage() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | undefined>();
  const [provider, setProvider] = useState<Provider | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (claimId) {
      claimService.getById(claimId).then(async (result) => {
        if (cancelled) return;
        setClaim(result);
        if (result) {
          const p = await providerService.getById(result.providerId);
          if (!cancelled) setProvider(p);
        }
        setLoading(false);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [claimId]);

  if (loading) {
    return (
      <Box>
        <LinearProgress sx={{ mb: 2 }} />
      </Box>
    );
  }

  if (!claim) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/claims')} sx={{ mb: 2 }}>
          Back to Claims
        </Button>
        <EmptyState title="Claim not found" description="It may have been removed from the demo dataset." />
      </Box>
    );
  }

  const isPending = claim.status === 'submitted' || claim.status === 'in_review';

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/claims')} sx={{ mb: 1 }}>
        Back to Claims
      </Button>
      <PageHeader
        title={claim.serviceType}
        description={`Claim ${claim.claimNumber} for ${claim.patientName}`}
        breadcrumbs={['Claims', claim.claimNumber]}
        actions={<StatusBadge status={claim.status} size="medium" />}
      />

      {claim.status === 'denied' && claim.denialReason && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>This claim was denied.</strong> {claim.denialReason}
        </Alert>
      )}
      {isPending && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This claim is still being processed. You'll be notified here once your insurer finishes review.
        </Alert>
      )}

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Stack direction="row" gap={4} flexWrap="wrap">
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Provider
            </Typography>
            <Typography variant="body2">{claim.providerName}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Service date
            </Typography>
            <Typography variant="body2">{new Date(claim.serviceDate).toLocaleDateString()}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Submitted
            </Typography>
            <Typography variant="body2">{new Date(claim.submittedDate).toLocaleDateString()}</Typography>
          </Box>
          {claim.processedDate && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Processed
              </Typography>
              <Typography variant="body2">{new Date(claim.processedDate).toLocaleDateString()}</Typography>
            </Box>
          )}
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Diagnosis summary
          </Typography>
          <Typography variant="body2">{claim.diagnosisSummary}</Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              Cost breakdown
            </Typography>
            <AmountRow label="Amount billed by provider" value={claim.billedAmount} />
            <AmountRow label="Plan-allowed amount" value={claim.allowedAmount} />
            <Divider sx={{ my: 1 }} />
            <AmountRow label="Applied to deductible" value={claim.deductibleApplied} />
            <AmountRow label="Copay" value={claim.copayApplied} />
            <AmountRow label="Coinsurance" value={claim.coinsuranceApplied} />
            <Divider sx={{ my: 1 }} />
            <AmountRow label="Plan paid" value={claim.planPaid} />
            <AmountRow label="You owe" value={claim.memberResponsibility} emphasize />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              Provider
            </Typography>
            {provider ? (
              <Stack gap={1}>
                <Typography variant="body2" fontWeight={600}>
                  {provider.name}, {provider.credentials}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {provider.specialty}
                </Typography>
                <Chip size="small" label={provider.network === 'in_network' ? 'In-network' : 'Out-of-network'} sx={{ width: 'fit-content' }} />
                <Button size="small" sx={{ width: 'fit-content', mt: 1 }} onClick={() => navigate(`/find-care/${provider.id}`)}>
                  View provider
                </Button>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Provider details unavailable.
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Button variant="outlined" fullWidth startIcon={<DescriptionOutlinedIcon />} disabled={!claim.eobAvailable} onClick={() => navigate('/documents')}>
              {claim.eobAvailable ? 'View explanation of benefits (EOB)' : 'EOB not yet available'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
