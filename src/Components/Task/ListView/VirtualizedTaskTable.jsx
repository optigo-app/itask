/**
 * VirtualizedTaskTable
 *
 * Drop-in performance wrapper for TaskTableList.
 * Uses @tanstack/react-virtual to render only visible rows.
 *
 * INSTALL: npm install @tanstack/react-virtual
 *
 * Usage in Task.jsx:
 *   import VirtualizedTaskTable from "./ListView/VirtualizedTaskTable";
 *   // Replace <TaskTable ... /> with:
 *   <VirtualizedTaskTable
 *     taskdata={filteredData}
 *     isLoading={iswhTLoading}
 *     masterData={masterData}
 *     // ... pass all other props TaskTableList expects
 *   />
 */

import React, { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const ESTIMATED_ROW_HEIGHT = 52; // px — measure one real row and adjust
const OVERSCAN = 8; // render 8 extra rows above/below viewport

const VirtualizedTaskTable = (props) => {
  const {
    taskdata = [],
    isLoading,
    children, // If you render TaskTableList as children, extract its head separately
    tableHead, // Pass the <TableHead> element
    renderRow, // (task, index) => <TableRow>...</TableRow>
  } = props;

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: taskdata.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          {tableHead}
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={20}>
                  <Skeleton variant="rectangular" height={40} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box
      ref={parentRef}
      sx={{
        height: "calc(100vh - 220px)", // Adjust based on your header/filter bar height
        overflow: "auto",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <TableContainer component={Paper} sx={{ position: "relative" }}>
        <Table size="small" stickyHeader>
          {tableHead}
          <TableBody>
            {/* Top spacer to push visible rows to correct scroll position */}
            {virtualItems.length > 0 && (
              <TableRow>
                <TableCell
                  colSpan={100}
                  sx={{
                    height: `${virtualItems[0].start}px`,
                    padding: 0,
                    border: 0,
                  }}
                />
              </TableRow>
            )}

            {virtualItems.map((virtualRow) => {
              const task = taskdata[virtualRow.index];
              if (!task) return null;

              return (
                <React.Fragment key={virtualRow.key}>
                  {renderRow(task, virtualRow.index)}
                </React.Fragment>
              );
            })}

            {/* Bottom spacer */}
            {virtualItems.length > 0 && (
              <TableRow>
                <TableCell
                  colSpan={100}
                  sx={{
                    height: `${virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end}px`,
                    padding: 0,
                    border: 0,
                  }}
                />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default React.memo(VirtualizedTaskTable);
