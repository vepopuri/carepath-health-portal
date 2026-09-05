import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '../components/common/PageHeader';
import { memberService } from '../services';
import type { AddDependentInput } from '../services';
import type { Dependent, Member, Relationship } from '../types/domain';

const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  self: 'Policyholder',
  spouse: 'Spouse',
  child: 'Child',
  other: 'Other',
};

const ADDABLE_RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'other', label: 'Other' },
];

function AddDependentDialog({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (d: Dependent) => void }) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('child');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setRelationship('child');
      setDateOfBirth('');
    }
  }, [open]);

  async function handleSubmit() {
    const input: AddDependentInput = { name: name.trim(), relationship, dateOfBirth: new Date(dateOfBirth).toISOString() };
    setSaving(true);
    const dependent = await memberService.addDependent(input);
    setSaving(false);
    onAdded(dependent);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add a dependent</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
          <Grid size={12}>
            <TextField fullWidth size="small" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Relationship</InputLabel>
              <Select label="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value as Relationship)}>
                {ADDABLE_RELATIONSHIPS.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date of birth"
              InputLabelProps={{ shrink: true }}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={saving || !name.trim() || !dateOfBirth} onClick={handleSubmit}>
          {saving ? 'Adding…' : 'Add dependent'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RemoveDependentDialog({ dependent, onClose, onRemoved }: { dependent: Dependent | null; onClose: () => void; onRemoved: (id: string) => void }) {
  const [removing, setRemoving] = useState(false);

  async function handleConfirm() {
    if (!dependent) return;
    setRemoving(true);
    await memberService.removeDependent(dependent.id);
    setRemoving(false);
    onRemoved(dependent.id);
  }

  return (
    <Dialog open={!!dependent} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Remove {dependent?.name} from your plan?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This is a demo action — no real coverage is affected. In a live plan, removing a dependent outside open enrollment usually requires a qualifying life event.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" disabled={removing} onClick={handleConfirm}>
          {removing ? 'Removing…' : 'Remove'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PersonCard({
  name,
  relationship,
  dateOfBirth,
  subtitle,
  onRemove,
}: {
  name: string;
  relationship: Relationship;
  dateOfBirth: string;
  subtitle: string;
  onRemove?: () => void;
}) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: relationship === 'self' ? 'primary.main' : 'grey.300', color: relationship === 'self' ? '#fff' : 'text.primary', width: 44, height: 44 }}>
            {name.slice(0, 1)}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={700}>
              {name}
            </Typography>
            <Chip size="small" label={RELATIONSHIP_LABELS[relationship]} variant="outlined" sx={{ mt: 0.25 }} />
          </Box>
        </Stack>
        {onRemove && (
          <IconButton size="small" aria-label={`Remove ${name}`} onClick={onRemove}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      <Stack sx={{ mt: 2 }} gap={0.5}>
        <Typography variant="body2" color="text.secondary">
          Born {new Date(dateOfBirth).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>
    </Paper>
  );
}

export function FamilyPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Dependent | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    Promise.all([memberService.getMember(), memberService.getDependents()]).then(([m, deps]) => {
      setMember(m);
      setDependents(deps);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Box>
      <PageHeader
        title="Family"
        description="See who's covered under your CarePath plan and add or remove dependents."
        breadcrumbs={['Overview', 'Family']}
        actions={
          <Button variant="contained" startIcon={<PersonAddAltOutlinedIcon />} onClick={() => setAddOpen(true)}>
            Add dependent
          </Button>
        }
      />

      {notice && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {member && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <PersonCard
              name={member.name}
              relationship="self"
              dateOfBirth={member.dateOfBirth}
              subtitle={`Member #${member.memberNumber}`}
            />
          </Grid>
          {dependents.map((d) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={d.id}>
              <PersonCard
                name={d.name}
                relationship={d.relationship}
                dateOfBirth={d.dateOfBirth}
                subtitle={`Covered under ${member.name.split(' ')[0]}'s plan`}
                onRemove={() => setRemoveTarget(d)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <AddDependentDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={(dependent) => {
          setAddOpen(false);
          setNotice(`${dependent.name} has been added to your plan.`);
          refresh();
        }}
      />

      <RemoveDependentDialog
        dependent={removeTarget}
        onClose={() => setRemoveTarget(null)}
        onRemoved={(id) => {
          const removed = dependents.find((d) => d.id === id);
          setRemoveTarget(null);
          setNotice(removed ? `${removed.name} has been removed from your plan.` : 'Dependent removed.');
          refresh();
        }}
      />
    </Box>
  );
}
