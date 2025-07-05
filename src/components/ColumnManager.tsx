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
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Delete,
  DragHandle,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { RootState } from '@/store';
import {
  addColumn,
  updateColumn,
  deleteColumn,
  toggleColumnVisibility,
  reorderColumns,
} from '@/store/slices/tableSlice';
import { setColumnManagerOpen, showConfirmDialog } from '@/store/slices/uiSlice';
import { TableColumn, AddColumnFormData } from '@/types';
import { columnValidationSchema, sanitizeFieldName, isUniqueFieldName } from '@/utils/validation';
import { generateClientId } from '@/utils/idGenerator';

interface ColumnManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function ColumnManager({ open, onClose }: ColumnManagerProps) {
  const dispatch = useDispatch();
  const { columns } = useSelector((state: RootState) => state.table);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<AddColumnFormData>({
    defaultValues: {
      field: '',
      headerName: '',
      type: 'string',
      width: 150,
      required: false,
    },
  });

  const watchedField = watch('field');
  const watchedHeaderName = watch('headerName');

  // Auto-generate field name from header name
  React.useEffect(() => {
    if (watchedHeaderName && !watchedField) {
      const sanitizedField = sanitizeFieldName(watchedHeaderName);
      if (sanitizedField) {
        // Update field name automatically
        reset(prev => ({ ...prev, field: sanitizedField }));
      }
    }
  }, [watchedHeaderName, watchedField, reset]);

  const handleAddColumn = (data: AddColumnFormData) => {
    // Check if field name is unique
    if (!isUniqueFieldName(data.field, columns)) {
      return;
    }

    const newColumn: TableColumn = {
      id: generateClientId('col'),
      field: data.field,
      headerName: data.headerName,
      type: data.type,
      width: data.width || 150,
      visible: true,
      sortable: true,
      editable: true,
      required: data.required || false,
      order: columns.length,
    };

    dispatch(addColumn(newColumn));
    reset();
    setShowAddForm(false);
  };

  const handleDeleteColumn = (column: TableColumn) => {
    dispatch(showConfirmDialog({
      title: 'Delete Column',
      message: `Are you sure you want to delete the "${column.headerName}" column? This will remove all data in this column and cannot be undone.`,
      onConfirm: () => dispatch(deleteColumn(column.id)),
    }));
  };

  const handleToggleVisibility = (columnId: string) => {
    dispatch(toggleColumnVisibility(columnId));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    dispatch(reorderColumns({ sourceIndex, destinationIndex }));
  };

  const handleClose = () => {
    reset();
    setShowAddForm(false);
    onClose();
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const visibleCount = columns.filter((col: TableColumn) => col.visible).length;
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Manage Columns</Typography>
          <Typography variant="body2" color="text.secondary">
            {visibleCount} of {columns.length} columns visible
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Add Column Form */}
          {showAddForm && (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Add New Column
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit(handleAddColumn)}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <Controller
                  name="headerName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Column Name"
                      error={!!errors.headerName}
                      helperText={errors.headerName?.message}
                      fullWidth
                    />
                  )}
                />
                
                <Controller
                  name="field"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Field Name"
                      error={!!errors.field}
                      helperText={
                        errors.field?.message ||
                        (!isUniqueFieldName(field.value, columns) && field.value
                          ? 'Field name must be unique'
                          : '')
                      }
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Data Type</InputLabel>
                      <Select {...field} label="Data Type">
                        <MenuItem value="string">Text</MenuItem>
                        <MenuItem value="number">Number</MenuItem>
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="boolean">Boolean</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="width"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Width (px)"
                      type="number"
                      error={!!errors.width}
                      helperText={errors.width?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="required"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Required Field"
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button type="submit" variant="contained">
                    Add Column
                  </Button>
                  <Button onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Add Column Button */}
          {!showAddForm && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setShowAddForm(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Column
            </Button>
          )}

          <Divider />

          {/* Column List */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Column Configuration
            </Typography>
            
            {columns.length === 0 ? (
              <Alert severity="info">
                No columns defined. Add your first column to get started.
              </Alert>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="columns">
                  {(provided) => (
                    <List
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                    >
                      {sortedColumns.map((column, index) => (
                        <Draggable key={column.id} draggableId={column.id} index={index}>
                          {(provided, snapshot) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                              }}
                            >
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mr: 2,
                                  cursor: 'grab',
                                }}
                              >
                                <DragHandle />
                              </Box>
                              
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle2">
                                      {column.headerName}
                                    </Typography>
                                    <Chip
                                      label={column.type}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                    {column.required && (
                                      <Chip
                                        label="Required"
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    Field: {column.field} • Width: {column.width}px
                                  </Typography>
                                }
                              />
                              
                              <ListItemSecondaryAction>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleToggleVisibility(column.id)}
                                    color={column.visible ? 'primary' : 'default'}
                                  >
                                    {column.visible ? <Visibility /> : <VisibilityOff />}
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleDeleteColumn(column)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </ListItemSecondaryAction>
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
