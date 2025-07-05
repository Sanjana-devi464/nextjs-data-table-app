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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { CloudUpload, GetApp, FileUpload } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { importRows } from '@/store/slices/tableSlice';
import { CSVImportError } from '@/types';
import { 
  parseCSVFile, 
  validateCSVFile, 
  formatFileSize, 
  downloadSampleCSV 
} from '@/utils/csvUtils';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ImportDialog({ open, onClose }: ImportDialogProps) {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<CSVImportError[]>([]);
  const [importPreview, setImportPreview] = useState<unknown[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateCSVFile(file);
      if (validation.isValid) {
        setSelectedFile(file);
        setImportErrors([]);
        setImportPreview([]);
        setShowPreview(false);
      } else {
        alert(validation.error);
      }
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const result = await parseCSVFile(selectedFile, hasHeader);
      setImportPreview(result.rows.slice(0, 5)); // Show first 5 rows
      setImportErrors(result.errors);
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const result = await parseCSVFile(selectedFile, hasHeader);
      
      if (result.errors.length > 0) {
        setImportErrors(result.errors);
        setIsImporting(false);
        return;
      }

      dispatch(importRows(result.rows));
      handleClose();
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Error importing CSV file. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportErrors([]);
    setImportPreview([]);
    setShowPreview(false);
    setIsImporting(false);
    setHasHeader(true);
    setDelimiter(',');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileUpload />
          <Typography variant="h6">Import Data</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* File Upload Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              1. Select CSV File
            </Typography>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => {
                if (typeof document !== 'undefined') {
                  document.getElementById('file-input')?.click();
                }
              }}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop CSV file here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maximum file size: 5MB
              </Typography>
            </Box>
            
            {selectedFile && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Selected file:</strong> {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Import Options */}
          <Box>
            <Typography variant="h6" gutterBottom>
              2. Import Options
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={hasHeader} 
                    onChange={(e) => setHasHeader(e.target.checked)}
                  />
                }
                label="File has header row"
              />
              
              <FormControl fullWidth>
                <InputLabel>Delimiter</InputLabel>
                <Select 
                  value={delimiter} 
                  label="Delimiter"
                  onChange={(e) => setDelimiter(e.target.value)}
                >
                  <MenuItem value=",">Comma (,)</MenuItem>
                  <MenuItem value=";">Semicolon (;)</MenuItem>
                  <MenuItem value="\t">Tab</MenuItem>
                  <MenuItem value="|">Pipe (|)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Preview Section */}
          {showPreview && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" gutterBottom>
                  3. Preview
                </Typography>
                
                {importPreview.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      First 5 rows:
                    </Typography>
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                      {importPreview.map((row, index) => {
                        const rowData = row as Record<string, unknown>;
                        return (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              <strong>Row {index + 1}:</strong> {String(rowData.name)} - {String(rowData.email)}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Error Messages */}
          {importErrors.length > 0 && (
            <Alert severity="error">
              <Typography variant="body2" gutterBottom>
                <strong>Import Errors ({importErrors.length}):</strong>
              </Typography>
              <List dense>
                {importErrors.slice(0, 10).map((error, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText
                      primary={`Row ${error.row}: ${error.message}`}
                      secondary={`Field: ${error.field}`}
                    />
                  </ListItem>
                ))}
                {importErrors.length > 10 && (
                  <Typography variant="body2" color="text.secondary">
                    ... and {importErrors.length - 10} more errors
                  </Typography>
                )}
              </List>
            </Alert>
          )}

          {/* Sample Data */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Don&apos;t have a CSV file? 
              <Button
                size="small"
                startIcon={<GetApp />}
                onClick={downloadSampleCSV}
                sx={{ ml: 1 }}
              >
                Download Sample CSV
              </Button>
            </Typography>
          </Box>

          {/* Loading */}
          {isImporting && (
            <Box>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Processing file...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isImporting}>
          Cancel
        </Button>
        <Button
          onClick={handlePreview}
          disabled={!selectedFile || isImporting}
          variant="outlined"
        >
          Preview
        </Button>
        <Button
          onClick={handleImport}
          disabled={!selectedFile || isImporting || importErrors.length > 0}
          variant="contained"
        >
          {isImporting ? 'Importing...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
