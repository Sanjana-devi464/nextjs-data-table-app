import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableState, TableRow, TableColumn, SortConfig, PaginationConfig } from '@/types';

// Default columns configuration
const defaultColumns: TableColumn[] = [
  {
    id: 'name',
    field: 'name',
    headerName: 'Name',
    type: 'string',
    width: 150,
    visible: true,
    sortable: true,
    editable: true,
    required: true,
    order: 0,
  },
  {
    id: 'email',
    field: 'email',
    headerName: 'Email',
    type: 'string',
    width: 200,
    visible: true,
    sortable: true,
    editable: true,
    required: true,
    order: 1,
  },
  {
    id: 'age',
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 100,
    visible: true,
    sortable: true,
    editable: true,
    required: false,
    order: 2,
  },
  {
    id: 'role',
    field: 'role',
    headerName: 'Role',
    type: 'string',
    width: 150,
    visible: true,
    sortable: true,
    editable: true,
    required: false,
    order: 3,
  },
  {
    id: 'department',
    field: 'department',
    headerName: 'Department',
    type: 'string',
    width: 150,
    visible: false,
    sortable: true,
    editable: true,
    required: false,
    order: 4,
  },
  {
    id: 'location',
    field: 'location',
    headerName: 'Location',
    type: 'string',
    width: 150,
    visible: false,
    sortable: true,
    editable: true,
    required: false,
    order: 5,
  },
];

// Sample data
const sampleData: TableRow[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    role: 'Developer',
    department: 'Engineering',
    location: 'New York',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    age: 28,
    role: 'Designer',
    department: 'Design',
    location: 'San Francisco',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    age: 35,
    role: 'Manager',
    department: 'Operations',
    location: 'Chicago',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    age: 32,
    role: 'Analyst',
    department: 'Finance',
    location: 'Boston',
  },
  {
    id: '5',
    name: 'Charlie Davis',
    email: 'charlie.davis@example.com',
    age: 29,
    role: 'Developer',
    department: 'Engineering',
    location: 'Seattle',
  },
];

const initialState: TableState = {
  rows: sampleData,
  columns: defaultColumns,
  loading: false,
  error: null,
  sortConfig: null,
  pagination: {
    page: 0,
    pageSize: 10,
    total: sampleData.length,
  },
  searchTerm: '',
  selectedRows: [],
  editingRows: [],
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    // Row operations
    addRow: (state, action: PayloadAction<TableRow>) => {
      state.rows.push(action.payload);
      state.pagination.total = state.rows.length;
    },
    updateRow: (state, action: PayloadAction<{ id: string; data: Partial<TableRow> }>) => {
      const index = state.rows.findIndex(row => row.id === action.payload.id);
      if (index !== -1) {
        state.rows[index] = { ...state.rows[index], ...action.payload.data };
      }
    },
    deleteRow: (state, action: PayloadAction<string>) => {
      state.rows = state.rows.filter(row => row.id !== action.payload);
      state.pagination.total = state.rows.length;
      state.selectedRows = state.selectedRows.filter(id => id !== action.payload);
    },
    deleteRows: (state, action: PayloadAction<string[]>) => {
      state.rows = state.rows.filter(row => !action.payload.includes(row.id));
      state.pagination.total = state.rows.length;
      state.selectedRows = [];
    },
    importRows: (state, action: PayloadAction<TableRow[]>) => {
      state.rows = action.payload;
      state.pagination.total = action.payload.length;
      state.pagination.page = 0;
    },
    
    // Column operations
    addColumn: (state, action: PayloadAction<TableColumn>) => {
      const newColumn = {
        ...action.payload,
        order: state.columns.length,
      };
      state.columns.push(newColumn);
      
      // Add default values to existing rows
      state.rows.forEach(row => {
        if (!(newColumn.field in row)) {
          row[newColumn.field] = '';
        }
      });
    },
    updateColumn: (state, action: PayloadAction<{ id: string; data: Partial<TableColumn> }>) => {
      const index = state.columns.findIndex(col => col.id === action.payload.id);
      if (index !== -1) {
        state.columns[index] = { ...state.columns[index], ...action.payload.data };
      }
    },
    deleteColumn: (state, action: PayloadAction<string>) => {
      const column = state.columns.find(col => col.id === action.payload);
      if (column) {
        state.columns = state.columns.filter(col => col.id !== action.payload);
        // Remove field from all rows
        state.rows.forEach(row => {
          delete row[column.field];
        });
      }
    },
    toggleColumnVisibility: (state, action: PayloadAction<string>) => {
      const column = state.columns.find(col => col.id === action.payload);
      if (column) {
        column.visible = !column.visible;
      }
    },
    reorderColumns: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [movedColumn] = state.columns.splice(sourceIndex, 1);
      state.columns.splice(destinationIndex, 0, movedColumn);
      
      // Update order values
      state.columns.forEach((col, index) => {
        col.order = index;
      });
    },
    
    // Sorting and filtering
    setSortConfig: (state, action: PayloadAction<SortConfig | null>) => {
      state.sortConfig = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.pagination.page = 0; // Reset to first page when searching
    },
    
    // Pagination
    setPagination: (state, action: PayloadAction<Partial<PaginationConfig>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Selection
    setSelectedRows: (state, action: PayloadAction<string[]>) => {
      state.selectedRows = action.payload;
    },
    toggleRowSelection: (state, action: PayloadAction<string>) => {
      const rowId = action.payload;
      const isSelected = state.selectedRows.includes(rowId);
      if (isSelected) {
        state.selectedRows = state.selectedRows.filter(id => id !== rowId);
      } else {
        state.selectedRows.push(rowId);
      }
    },
    
    // Editing
    setEditingRows: (state, action: PayloadAction<string[]>) => {
      state.editingRows = action.payload;
    },
    startEditing: (state, action: PayloadAction<string>) => {
      if (!state.editingRows.includes(action.payload)) {
        state.editingRows.push(action.payload);
      }
    },
    stopEditing: (state, action: PayloadAction<string>) => {
      state.editingRows = state.editingRows.filter(id => id !== action.payload);
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addRow,
  updateRow,
  deleteRow,
  deleteRows,
  importRows,
  addColumn,
  updateColumn,
  deleteColumn,
  toggleColumnVisibility,
  reorderColumns,
  setSortConfig,
  setSearchTerm,
  setPagination,
  setSelectedRows,
  toggleRowSelection,
  setEditingRows,
  startEditing,
  stopEditing,
  setLoading,
  setError,
} = tableSlice.actions;

export default tableSlice.reducer;
