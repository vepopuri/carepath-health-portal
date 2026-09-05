import Box from '@mui/material/Box';
import { useId } from 'react';

/** CarePath brand mark: a rounded cross inside a circle — simple, calm, and legible at small sizes. */
export function CarePathMark({ size = 32 }: { size?: number }) {
  const gradId = useId();
  return (
    <Box component="svg" viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="CarePath" sx={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D7377" />
          <stop offset="100%" stopColor="#093E3E" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${gradId})`} />
      <path
        d="M50 24 a8 8 0 0 1 8 8 v10 h10 a8 8 0 0 1 0 16 h-10 v10 a8 8 0 0 1 -16 0 v-10 h-10 a8 8 0 0 1 0 -16 h10 v-10 a8 8 0 0 1 8 -8 z"
        fill="#FFFFFF"
      />
    </Box>
  );
}
