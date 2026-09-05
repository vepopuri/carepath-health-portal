import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';
import { DemoDataChip } from './DemoDataChip';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: string[];
  actions?: ReactNode;
  showDemoChip?: boolean;
}

export function PageHeader({ title, description, breadcrumbs, actions, showDemoChip = true }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }} aria-label="breadcrumb">
          {breadcrumbs.map((b, i) => (
            <Typography
              key={b}
              color={i === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary'}
              variant="body2"
              component={i === breadcrumbs.length - 1 ? 'span' : Link}
            >
              {b}
            </Typography>
          ))}
        </Breadcrumbs>
      )}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 700, letterSpacing: '-0.015em' }}>
              {title}
            </Typography>
            {showDemoChip && <DemoDataChip />}
          </Stack>
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 720, fontSize: '1.02rem' }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Stack>
    </Box>
  );
}
