import * as yup from 'yup';
import { TableRow, TableColumn, ValidationError } from '@/types';

/**
 * Validation schema for table rows
 */
export const createRowValidationSchema = (columns: TableColumn[]) => {
  const schema: Record<string, yup.AnySchema> = {};
  
  columns.forEach(column => {
    let fieldSchema: yup.AnySchema;
    
    switch (column.type) {
      case 'string':
        fieldSchema = yup.string();
        break;
      case 'number':
        fieldSchema = yup.number().typeError('Must be a number');
        break;
      case 'date':
        fieldSchema = yup.date().typeError('Must be a valid date');
        break;
      case 'boolean':
        fieldSchema = yup.boolean();
        break;
      default:
        fieldSchema = yup.string();
    }
    
    if (column.required) {
      fieldSchema = fieldSchema.required(`${column.headerName} is required`);
    }
    
    // Add email validation for email fields
    if (column.field === 'email') {
      fieldSchema = (fieldSchema as yup.StringSchema).email('Must be a valid email');
    }
    
    schema[column.field] = fieldSchema;
  });
  
  return yup.object().shape(schema);
};

/**
 * Validate a single row
 */
export const validateRow = async (
  row: TableRow,
  columns: TableColumn[]
): Promise<{ isValid: boolean; errors: ValidationError[] }> => {
  try {
    const schema = createRowValidationSchema(columns);
    await schema.validate(row, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: ValidationError[] = error.inner.map(err => ({
        field: err.path || '',
        message: err.message,
      }));
      return { isValid: false, errors };
    }
    return { isValid: false, errors: [{ field: '', message: 'Validation error' }] };
  }
};

/**
 * Validate multiple rows
 */
export const validateRows = async (
  rows: TableRow[],
  columns: TableColumn[]
): Promise<{ isValid: boolean; errors: Record<string, ValidationError[]> }> => {
  const allErrors: Record<string, ValidationError[]> = {};
  let hasErrors = false;
  
  for (const row of rows) {
    const { isValid, errors } = await validateRow(row, columns);
    if (!isValid) {
      allErrors[row.id] = errors;
      hasErrors = true;
    }
  }
  
  return { isValid: !hasErrors, errors: allErrors };
};

/**
 * Column validation schema
 */
export const columnValidationSchema = yup.object().shape({
  field: yup
    .string()
    .required('Field name is required')
    .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Field name must start with a letter and contain only letters, numbers, and underscores'),
  headerName: yup
    .string()
    .required('Header name is required')
    .min(1, 'Header name must be at least 1 character'),
  type: yup
    .string()
    .required('Type is required')
    .oneOf(['string', 'number', 'date', 'boolean'], 'Invalid type'),
  width: yup
    .number()
    .min(50, 'Width must be at least 50px')
    .max(500, 'Width must be at most 500px'),
});

/**
 * Import form validation schema
 */
export const importFormValidationSchema = yup.object({
  file: yup
    .mixed<File>()
    .nullable()
    .test('fileRequired', 'Please select a file', (value) => {
      return value !== null;
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return true;
      return (value as File).size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Please select a CSV file', (value) => {
      if (!value) return true;
      const file = value as File;
      return file.type.includes('csv') || file.name.endsWith('.csv');
    }),
  hasHeader: yup
    .boolean()
    .required('Header option is required'),
  delimiter: yup
    .string()
    .required('Delimiter is required')
    .oneOf([',', ';', '\t', '|'], 'Invalid delimiter'),
});

/**
 * Export form validation schema
 */
export const exportFormValidationSchema = yup.object().shape({
  filename: yup
    .string()
    .required('Filename is required')
    .min(1, 'Filename must be at least 1 character')
    .max(50, 'Filename must be at most 50 characters')
    .matches(/^[a-zA-Z0-9_\-\s]+$/, 'Filename can only contain letters, numbers, spaces, hyphens, and underscores'),
  format: yup
    .string()
    .required('Format is required')
    .oneOf(['csv', 'json'], 'Invalid format'),
});

/**
 * Sanitize and validate field names
 */
export const sanitizeFieldName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/^[0-9]+/, ''); // Remove leading numbers
};

/**
 * Check if field name is unique
 */
export const isUniqueFieldName = (fieldName: string, columns: TableColumn[], excludeId?: string): boolean => {
  return !columns.some(col => col.field === fieldName && col.id !== excludeId);
};

/**
 * Validate cell value based on column type
 */
export const validateCellValue = (
  value: unknown,
  column: TableColumn
): { isValid: boolean; error?: string } => {
  if (column.required && (!value || value === '')) {
    return { isValid: false, error: `${column.headerName} is required` };
  }
  
  if (!value && !column.required) {
    return { isValid: true };
  }
  
  switch (column.type) {
    case 'number':
      if (isNaN(Number(value))) {
        return { isValid: false, error: 'Must be a number' };
      }
      break;
      
    case 'date':
      if (isNaN(Date.parse(String(value)))) {
        return { isValid: false, error: 'Must be a valid date' };
      }
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean' && !['true', 'false', '1', '0'].includes(String(value).toLowerCase())) {
        return { isValid: false, error: 'Must be true or false' };
      }
      break;
      
    case 'string':
      if (column.field === 'email' && !isValidEmail(String(value))) {
        return { isValid: false, error: 'Must be a valid email' };
      }
      break;
  }
  
  return { isValid: true };
};

/**
 * Email validation helper
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Convert value to appropriate type
 */
export const convertToType = (value: unknown, type: string): unknown => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return Boolean(value);
    case 'date':
      return new Date(String(value));
    default:
      return String(value);
  }
};
