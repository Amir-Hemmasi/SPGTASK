import React from 'react';
import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';

export default function Loading() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffffd9',
        zIndex: 100,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
