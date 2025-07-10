import React, { useState, useCallback } from "react";
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  LinearProgress, Avatar, Tooltip, IconButton
} from "@mui/material";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { Edit, Visibility, AttachFile } from "@mui/icons-material";
import debounce from "lodash/debounce";

const initialColumns = [
  { id: "task", label: "TASK NAME", width: 200 },
  { id: "project", label: "PROJECT", width: 150 },
  { id: "progress", label: "PROGRESS", width: 120 },
  { id: "status", label: "STATUS", width: 120 },
  { id: "assignee", label: "ASSIGNEE", width: 130 },
  { id: "deadline", label: "DEADLINE", width: 140 },
  { id: "priority", label: "PRIORITY", width: 110 },
  { id: "estimate", label: "ESTIMATE", width: 120 },
  { id: "actions", label: "ACTIONS", width: 160 },
];

const sampleData = [
  {
    task: "bind dynamic data in itask mom, maintanence print",
    project: "iTask",
    progress: 60,
    status: "In Progress",
    assignee: "A",
    deadline: "2025-07-15",
    priority: "High",
    estimate: "8 hrs",
  },
  {
    task: "itask bug in teammember add, edit form validation",
    project: "DevOps",
    progress: 30,
    status: "Pending",
    assignee: "B",
    deadline: "2025-07-18",
    priority: "Medium",
    estimate: "12 hrs",
  },
];

const ResizableTaskTable = () => {
  const [columns, setColumns] = useState(initialColumns);

  // Debounced resize function
  const debouncedHandleResize = useCallback(
    debounce((id, width) => {
      setColumns((prev) =>
        prev.map((col) => (col.id === id ? { ...col, width } : col))
      );
    }, 16), // ~60 FPS
    []
  );

  const getPriorityColor = (priority) => {
    if (priority === "High") return "#d32f2f";
    if (priority === "Medium") return "#f57c00";
    return "#388e3c";
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col, index) => (
              <TableCell
                key={col.id}
                sx={{
                  padding: 0,
                  background: "#fafafa",
                  position: "relative",
                  textAlign: "left",
                  verticalAlign: "middle",
                  width: col.width,
                  minWidth: col.width,
                  maxWidth: col.width,
                }}
              >
                <ResizableBox
                 width={col.width + 30} 
                  height={40}
                  axis="x"
                  resizeHandles={index !== columns.length - 1 ? ["e"] : []}
                  minConstraints={[80, 40]}
                  maxConstraints={[600, 40]}
                  onResize={(e, data) => {
                    debouncedHandleResize(col.id, data.size.width - 30);
                  }}
                  handle={
                    index !== columns.length - 1 && (
                      <span
                        className="resize-handle"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          background: "#e0e0e0",
                          cursor: "col-resize",
                          zIndex: 2,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#1976d2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#e0e0e0";
                        }}
                      />
                    )
                  }
                >
                  <div
                    style={{
                      padding: "0px 0px",
                      fontWeight: 600,
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    {col.label}
                  </div>
                </ResizableBox>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sampleData.map((row, i) => (
            <TableRow key={i} hover>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  style={{
                    width: col.width,
                    maxWidth: col.width,
                    minWidth: col.width,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {col.id === "progress" ? (
                    <LinearProgress variant="determinate" value={row.progress} />
                  ) : col.id === "assignee" ? (
                    <Avatar>{row.assignee}</Avatar>
                  ) : col.id === "priority" ? (
                    <span
                      style={{
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 12,
                        backgroundColor: getPriorityColor(row.priority),
                        fontSize: 12,
                      }}
                    >
                      {row.priority}
                    </span>
                  ) : col.id === "actions" ? (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View">
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Attach">
                        <IconButton size="small">
                          <AttachFile fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  ) : (
                    <Tooltip title={row[col.id]}>
                      <span>{row[col.id]}</span>
                    </Tooltip>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResizableTaskTable;
