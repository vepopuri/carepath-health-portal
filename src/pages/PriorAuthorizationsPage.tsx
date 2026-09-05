import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
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
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { priorAuthService, providerService, memberService } from '../services';
import type { CoveredPerson } from '../services';
import type { PriorAuthorization, Provider } from '../types/domain';

function RequestAuthDialog({ open, onClose, providers, coveredPeople, onRequested }: { open: boolean; onClose: () => void; providers: Provider[]; coveredPeople: CoveredPerson[]; onRequested: (p: PriorAuthorization) => void }) {
  const [patientId, setPatientId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [serviceRequested, setServiceRequested] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPatientId(coveredPeople[0]?.id ?? '');
      setProviderId('');
      setServiceRequested('');
    }
  }, [open, coveredPeople]);

  async function handleSubmit() {
    const patient = coveredPeople.find((p) => p.id === patientId)!;
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;
    setSaving(true);
    const request = await priorAuthService.requestAuthorization({
      patientId: patient.id,
      patientName: patient.name,
      providerId: provider.id,
      providerName: `${provider.name}, ${provider.credentials}`,
      serviceRequested,
    });
    setSaving(false);
    onRequested(request);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request a prior authorization</DialogTitle>
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
            <TextField fullWidth size="small" label="Service or procedure requested" placeholder="e.g. MRI of the lower back" value={serviceRequested} onChange={(e) => setServiceRequested(e.target.value)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={saving || !patientId || !providerId || !serviceRequested.trim()} onClick={handleSubmit}>
          {saving ? 'Submitting…' : 'Submit request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function PriorAuthorizationsPage() {
  const [requests, setRequests] = useState<PriorAuthorization[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [coveredPeople, setCoveredPeople] = useState<CoveredPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  function refresh() {
    setLoading(true);
    priorAuthService.list().then((result) => {
      setRequests(result);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
    providerService.list({ network: 'in_network' }).then(setProviders);
    memberService.getCoveredPeople().then(setCoveredPeople);
  }, []);

  return (
    <Box>
      <PageHeader
        title="Prior Authorizations"
        description="Some services need your insurer's approval before you receive care. Track requests here."
        breadcrumbs={['Overview', 'Prior Authorizations']}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Request authorization
          </Button>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Paper>
        {!loading && requests.length === 0 ? (
          <EmptyState title="No prior authorization requests" description="Request one when your provider recommends a service that needs approval." />
        ) : (
          <List disablePadding>
            {requests.map((r, i) => (
              <Box key={r.id}>
                <ListItem sx={{ py: 2 }} secondaryAction={<StatusBadge status={r.status} />}>
                  <ListItemText
                    primary={r.serviceRequested}
                    secondary={
                      <>
                        {r.patientName} · {r.providerName}
                        <br />
                        Requested {new Date(r.requestedDate).toLocaleDateString()}
                        {r.decisionDate && ` · Decided ${new Date(r.decisionDate).toLocaleDateString()}`}
                        {r.validThrough && ` · Valid through ${new Date(r.validThrough).toLocaleDateString()}`}
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {r.notes}
                        </Typography>
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {i < requests.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Paper>

      <RequestAuthDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        providers={providers}
        coveredPeople={coveredPeople}
        onRequested={() => {
          setDialogOpen(false);
          refresh();
        }}
      />
    </Box>
  );
}
