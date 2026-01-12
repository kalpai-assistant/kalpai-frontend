# Email List Upload with Advanced Column Mapping

## Overview

This feature provides an advanced, user-friendly interface for uploading email lists from CSV or Excel files with intelligent column mapping.

## Features

### 🎯 Core Features
- **Multi-step Upload Flow**: Clean stepper interface guiding users through the upload process
- **Intelligent Auto-Detection**: Automatically detects and maps columns based on common naming patterns
- **Visual Column Mapping**: Dropdown-based UI for manual column mapping
- **Data Preview**: Live preview of uploaded data with first 5 rows
- **Real-time Validation**: Instant feedback on missing required fields
- **Custom Fields Support**: Automatically stores unmapped columns as custom fields

### 🏗️ Architecture (SOLID Principles)

#### Single Responsibility Principle
- **`fileParser.ts`**: Handles only file parsing logic (CSV/Excel)
- **`ColumnMapper.tsx`**: Manages only column mapping UI
- **`useColumnMapping.ts`**: Manages only column mapping state
- **`CreateEmailList.tsx`**: Orchestrates the upload flow

#### Open/Closed Principle
- Easy to extend with new file formats by adding parsers
- Column mapping logic can be extended without modifying core components

#### Dependency Inversion Principle
- Components depend on abstractions (interfaces/types)
- Business logic separated from UI components

## File Structure

```
src/
├── utils/
│   └── fileParser.ts           # File parsing utilities
├── types/
│   └── emailList.ts            # TypeScript interfaces
├── hooks/
│   └── useColumnMapping.ts     # Column mapping state hook
└── components/pages/outreach/email/lists/
    ├── CreateEmailList.tsx     # Main upload component
    ├── ColumnMapper.tsx        # Column mapping UI
    └── README.md              # This file
```

## Components

### CreateEmailList
Main component with two-step flow:
1. **Step 1**: Basic info (name, description) + file upload
2. **Step 2**: Column mapping with preview

### ColumnMapper
Reusable component that:
- Displays system fields with descriptions
- Provides dropdown selectors for mapping
- Shows validation status
- Displays data preview
- Highlights unmapped columns

### useColumnMapping Hook
Custom hook managing:
- File parsing state
- Column mapping state
- Validation logic
- Error handling

## Usage Example

```tsx
import CreateEmailList from './CreateEmailList';

function App() {
  return <CreateEmailList />;
}
```

## Column Mapping

### System Fields

| Field | Required | Description |
|-------|----------|-------------|
| email | Yes | Contact's email address |
| name | Yes | Full name of the contact |
| company_name | No | Company/organization name |
| location | No | City or location |
| phone_number | No | Contact phone number |

### Auto-Detection

The system automatically detects columns using fuzzy matching:

**Email Field**: Matches `email`, `e-mail`, `email address`, `emailaddress`, `mail`
**Full Name Field**: Matches `name`, `full name`, `fullname`, `contact name`, `contact`
**First Name Field**: Matches `first name`, `firstname`, `first`, `given name`, `givenname`
**Last Name Field**: Matches `last name`, `lastname`, `last`, `surname`, `family name`, `familyname`
**Company Field**: Matches `company`, `company name`, `organization`, `org`
**Location Field**: Matches `location`, `city`, `place`, `address`, `region`
**Phone Field**: Matches `phone`, `phone number`, `mobile`, `contact number`, `tel`

### Custom Fields

Any columns not mapped to system fields are automatically stored as `custom_fields` in JSON format.

## API Integration

### Request Format

```typescript
FormData {
  name: string;              // List name
  description?: string;      // Optional description
  file: File;               // CSV/Excel file
  column_mapping?: string;  // JSON string of mappings
}
```

### Column Mapping Format

```json
{
  "email": "Email Address",
  "name": "Full Name",
  "company_name": "Company",
  "location": "City",
  "phone_number": "Phone"
}
```

## Error Handling

### File Parsing Errors
- Invalid file format
- Empty file
- No columns found
- Parsing failures

### Validation Errors
- Missing required fields
- Invalid email formats (handled by backend)
- No valid contacts (handled by backend)

## UI/UX Features

### Visual Feedback
- ✅ Green borders for successfully mapped fields
- ⚠️ Orange borders for missing required fields
- 🔵 Blue alerts for unmapped columns (custom fields)
- 📊 Live data preview with sample rows

### Accessibility
- Tooltip descriptions for each field
- Clear error messages
- Loading states during parsing
- Keyboard navigation support

## Technology Stack

- **React**: UI framework
- **TypeScript**: Type safety
- **Mantine UI**: Component library
- **PapaParse**: CSV parsing
- **XLSX**: Excel file parsing
- **React Query**: API state management

## Performance

- **File Size**: Tested up to 10MB
- **Preview**: Only first 5 rows loaded for UI
- **Parsing**: Async with loading states
- **Memory**: Efficient streaming for large files

## Future Enhancements

- [ ] Bulk column mapping templates
- [ ] Save mapping presets for reuse
- [ ] Advanced column transformations
- [ ] Import history and rollback
- [ ] Duplicate detection preview
- [ ] CSV/Excel export templates
