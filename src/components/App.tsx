'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setColumnManagerOpen, setImportDialogOpen, setExportDialogOpen } from '@/store/slices/uiSlice';
import DataTable from '@/components/DataTable';
import Toolbar from '@/components/Toolbar';
import Footer from '@/components/Footer';
import ColumnManager from '@/components/ColumnManager';
import ImportDialog from '@/components/ImportDialog';
import ExportDialog from '@/components/ExportDialog';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function App() {
  const dispatch = useDispatch();
  const {
    columnManagerOpen,
    importDialogOpen,
    exportDialogOpen,
  } = useSelector((state: RootState) => state.ui);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Toolbar */}
      <Toolbar />
      
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <DataTable />
      </Container>

      {/* Dialogs */}
      <ColumnManager
        open={columnManagerOpen}
        onClose={() => dispatch(setColumnManagerOpen(false))}
      />
      
      <ImportDialog
        open={importDialogOpen}
        onClose={() => dispatch(setImportDialogOpen(false))}
      />
      
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => dispatch(setExportDialogOpen(false))}
      />
      
      <ConfirmDialog />
      
      {/* Footer */}
      <Footer />
    </Box>
  );
}
