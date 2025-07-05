'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Typography,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Search,
  Sort,
  Edit,
  Delete,
  Save,
  Cancel,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import {
  setSortConfig,
  setSearchTerm,
  setPagination,
  setSelectedRows,
  toggleRowSelection,
  updateRow,
  deleteRow,
  startEditing,
  stopEditing,
} from '@/store/slices/tableSlice';
import { showConfirmDialog } from '@/store/slices/uiSlice';
import { TableRow as TableRowType, TableColumn } from '@/types';
import { validateCellValue, convertToType } from '@/utils/validation';

interface DataTableProps {
  className?: string;
}

export default function DataTable({ className }: DataTableProps) {
  const dispatch = useDispatch();
  const {
    rows,
    columns,
    sortConfig,
    pagination,
    searchTerm,
    selectedRows,
    editingRows,
  } = useSelector((state: RootState) => state.table);

  const [editingValues, setEditingValues] = useState<Record<string, unknown>>({});

  // Filter and sort data
  const filteredAndSortedRows = useMemo(() => {
    let filteredRows = rows;

    // Apply search filter
    if (searchTerm) {
      filteredRows = rows.filter((row: TableRowType) =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredRows = [...filteredRows].sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        // Convert to comparable values
        const aStr = String(aValue || '').toLowerCase();
        const bStr = String(bValue || '').toLowerCase();

        if (aStr < bStr) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredRows;
  }, [rows, sortConfig, searchTerm]);

  // Paginated data
  const paginatedRows = useMemo(() => {
    const startIndex = pagination.page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredAndSortedRows.slice(startIndex, endIndex);
  }, [filteredAndSortedRows, pagination]);

  // Visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter((col: TableColumn) => col.visible).sort((a: TableColumn, b: TableColumn) => a.order - b.order);
  }, [columns]);

  // Handle sorting
  const handleSort = (field: string) => {
    const column = columns.find((col: TableColumn) => col.field === field);
    if (!column?.sortable) return;

    const direction =
      sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setSortConfig({ field, direction }));
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPagination({ pageSize: parseInt(event.target.value, 10), page: 0 }));
  };

  // Handle row selection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      dispatch(setSelectedRows(paginatedRows.map((row: TableRowType) => row.id)));
    } else {
      dispatch(setSelectedRows([]));
    }
  };

  const handleRowSelect = (rowId: string) => {
    dispatch(toggleRowSelection(rowId));
  };

  // Handle editing
  const handleStartEditing = (row: TableRowType) => {
    dispatch(startEditing(row.id));
    setEditingValues(prev => ({ ...prev, [row.id]: { ...row } }));
  };

  const handleCancelEditing = (rowId: string) => {
    dispatch(stopEditing(rowId));
    setEditingValues(prev => {
      const newValues = { ...prev };
      delete newValues[rowId];
      return newValues;
    });
  };

  const handleSaveEditing = (rowId: string) => {
    const editedRow = editingValues[rowId] as Record<string, unknown>;
    if (!editedRow) return;

    // Validate all fields
    let isValid = true;
    const errors: Record<string, string> = {};

    visibleColumns.forEach((column: TableColumn) => {
      const validation = validateCellValue(editedRow[column.field], column);
      if (!validation.isValid) {
        isValid = false;
        errors[column.field] = validation.error || '';
      }
    });

    if (!isValid) {
      // Show validation errors (you can implement a toast/snackbar here)
      console.error('Validation errors:', errors);
      return;
    }

    // Convert values to appropriate types
    const convertedRow = { ...editedRow };
    visibleColumns.forEach((column: TableColumn) => {
      convertedRow[column.field] = convertToType(convertedRow[column.field], column.type);
    });

    dispatch(updateRow({ id: rowId, data: convertedRow }));
    dispatch(stopEditing(rowId));
    setEditingValues(prev => {
      const newValues = { ...prev };
      delete newValues[rowId];
      return newValues;
    });
  };

  const handleCellChange = (rowId: string, field: string, value: unknown) => {
    setEditingValues(prev => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] as Record<string, unknown> || {}),
        [field]: value,
      },
    }));
  };

  // Handle delete
  const handleDeleteRow = (rowId: string) => {
    dispatch(showConfirmDialog({
      title: 'Delete Row',
      message: 'Are you sure you want to delete this row? This action cannot be undone.',
      onConfirm: () => dispatch(deleteRow(rowId)),
    }));
  };

  const isSelected = (rowId: string) => selectedRows.includes(rowId);
  const isEditing = (rowId: string) => editingRows.includes(rowId);

  return (
    <Box className={className}>
      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search all fields..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 && selectedRows.length < paginatedRows.length
                    }
                    checked={
                      paginatedRows.length > 0 && selectedRows.length === paginatedRows.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {visibleColumns.map((column: TableColumn) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      minWidth: column.width,
                      cursor: column.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      '&:hover': column.sortable ? {
                        backgroundColor: alpha('#000', 0.04),
                      } : {},
                    }}
                    onClick={() => column.sortable && handleSort(column.field)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {column.headerName}
                      </Typography>
                      {column.sortable && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 'auto' }}>
                          {sortConfig?.field === column.field ? (
                            sortConfig.direction === 'asc' ? (
                              <KeyboardArrowUp fontSize="small" />
                            ) : (
                              <KeyboardArrowDown fontSize="small" />
                            )
                          ) : (
                            <Sort fontSize="small" sx={{ opacity: 0.3 }} />
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row: TableRowType) => {
                const isRowSelected = isSelected(row.id);
                const isRowEditing = isEditing(row.id);
                const editingData = (editingValues[row.id] as Record<string, unknown>) || row;

                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={isRowSelected}
                    sx={{
                      backgroundColor: isRowEditing ? alpha('#2196f3', 0.1) : 'inherit',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isRowSelected}
                        onChange={() => handleRowSelect(row.id)}
                      />
                    </TableCell>
                    {visibleColumns.map((column: TableColumn) => (
                      <TableCell key={column.id}>
                        {isRowEditing ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={editingData[column.field] || ''}
                            onChange={(e) => handleCellChange(row.id, column.field, e.target.value)}
                            type={column.type === 'number' ? 'number' : 'text'}
                            error={column.required && !editingData[column.field]}
                            helperText={column.required && !editingData[column.field] ? 'Required' : ''}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {column.type === 'boolean' ? (
                              <Chip
                                label={row[column.field] ? 'Yes' : 'No'}
                                color={row[column.field] ? 'success' : 'default'}
                                size="small"
                              />
                            ) : (
                              <Typography variant="body2">
                                {String(row[column.field] || '-')}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {isRowEditing ? (
                          <>
                            <Tooltip title="Save">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleSaveEditing(row.id)}
                              >
                                <Save />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleCancelEditing(row.id)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleStartEditing(row)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRow(row.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedRows.length}
          rowsPerPage={pagination.pageSize}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
