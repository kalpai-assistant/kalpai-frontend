/**
 * Types and interfaces for Email List column mapping
 * Following Interface Segregation Principle
 */

export interface ColumnMapping {
  [systemField: string]: string | null; // Maps system field to file column
}

export interface SystemField {
  key: string;
  label: string;
  required: boolean;
  description: string;
}

export const SYSTEM_FIELDS: SystemField[] = [
  {
    key: "email",
    label: "Email Address",
    required: true,
    description: "Contact's email address",
  },
  {
    key: "name",
    label: "Full Name",
    required: false,
    description: "Full name of the contact",
  },
  {
    key: "first_name",
    label: "First Name",
    required: false,
    description: "First name of the contact",
  },
  {
    key: "last_name",
    label: "Last Name",
    required: false,
    description: "Last name of the contact",
  },
  {
    key: "company_name",
    label: "Company Name",
    required: false,
    description: "Company or organization name",
  },
  {
    key: "location",
    label: "Location",
    required: false,
    description: "City or location",
  },
  {
    key: "phone_number",
    label: "Phone Number",
    required: false,
    description: "Contact phone number",
  },
];

export interface FilePreview {
  fileName: string;
  fileSize: number;
  columns: string[];
  sampleRows: any[];
  totalRows: number;
}

export interface ColumnMappingState {
  filePreview: FilePreview | null;
  columnMapping: ColumnMapping;
  isValid: boolean;
  missingRequiredFields: string[];
}
