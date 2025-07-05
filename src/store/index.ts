import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import tableReducer from './slices/tableSlice';
import uiReducer from './slices/uiSlice';

// Create a noop storage for SSR
const noopStorage = {
  getItem(_key: string) {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: unknown) {
    return Promise.resolve(value);
  },
  removeItem(_key: string) {
    return Promise.resolve();
  },
};

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Nested persist config for UI slice to exclude confirmDialogData
const uiPersistConfig = {
  key: 'ui',
  version: 1,
  storage: isClient ? storage : noopStorage,
  blacklist: ['confirmDialogData'], // Don't persist function-containing confirm dialog data
};

const rootReducer = combineReducers({
  table: tableReducer,
  ui: persistReducer(uiPersistConfig, uiReducer),
});

// Create a more robust persist config
const persistConfig = {
  key: 'root',
  version: 1,
  storage: isClient ? storage : noopStorage,
  whitelist: ['table'], // Only persist table data, UI is handled separately
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'ui/showConfirmDialog',
        ],
        ignoredActionsPaths: ['payload.onConfirm', 'payload.onCancel'],
        ignoredPaths: ['ui.confirmDialogData.onConfirm', 'ui.confirmDialogData.onCancel'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Only create persistor on client side
export const persistor = isClient ? persistStore(store) : null;

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
