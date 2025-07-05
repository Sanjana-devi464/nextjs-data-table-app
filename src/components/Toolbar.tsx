'use client';

import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Toolbar as MuiToolbar,
  AppBar,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material';
import {
  ViewColumn,
  FileUpload,
  FileDownload,
  Delete,
  LightMode,
  DarkMode,
  Save,
  Cancel,
  Add,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import {
  setColumnManagerOpen,
  setImportDialogOpen,
  setExportDialogOpen,
  toggleTheme,
  showConfirmDialog,
} from '@/store/slices/uiSlice';
import {
  deleteRows,
  addRow,
  setEditingRows,
  setSelectedRows,
} from '@/store/slices/tableSlice';
import { TableRow, TableColumn } from '@/types';
import { generateClientId } from '@/utils/idGenerator';

export default function Toolbar() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);
  const { 
    rows, 
    columns, 
    selectedRows, 
    editingRows 
  } = useSelector((state: RootState) => state.table);

  const handleAddRow = () => {
    const newRow: TableRow = {
      id: generateClientId('row'),
      name: '',
      email: '',
      age: 0,
      role: '',
      department: '',
      location: '',
    };
    
    dispatch(addRow(newRow));
    dispatch(setEditingRows([newRow.id]));
  };

  const handleDeleteSelected = () => {
    dispatch(showConfirmDialog({
      title: 'Delete Selected Rows',
      message: `Are you sure you want to delete ${selectedRows.length} selected row(s)? This action cannot be undone.`,
      onConfirm: () => {
        dispatch(deleteRows(selectedRows));
        dispatch(setSelectedRows([]));
      },
    }));
  };

  const handleSaveAll = () => {
    // Stop editing all rows (validation should have been done in individual cells)
    dispatch(setEditingRows([]));
  };

  const handleCancelAll = () => {
    dispatch(showConfirmDialog({
      title: 'Cancel All Edits',
      message: 'Are you sure you want to cancel all edits? Any unsaved changes will be lost.',
      onConfirm: () => {
        dispatch(setEditingRows([]));
        // Note: In a real app, you might want to revert changes here
      },
    }));
  };

  const visibleColumns = columns.filter((col: TableColumn) => col.visible);
  const hasSelectedRows = selectedRows.length > 0;
  const hasEditingRows = editingRows.length > 0;

  return (
    <AppBar position="static" color="default" elevation={1}>
      <MuiToolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dynamic Data Table Manager
        </Typography>
        
        {/* Table Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Chip
            label={`${rows.length} rows`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${visibleColumns.length}/${columns.length} columns`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Add Row */}
          <Tooltip title="Add New Row">
            <Button
              startIcon={<Add />}
              onClick={handleAddRow}
              variant="contained"
              size="small"
            >
              Add Row
            </Button>
          </Tooltip>

          {/* Bulk Actions */}
          {hasSelectedRows && (
            <Tooltip title={`Delete ${selectedRows.length} selected rows`}>
              <IconButton
                onClick={handleDeleteSelected}
                color="error"
              >
                <Badge badgeContent={selectedRows.length} color="error">
                  <Delete />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Edit Actions */}
          {hasEditingRows && (
            <>
              <Tooltip title="Save All Changes">
                <Button
                  startIcon={<Save />}
                  onClick={handleSaveAll}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  Save All
                </Button>
              </Tooltip>
              <Tooltip title="Cancel All Edits">
                <Button
                  startIcon={<Cancel />}
                  onClick={handleCancelAll}
                  color="secondary"
                  variant="outlined"
                  size="small"
                >
                  Cancel All
                </Button>
              </Tooltip>
            </>
          )}

          {/* Column Manager */}
          <Tooltip title="Manage Columns">
            <IconButton
              onClick={() => dispatch(setColumnManagerOpen(true))}
              color="primary"
            >
              <ViewColumn />
            </IconButton>
          </Tooltip>

          {/* Import */}
          <Tooltip title="Import Data">
            <IconButton
              onClick={() => dispatch(setImportDialogOpen(true))}
              color="primary"
            >
              <FileUpload />
            </IconButton>
          </Tooltip>

          {/* Export */}
          <Tooltip title="Export Data">
            <IconButton
              onClick={() => dispatch(setExportDialogOpen(true))}
              color="primary"
              disabled={rows.length === 0}
            >
              <FileDownload />
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              onClick={() => dispatch(toggleTheme())}
              color="primary"
            >
              {theme === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
        </Box>
      </MuiToolbar>
    </AppBar>
  );
}
