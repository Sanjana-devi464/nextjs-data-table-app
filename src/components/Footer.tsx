'use client';

import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { GitHub, LinkedIn, Favorite } from '@mui/icons-material';

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
        padding: '20px',
        textAlign: 'center',
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Made with{' '}
        <Favorite sx={{ color: 'red', fontSize: 16, mx: 0.5 }} />{' '}
        by{' '}
        <Typography
          component="span"
          variant="body2"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 'bold',
          }}
        >
          Sanjana Devi
        </Typography>
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <IconButton
          href="https://www.linkedin.com/in/sanjana-devi-6719b1359/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: '#0077b5' }}
        >
          <LinkedIn />
        </IconButton>
        <IconButton
          href="https://github.com/Sanjana-devi464"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: theme.palette.text.primary }}
        >
          <GitHub />
        </IconButton>
      </Box>
    </Box>
  );
}
