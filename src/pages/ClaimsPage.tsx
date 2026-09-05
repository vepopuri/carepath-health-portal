import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { claimService, providerService, memberService } from '../services';
import type { CoveredPerson } from '../services';
import type { Claim, ClaimStatus, Provider } from '../types/domain';

const FILTERS: { id: ClaimStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'in_review', label: 'In review' },
  { id: 'approved', label: 'Approved' },
  { id: 'paid', label: 'Paid' },
  { id: 'denied', label: 'Denied' },
];

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function FileClaimDialog({ open, onClose, providers, coveredPeople, onFiled }: { open: boolean; onClose: () => void; providers: Provider[]; coveredPeople: CoveredPerson[]; onFiled: (c: Claim) => void }) {
  const [patientId, setPatientId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPatientId(coveredPeople[0]?.id ?? '');
      setProviderId('');
      setServiceDate('');
      setServiceType('');
    }
  }, [open, coveredPeople]);

  async function handleSubmit() {
    const patient = coveredPeople.find((p) => p.id === patientId)!;
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;
    setSaving(true);
    const claim = await claimService.fileClaim({
      patientId: patient.id,
      patientName: patient.name,
      providerId: provider.id,
      providerName: `${provider.name}, ${provider.credentials}`,
      serviceDate: new Date(serviceDate || Date.now()).toISOString(),
      serviceType,
    });
    setSaving(false);
    onFiled(claim);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>File a claim</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Patient</InputLabel>
              <Select label="Patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                {coveredPeople.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Provider</InputLabel>
              <Select label="Provider" value={providerId} onChange={(e) => setProviderId(e.target.value)}>
                {providers.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}, {p.credentials} — {p.specialty}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Service date"
              InputLabelProps={{ shrink: true }}
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <TextField fullWidth size="small" label="What was the visit for?" placeholder="e.g. Follow-up visit" value={serviceType} onChange={(e) => setServiceType(e.target.value)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={saving || !patientId || !providerId || !serviceType.trim()} onClick={handleSubmit}>
          {saving ? 'Submitting…' : 'Submit claim'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ClaimsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [coveredPeople, setCoveredPeople] = useState<CoveredPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  function refresh() {
    setLoading(true);
    claimService.list().then((result) => {
      setClaims(result);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
    providerService.list({ network: 'in_network' }).then(setProviders);
    memberService.getCoveredPeople().then(setCoveredPeople);
  }, []);

  const rows = useMemo(() => (statusFilter === 'all' ? claims : claims.filter((c) => c.status === statusFilter)), [claims, statusFilter]);
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of claims) map[c.status] = (map[c.status] ?? 0) + 1;
    return map;
  }, [claims]);

  return (
    <Box>
      <PageHeader
        title="Claims"
        description="Track claims submitted for you and your covered family members."
        breadcrumbs={['Overview', 'Claims']}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            File a claim
          </Button>
        }
      />

      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            label={f.id === 'all' ? `All (${claims.length})` : `${f.label} (${counts[f.id] ?? 0})`}
            onClick={() => setStatusFilter(f.id)}
            color={statusFilter === f.id ? 'primary' : 'default'}
            variant={statusFilter === f.id ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Paper>
        {rows.length === 0 ? (
          <EmptyState title="No claims in this state" description="Try a different filter, or file a new claim." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Claim</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Service date</TableCell>
                  <TableCell align="right">Billed</TableCell>
                  <TableCell align="right">You owe</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/claims/${c.id}`)}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{c.claimNumber}</TableCell>
                    <TableCell>{c.patientName}</TableCell>
                    <TableCell>{c.serviceType}</TableCell>
                    <TableCell>{c.providerName}</TableCell>
                    <TableCell>{new Date(c.serviceDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{formatMoney(c.billedAmount)}</TableCell>
                    <TableCell align="right">{formatMoney(c.memberResponsibility)}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <FileClaimDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        providers={providers}
        coveredPeople={coveredPeople}
        onFiled={(claim) => {
          setDialogOpen(false);
          refresh();
          navigate(`/claims/${claim.id}`);
        }}
      />
    </Box>
  );
}
