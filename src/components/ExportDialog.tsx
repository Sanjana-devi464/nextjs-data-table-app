'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import { Download, FileDownload } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { RootState } from '@/store';
import { ExportFormData, TableColumn } from '@/types';
import { exportToCSV, exportToJSON } from '@/utils/csvUtils';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { rows, columns } = useSelector((state: RootState) => state.table);
  const [isExporting, setIsExporting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ExportFormData>({
    defaultValues: {
      filename: 'table_data',
      format: 'csv',
      includeHeaders: true,
      visibleColumnsOnly: true,
    },
  });

  const watchedFormat = watch('format');
  const watchedVisibleOnly = watch('visibleColumnsOnly');

  const handleExport: SubmitHandler<ExportFormData> = async (data) => {
    setIsExporting(true);
    try {
      const filename = `${data.filename}.${data.format}`;
      
      if (data.format === 'csv') {
        exportToCSV(rows, columns, filename, data.visibleColumnsOnly);
      } else if (data.format === 'json') {
        exportToJSON(rows, columns, filename, data.visibleColumnsOnly);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsExporting(false);
    onClose();
  };

  const visibleColumns = columns.filter((col: TableColumn) => col.visible);
  const columnsToExport = watchedVisibleOnly ? visibleColumns : columns;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileDownload />
          <Typography variant="h6">Export Data</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Export Options */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Export Options
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Controller
                name="filename"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Filename"
                    error={!!errors.filename}
                    helperText={errors.filename?.message}
                    fullWidth
                  />
                )}
              />
              
              <Controller
                name="format"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Format</InputLabel>
                    <Select {...field} label="Format">
                      <MenuItem value="csv">CSV (.csv)</MenuItem>
                      <MenuItem value="json">JSON (.json)</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="includeHeaders"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Include column headers"
                    disabled={watchedFormat === 'json'}
                  />
                )}
              />

              <Controller
                name="visibleColumnsOnly"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Export visible columns only"
                  />
                )}
              />
            </Box>
          </Box>

          <Divider />

          {/* Export Summary */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Export Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Rows:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {rows.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Columns to Export:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {columnsToExport.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Format:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {watchedFormat.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Column Preview */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Columns to be exported:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {columnsToExport
                .sort((a: TableColumn, b: TableColumn) => a.order - b.order)
                .map((column: TableColumn) => (
                  <Chip
                    key={column.id}
                    label={column.headerName}
                    size="small"
                    color={column.visible ? 'primary' : 'default'}
                    variant={column.visible ? 'filled' : 'outlined'}
                  />
                ))}
            </Box>
          </Box>

          {/* Warning Messages */}
          {rows.length === 0 && (
            <Alert severity="warning">
              No data to export. Please add some rows first.
            </Alert>
          )}

          {columnsToExport.length === 0 && (
            <Alert severity="warning">
              No columns selected for export. Please make at least one column visible.
            </Alert>
          )}

          {/* Loading */}
          {isExporting && (
            <Box>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Preparing export...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleExport)}
          disabled={isExporting || rows.length === 0 || columnsToExport.length === 0}
          variant="contained"
          startIcon={<Download />}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
