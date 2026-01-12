import { useState, useCallback } from "react";
import {
  ColumnMapping,
  FilePreview,
  ColumnMappingState,
  SYSTEM_FIELDS,
} from "../types/emailList";
import { parseFile, validateFileType } from "../utils/fileParser";

/**
 * Custom hook for managing column mapping state
 * Follows Single Responsibility Principle - manages only mapping state logic
 */

interface UseColumnMappingReturn {
  state: ColumnMappingState;
  parseAndSetFile: (file: File) => Promise<void>;
  updateMapping: (mapping: ColumnMapping, isValid: boolean) => void;
  resetMapping: () => void;
  error: string | null;
  isLoading: boolean;
}

export const useColumnMapping = (): UseColumnMappingReturn => {
  const [state, setState] = useState<ColumnMappingState>({
    filePreview: null,
    columnMapping: {},
    isValid: false,
    missingRequiredFields: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseAndSetFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!validateFileType(file)) {
        throw new Error(
          "Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
        );
      }

      // Parse file
      const parsedData = await parseFile(file);

      // Create file preview
      const filePreview: FilePreview = {
        fileName: file.name,
        fileSize: file.size,
        columns: parsedData.columns,
        sampleRows: parsedData.rows,
        totalRows: parsedData.totalRows,
      };

      setState((prev) => ({
        ...prev,
        filePreview,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to parse file");
      setState({
        filePreview: null,
        columnMapping: {},
        isValid: false,
        missingRequiredFields: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMapping = useCallback(
    (mapping: ColumnMapping, isValid: boolean) => {
      const requiredFields = SYSTEM_FIELDS.filter((f) => f.required);
      const missingRequiredFields = requiredFields
        .filter((field) => !mapping[field.key] || mapping[field.key] === "")
        .map((field) => field.label);

      setState((prev) => ({
        ...prev,
        columnMapping: mapping,
        isValid,
        missingRequiredFields,
      }));
    },
    [],
  );

  const resetMapping = useCallback(() => {
    setState({
      filePreview: null,
      columnMapping: {},
      isValid: false,
      missingRequiredFields: [],
    });
    setError(null);
  }, []);

  return {
    state,
    parseAndSetFile,
    updateMapping,
    resetMapping,
    error,
    isLoading,
  };
};
