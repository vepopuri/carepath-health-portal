import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LinearProgress from '@mui/material/LinearProgress';
import SearchIcon from '@mui/icons-material/Search';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { providerService, type ProviderFilters } from '../services';
import type { Provider } from '../types/domain';

export function FindCarePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [networkOnly, setNetworkOnly] = useState<'any' | 'in_network'>('in_network');
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providerService.list().then(setAllProviders);
  }, []);

  const filters: ProviderFilters = useMemo(
    () => ({
      search: search || undefined,
      specialty: specialty === 'all' ? undefined : specialty,
      network: networkOnly === 'any' ? undefined : networkOnly,
      telehealthOnly: telehealthOnly || undefined,
    }),
    [search, specialty, networkOnly, telehealthOnly],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    providerService.list(filters).then((result) => {
      if (!cancelled) {
        setProviders(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const specialties = useMemo(() => Array.from(new Set(allProviders.map((p) => p.specialty))).sort(), [allProviders]);

  return (
    <Box>
      <PageHeader title="Find Care" description="Search in-network doctors and specialists near you." breadcrumbs={['Overview', 'Find Care']} />

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, specialty, or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Specialty</InputLabel>
            <Select label="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <MenuItem value="all">All specialties</MenuItem>
              {specialties.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup size="small" exclusive value={networkOnly} onChange={(_, v) => v && setNetworkOnly(v)}>
            <ToggleButton value="in_network">In-network only</ToggleButton>
            <ToggleButton value="any">All providers</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButton size="small" value="telehealth" selected={telehealthOnly} onChange={() => setTelehealthOnly((v) => !v)}>
            <VideocamOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Telehealth
          </ToggleButton>
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {providers.length} providers found
      </Typography>

      {!loading && providers.length === 0 ? (
        <EmptyState title="No providers match these filters" description="Try clearing a filter or searching a different term." />
      ) : (
        <Grid container spacing={2}>
          {providers.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <Typography variant="h4" component="h3">
                      {p.name}, {p.credentials}
                    </Typography>
                    <StatusBadge status={p.network} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                    {p.specialty} · {p.distanceMiles} mi away
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb: 1 }}>
                    <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
                    <Typography variant="body2">{p.rating.toFixed(1)}</Typography>
                  </Stack>
                  <Stack direction="row" gap={0.75} flexWrap="wrap">
                    {p.acceptingNewPatients && <Chip size="small" label="Accepting new patients" variant="outlined" color="success" />}
                    {p.telehealth && <Chip size="small" icon={<VideocamOutlinedIcon />} label="Telehealth" variant="outlined" />}
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" onClick={() => navigate(`/find-care/${p.id}`)}>
                    View details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
