# Dynamic Data Table Manager

A powerful and feature-rich data table manager built with Next.js 14, Redux Toolkit, and Material UI. This application provides comprehensive table management capabilities with a modern, responsive design.

## ✨ Features

### Core Functionality
- **Dynamic Table Display** - View data in a clean, sortable table format
- **Column Management** - Add, remove, show/hide, and reorder columns
- **Inline Editing** - Edit cells directly in the table with validation
- **Global Search** - Search across all table fields
- **Advanced Sorting** - Sort by any column (ascending/descending)
- **Pagination** - Navigate through large datasets efficiently

### Data Management
- **CSV Import** - Upload and import CSV files with validation
- **CSV Export** - Export data to CSV with customizable options
- **JSON Export** - Export data in JSON format
- **Sample Data** - Pre-populated with sample data for testing

### User Experience
- **Theme Toggle** - Switch between light and dark modes
- **Drag & Drop** - Reorder columns via drag and drop
- **Responsive Design** - Works seamlessly on desktop and mobile
- **State Persistence** - Preferences saved across sessions
- **Bulk Operations** - Select and delete multiple rows

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **State Management**: Redux Toolkit with Redux Persist
- **UI Library**: Material UI (MUI) v5+
- **Language**: TypeScript
- **Form Handling**: React Hook Form with Yup validation
- **CSV Processing**: PapaParse for import, FileSaver for export
- **Drag & Drop**: @hello-pangea/dnd
- **Styling**: Material UI theming + Tailwind CSS

## 📦 Installation

1. Clone the repository or use the provided files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

### Table Operations
- **Add Row**: Click "Add Row" to insert a new row
- **Edit Row**: Click the edit icon or double-click a cell to enable inline editing
- **Delete Row**: Click the delete icon to remove a row
- **Select Rows**: Use checkboxes to select multiple rows for bulk operations
- **Search**: Use the search bar to filter rows across all columns
- **Sort**: Click column headers to sort data

### Column Management
- **Open Column Manager**: Click the column icon in the toolbar
- **Add Column**: Define field name, type, and properties
- **Show/Hide Columns**: Toggle column visibility
- **Reorder Columns**: Drag and drop columns to reorder
- **Delete Columns**: Remove columns (with confirmation)

### Data Import/Export
- **Import CSV**: Upload CSV files with header detection and validation
- **Export CSV**: Download current table data as CSV
- **Export JSON**: Download current table data as JSON
- **Sample Data**: Download a sample CSV file for testing

### Theming
- **Light/Dark Mode**: Toggle between themes using the theme button
- **Responsive Design**: Optimized for all screen sizes
- **Persistent Preferences**: Theme and settings are saved automatically

## 🏗 Architecture

### Project Structure
```
src/
├── app/                    # Next.js app router
├── components/             # React components
├── providers/              # Context providers
├── store/                  # Redux store and slices
├── theme/                  # Material UI theme configuration
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

### Key Components
- **DataTable**: Main table component with sorting, pagination, and editing
- **ColumnManager**: Modal for managing table columns
- **ImportDialog**: CSV import functionality with validation
- **ExportDialog**: Data export with format options
- **Toolbar**: Main action bar with all table operations

### State Management
- **tableSlice**: Manages table data, columns, and operations
- **uiSlice**: Handles UI state like dialogs and theme
- **Redux Persist**: Automatically saves state to localStorage

## 🔧 Configuration

### Default Columns
The application comes with these default columns:
- Name (string, required)
- Email (string, required)
- Age (number)
- Role (string)
- Department (string, hidden by default)
- Location (string, hidden by default)

### Validation Rules
- **Required Fields**: Name and Email are required
- **Email Validation**: Email format validation
- **Number Fields**: Age must be a valid number
- **Field Names**: Must be unique and follow naming conventions

### CSV Import Settings
- **Maximum File Size**: 5MB
- **Supported Formats**: .csv files
- **Delimiter Options**: Comma, semicolon, tab, pipe
- **Header Detection**: Automatic header row detection

## 🎨 Customization

### Adding New Column Types
1. Update the `TableColumn` type in `types/index.ts`
2. Add validation logic in `utils/validation.ts`
3. Update the column manager form
4. Add rendering logic in the DataTable component

### Theming
Customize the Material UI theme in `src/theme/index.ts`:
- Colors and palette
- Typography settings
- Component styling
- Dark/light mode variants

### Validation
Extend validation schemas in `utils/validation.ts`:
- Add new field types
- Custom validation rules
- Error messages

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔍 Features in Detail

### Advanced Table Features
- **Sticky Header**: Table header remains visible while scrolling
- **Row Selection**: Individual and bulk row selection
- **Inline Editing**: Edit cells directly with validation
- **Dynamic Columns**: Add/remove columns on the fly
- **Column Reordering**: Drag and drop to reorder columns
- **Responsive Design**: Mobile-optimized table view

### Data Validation
- **Type Validation**: Ensures data matches column types
- **Required Fields**: Validates required field constraints
- **Email Validation**: Proper email format checking
- **Number Validation**: Numeric field validation
- **Custom Rules**: Extensible validation system

### Import/Export Features
- **CSV Import**: Robust CSV parsing with error handling
- **Format Detection**: Automatic delimiter detection
- **Preview Mode**: Preview data before importing
- **Error Reporting**: Detailed validation error messages
- **Export Options**: Customizable export formats and settings

This application demonstrates modern React patterns, TypeScript best practices, and professional UI/UX design principles.
