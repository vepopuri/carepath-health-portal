import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import StarIcon from '@mui/icons-material/Star';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { providerService } from '../services';
import type { Provider } from '../types/domain';

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export function ProviderDetailsPage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (providerId) {
      providerService.getById(providerId).then((result) => {
        if (!cancelled) {
          setProvider(result);
          setLoading(false);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  if (loading) {
    return (
      <Box>
        <LinearProgress sx={{ mb: 2 }} />
      </Box>
    );
  }

  if (!provider) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/find-care')} sx={{ mb: 2 }}>
          Back to Find Care
        </Button>
        <EmptyState title="Provider not found" description="It may have been removed from the demo directory." />
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/find-care')} sx={{ mb: 1 }}>
        Back to Find Care
      </Button>
      <PageHeader
        title={`${provider.name}, ${provider.credentials}`}
        description={provider.specialty}
        breadcrumbs={['Find Care', provider.name]}
      />

      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
        <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mb: 2 }}>
          <StatusBadge status={provider.network} />
          {provider.acceptingNewPatients ? (
            <Chip size="small" label="Accepting new patients" color="success" variant="outlined" />
          ) : (
            <Chip size="small" label="Not accepting new patients" variant="outlined" />
          )}
          {provider.telehealth && <Chip size="small" icon={<VideocamOutlinedIcon />} label="Telehealth available" variant="outlined" />}
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb: 2 }}>
          <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
          <Typography variant="body2">{provider.rating.toFixed(1)} rating</Typography>
        </Stack>
        <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1 }}>
          <PlaceOutlinedIcon fontSize="small" color="disabled" />
          <Typography variant="body2">
            {provider.address}, {provider.city}, {provider.state} {provider.zip} · {provider.distanceMiles} mi away
          </Typography>
        </Stack>
        <Stack direction="row" gap={1} alignItems="center">
          <PhoneOutlinedIcon fontSize="small" color="disabled" />
          <Typography variant="body2">{provider.phone}</Typography>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <DetailSection title="About">
              <Typography variant="body2">{provider.bio}</Typography>
            </DetailSection>
            <DetailSection title="Languages spoken">
              <Stack direction="row" gap={0.5} flexWrap="wrap">
                {provider.languages.map((l) => (
                  <Chip key={l} size="small" label={l} variant="outlined" />
                ))}
              </Stack>
            </DetailSection>
            {provider.network === 'out_of_network' && (
              <DetailSection title="Coverage note">
                <Typography variant="body2" color="text.secondary">
                  This provider is out-of-network under your plan. Visits may require an approved referral and typically
                  cost more out of pocket.
                </Typography>
              </DetailSection>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              Book with this provider
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Scheduling isn't connected in this demo — this button shows the flow a real appointment request would start.
            </Typography>
            <Stack gap={1}>
              <Button variant="contained" disabled>
                Request an appointment
              </Button>
              <Button variant="outlined" startIcon={<FactCheckOutlinedIcon />} onClick={() => navigate('/prior-authorizations')}>
                Check if a referral is needed
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
