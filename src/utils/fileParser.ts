import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Service for parsing CSV and Excel files
 * Follows Single Responsibility Principle - handles only file parsing logic
 */

export interface ParsedFileData {
  columns: string[];
  rows: any[];
  totalRows: number;
}

export interface FileParseError {
  message: string;
  code: string;
}

/**
 * Parse CSV file and extract column names and data
 */
export const parseCSVFile = (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5, // Preview first 5 rows for performance
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          reject({
            message: "Failed to parse CSV file",
            code: "CSV_PARSE_ERROR",
          });
          return;
        }

        const columns = results.meta.fields || [];
        const rows = results.data || [];

        if (columns.length === 0) {
          reject({
            message: "No columns found in CSV file",
            code: "NO_COLUMNS",
          });
          return;
        }

        resolve({
          columns: columns.filter((col) => col && col.trim() !== ""),
          rows,
          totalRows: rows.length,
        });
      },
      error: (error: Error) => {
        reject({
          message: error.message || "Failed to parse CSV file",
          code: "CSV_PARSE_ERROR",
        });
      },
    });
  });
};

/**
 * Parse Excel file (.xlsx, .xls) and extract column names and data
 */
export const parseExcelFile = (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject({
            message: "Failed to read Excel file",
            code: "FILE_READ_ERROR",
          });
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject({
            message: "No sheets found in Excel file",
            code: "NO_SHEETS",
          });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        }) as any[][];

        if (jsonData.length === 0) {
          reject({
            message: "Excel file is empty",
            code: "EMPTY_FILE",
          });
          return;
        }

        // First row contains column headers
        const columns = (jsonData[0] || [])
          .map((col) => String(col).trim())
          .filter((col) => col !== "");

        if (columns.length === 0) {
          reject({
            message: "No columns found in Excel file",
            code: "NO_COLUMNS",
          });
          return;
        }

        // Get preview rows (first 5 data rows)
        const rows = jsonData.slice(1, 6).map((row) => {
          const rowObj: any = {};
          columns.forEach((col, index) => {
            rowObj[col] = row[index] || "";
          });
          return rowObj;
        });

        resolve({
          columns,
          rows,
          totalRows: jsonData.length - 1, // Exclude header row
        });
      } catch (error: any) {
        reject({
          message: error.message || "Failed to parse Excel file",
          code: "EXCEL_PARSE_ERROR",
        });
      }
    };

    reader.onerror = () => {
      reject({
        message: "Failed to read Excel file",
        code: "FILE_READ_ERROR",
      });
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Parse file based on extension (CSV or Excel)
 */
export const parseFile = async (file: File): Promise<ParsedFileData> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    return parseCSVFile(file);
  } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    return parseExcelFile(file);
  } else {
    // eslint-disable-next-line no-throw-literal
    throw {
      message: "Unsupported file format. Please upload CSV or Excel file.",
      code: "UNSUPPORTED_FORMAT",
    };
  }
};

/**
 * Validate file type
 */
export const validateFileType = (file: File): boolean => {
  const validTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const validExtensions = [".csv", ".xlsx", ".xls"];
  const fileExtension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  return (
    validTypes.includes(file.type) || validExtensions.includes(fileExtension)
  );
};
