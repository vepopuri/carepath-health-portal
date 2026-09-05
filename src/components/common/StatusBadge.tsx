import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

const LABELS: Record<string, string> = {
  submitted: 'Submitted',
  in_review: 'In review',
  approved: 'Approved',
  denied: 'Denied',
  paid: 'Paid',
  pending: 'Pending',
  expired: 'Expired',
  scheduled: 'Scheduled',
  failed: 'Failed',
  in_network: 'In-network',
  out_of_network: 'Out-of-network',
};

type ColorKey = ChipProps['color'];

const COLORS: Record<string, ColorKey> = {
  submitted: 'info',
  in_review: 'warning',
  approved: 'success',
  denied: 'error',
  paid: 'success',
  pending: 'warning',
  expired: 'default',
  scheduled: 'info',
  failed: 'error',
  in_network: 'success',
  out_of_network: 'default',
};

export function StatusBadge({ status, size = 'small' }: { status: string; size?: ChipProps['size'] }) {
  const label = LABELS[status] ?? status;
  const color = COLORS[status] ?? 'default';
  return <Chip label={label} color={color} size={size} variant={color === 'default' ? 'outlined' : 'filled'} />;
}
