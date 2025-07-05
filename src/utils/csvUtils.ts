import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { TableRow, TableColumn, CSVParseResult, CSVImportError } from '@/types';
import { generateClientId } from './idGenerator';

/**
 * Parse CSV file and convert to table rows
 */
export const parseCSVFile = (file: File, hasHeader: boolean = true): Promise<{
  rows: TableRow[];
  errors: CSVImportError[];
}> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: hasHeader,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Clean and normalize header names
        return header.trim().toLowerCase().replace(/\s+/g, '_');
      },
      complete: (results: CSVParseResult) => {
        try {
          const rows: TableRow[] = [];
          const errors: CSVImportError[] = [];
          
          results.data.forEach((row: any, index: number) => {
            const rowData: TableRow = {
              id: generateClientId(`imported_${index}`),
              name: row.name || '',
              email: row.email || '',
              age: parseFloat(row.age) || 0,
              role: row.role || '',
              department: row.department || '',
              location: row.location || '',
            };
            
            // Validate required fields
            if (!rowData.name) {
              errors.push({
                row: index + 1,
                field: 'name',
                message: 'Name is required',
              });
            }
            
            if (!rowData.email) {
              errors.push({
                row: index + 1,
                field: 'email',
                message: 'Email is required',
              });
            } else if (!isValidEmail(rowData.email)) {
              errors.push({
                row: index + 1,
                field: 'email',
                message: 'Invalid email format',
              });
            }
            
            if (row.age && isNaN(parseFloat(row.age))) {
              errors.push({
                row: index + 1,
                field: 'age',
                message: 'Age must be a number',
              });
            }
            
            // Add any additional fields from CSV
            Object.keys(row).forEach(key => {
              if (!['name', 'email', 'age', 'role', 'department', 'location'].includes(key)) {
                rowData[key] = row[key];
              }
            });
            
            rows.push(rowData);
          });
          
          resolve({ rows, errors });
        } catch (error) {
          reject(error);
        }
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
};

/**
 * Export table data to CSV
 */
export const exportToCSV = (
  rows: TableRow[],
  columns: TableColumn[],
  filename: string = 'table_data.csv',
  visibleColumnsOnly: boolean = true
): void => {
  try {
    // Filter columns based on visibility
    const columnsToExport = visibleColumnsOnly 
      ? columns.filter(col => col.visible)
      : columns;
    
    // Sort columns by order
    const sortedColumns = columnsToExport.sort((a, b) => a.order - b.order);
    
    // Prepare data for CSV
    const csvData = rows.map(row => {
      const csvRow: Record<string, any> = {};
      sortedColumns.forEach(column => {
        csvRow[column.headerName] = row[column.field] || '';
      });
      return csvRow;
    });
    
    // Convert to CSV string
    const csv = Papa.unparse(csvData, {
      header: true,
      columns: sortedColumns.map(col => col.headerName),
    });
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};

/**
 * Export table data to JSON
 */
export const exportToJSON = (
  rows: TableRow[],
  columns: TableColumn[],
  filename: string = 'table_data.json',
  visibleColumnsOnly: boolean = true
): void => {
  try {
    // Filter columns based on visibility
    const columnsToExport = visibleColumnsOnly 
      ? columns.filter(col => col.visible)
      : columns;
    
    // Prepare data for JSON
    const jsonData = rows.map(row => {
      const jsonRow: Record<string, any> = {};
      columnsToExport.forEach(column => {
        jsonRow[column.field] = row[column.field];
      });
      return jsonRow;
    });
    
    // Convert to JSON string
    const json = JSON.stringify(jsonData, null, 2);
    
    // Create and download file
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw error;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate sample CSV data for testing
 */
export const generateSampleCSV = (): string => {
  const sampleData = [
    ['Name', 'Email', 'Age', 'Role', 'Department', 'Location'],
    ['John Doe', 'john.doe@example.com', '30', 'Developer', 'Engineering', 'New York'],
    ['Jane Smith', 'jane.smith@example.com', '28', 'Designer', 'Design', 'San Francisco'],
    ['Bob Johnson', 'bob.johnson@example.com', '35', 'Manager', 'Operations', 'Chicago'],
    ['Alice Brown', 'alice.brown@example.com', '32', 'Analyst', 'Finance', 'Boston'],
    ['Charlie Davis', 'charlie.davis@example.com', '29', 'Developer', 'Engineering', 'Seattle'],
  ];
  
  return Papa.unparse(sampleData);
};

/**
 * Download sample CSV file
 */
export const downloadSampleCSV = (): void => {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'sample_data.csv');
};

/**
 * Validate CSV file
 */
export const validateCSVFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
    return { isValid: false, error: 'Please select a CSV file' };
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
