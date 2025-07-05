'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { hideConfirmDialog } from '@/store/slices/uiSlice';

export default function ConfirmDialog() {
  const dispatch = useDispatch();
  const { confirmDialogOpen, confirmDialogData } = useSelector((state: RootState) => state.ui);

  const handleConfirm = () => {
    if (confirmDialogData?.onConfirm) {
      confirmDialogData.onConfirm();
    }
    dispatch(hideConfirmDialog());
  };

  const handleCancel = () => {
    if (confirmDialogData?.onCancel) {
      confirmDialogData.onCancel();
    }
    dispatch(hideConfirmDialog());
  };

  return (
    <Dialog
      open={confirmDialogOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          <Typography variant="h6">
            {confirmDialogData?.title || 'Confirm Action'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1">
          {confirmDialogData?.message || 'Are you sure you want to proceed?'}
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
