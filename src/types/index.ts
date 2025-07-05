// Core data types
export interface TableRow {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  department?: string;
  location?: string;
  [key: string]: any;
}

export interface TableColumn {
  id: string;
  field: string;
  headerName: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  width?: number;
  visible: boolean;
  sortable: boolean;
  editable: boolean;
  required?: boolean;
  order: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableState {
  rows: TableRow[];
  columns: TableColumn[];
  loading: boolean;
  error: string | null;
  sortConfig: SortConfig | null;
  pagination: PaginationConfig;
  searchTerm: string;
  selectedRows: string[];
  editingRows: string[];
}

// UI State types
export interface UIState {
  theme: 'light' | 'dark';
  columnManagerOpen: boolean;
  importDialogOpen: boolean;
  exportDialogOpen: boolean;
  confirmDialogOpen: boolean;
  confirmDialogData: ConfirmDialogData | null;
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

// Form types
export interface AddColumnFormData {
  field: string;
  headerName: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  width?: number;
  required?: boolean;
}

export interface ImportFormData {
  file: File | null;
  hasHeader: boolean;
  delimiter: string;
}

export interface ExportFormData {
  filename: string;
  format: 'csv' | 'json';
  includeHeaders: boolean;
  visibleColumnsOnly: boolean;
}

// CSV processing types
export interface CSVParseResult {
  data: any[];
  errors: any[];
  meta: {
    fields?: string[];
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
  };
}

export interface CSVImportError {
  row: number;
  field: string;
  message: string;
}

// Drag and drop types
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

// Redux root state
export interface RootState {
  table: TableState;
  ui: UIState;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Component props types
export interface TableProps {
  className?: string;
}

export interface ColumnManagerProps {
  open: boolean;
  onClose: () => void;
}

export interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Validation schemas
export interface ValidationError {
  field: string;
  message: string;
}

export interface FieldValidationRule {
  type: 'required' | 'email' | 'number' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}
