import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, ConfirmDialogData } from '@/types';

const initialState: UIState = {
  theme: 'light',
  columnManagerOpen: false,
  importDialogOpen: false,
  exportDialogOpen: false,
  confirmDialogOpen: false,
  confirmDialogData: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    // Dialogs
    setColumnManagerOpen: (state, action: PayloadAction<boolean>) => {
      state.columnManagerOpen = action.payload;
    },
    setImportDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.importDialogOpen = action.payload;
    },
    setExportDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.exportDialogOpen = action.payload;
    },
    
    // Confirm dialog
    showConfirmDialog: (state, action: PayloadAction<ConfirmDialogData>) => {
      state.confirmDialogOpen = true;
      state.confirmDialogData = action.payload;
    },
    hideConfirmDialog: (state) => {
      state.confirmDialogOpen = false;
      state.confirmDialogData = null;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setColumnManagerOpen,
  setImportDialogOpen,
  setExportDialogOpen,
  showConfirmDialog,
  hideConfirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
