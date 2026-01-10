import React from "react";
import { Table } from "@mantine/core";
import styles from "./Table.module.scss";
import classNames from "classnames";

interface TableProps<T> {
  headers?: string[]; // Array of column headers
  keys: readonly (keyof T)[]; // Keys to map data fields to table columns
  rows: T[]; // Array of data objects
  className?: string; // Optional custom class name for the table
  loading?: boolean; // Optional loading state
  onRowClick?: (row: T) => void; // Callback for row click events
}

const GenericTable = <T,>({
  headers,
  keys,
  rows,
  className = "",
  loading = false,
  onRowClick,
}: TableProps<T>) => {
  return (
    <div className={classNames(styles.tableWrapper, className)}>
      {loading && <div className={styles.loadingOverlay}>Loading...</div>}
      <Table highlightOnHover verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            {headers &&
              headers.map((header, index) => (
                <Table.Th key={index}>{header}</Table.Th>
              ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, rowIndex) => (
            <Table.Tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={styles.clickableRow}
            >
              {keys.map((key, cellIndex) => (
                <Table.Td key={cellIndex}>{String(row[key] || "")}</Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default GenericTable;
