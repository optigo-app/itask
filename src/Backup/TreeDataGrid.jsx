"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Tooltip,
  Typography,
} from "@mui/material";
import { PushPin, PushPinOutlined } from "@mui/icons-material";

// Define columns
const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "code", label: "ISO Code", minWidth: 100 },
  { id: "population", label: "Population", minWidth: 120, align: "right" },
  { id: "size", label: "Size (km²)", minWidth: 120, align: "right" },
  { id: "density", label: "Density", minWidth: 120, align: "right" },
  { id: "capital", label: "Capital", minWidth: 150 },
  { id: "language", label: "Language", minWidth: 130 },
  { id: "currency", label: "Currency", minWidth: 130 },
  { id: "gdp", label: "GDP ($B)", minWidth: 120, align: "right" },
  { id: "continent", label: "Continent", minWidth: 130 },
];

// Sample data
const rows = [
  {
    name: "India",
    code: "IN",
    population: 1380004385,
    size: 3287590,
    density: 419.9,
    capital: "New Delhi",
    language: "Hindi, English",
    currency: "Indian Rupee",
    gdp: 2875,
    continent: "Asia",
  },
  {
    name: "United States",
    code: "US",
    population: 331002651,
    size: 9833517,
    density: 33.7,
    capital: "Washington D.C.",
    language: "English",
    currency: "US Dollar",
    gdp: 21433,
    continent: "North America",
  },
  {
    name: "China",
    code: "CN",
    population: 1439323776,
    size: 9596960,
    density: 150.0,
    capital: "Beijing",
    language: "Mandarin",
    currency: "Yuan",
    gdp: 14860,
    continent: "Asia",
  },
];

export default function PinnableTable() {
  // State to store pinned columns
  const [pinnedColumns, setPinnedColumns] = useState([]);

  // Function to toggle pinning
  const togglePin = (columnId) => {
    setPinnedColumns((prev) => {
      const isPinned = prev.find((col) => col.id === columnId);

      if (isPinned) {
        return prev.filter((col) => col.id !== columnId); // Unpin if already pinned
      }

      // Pin to left if it's in the first half, otherwise to the right
      const index = columns.findIndex((col) => col.id === columnId);
      const side = index < columns.length / 2 ? "left" : "right";

      return [...prev, { id: columnId, side, index }];
    });
  };

  // Get sorted columns
  const sortedColumns = useMemo(() => {
    const leftPinned = pinnedColumns.filter((col) => col.side === "left").sort((a, b) => a.index - b.index);
    const rightPinned = pinnedColumns.filter((col) => col.side === "right").sort((a, b) => a.index - b.index);
    const unpinned = columns.filter((col) => !pinnedColumns.some((p) => p.id === col.id));

    return [
      ...leftPinned.map((pin) => columns.find((col) => col.id === pin.id)),
      ...unpinned,
      ...rightPinned.map((pin) => columns.find((col) => col.id === pin.id)),
    ];
  }, [pinnedColumns]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Pinnable Table
      </Typography>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {sortedColumns.map((column) => {
                const isPinned = pinnedColumns.some((p) => p.id === column.id);
                return (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    style={{
                      minWidth: column.minWidth,
                      position: isPinned ? "sticky" : "static",
                      left: isPinned && pinnedColumns.find((p) => p.id === column.id)?.side === "left" ? 0 : "auto",
                      right: isPinned && pinnedColumns.find((p) => p.id === column.id)?.side === "right" ? 0 : "auto",
                      backgroundColor: isPinned ? "#f5f5f5" : "white",
                      zIndex: isPinned ? 2 : "auto",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: column.align === "right" ? "flex-end" : "flex-start" }}>
                      {column.label}
                      <Tooltip title={isPinned ? "Unpin" : "Pin"}>
                        <IconButton size="small" onClick={() => togglePin(column.id)} sx={{ ml: 1 }}>
                          {isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.code}>
                {sortedColumns.map((column) => {
                  const isPinned = pinnedColumns.some((p) => p.id === column.id);
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      style={{
                        minWidth: column.minWidth,
                        position: isPinned ? "sticky" : "static",
                        left: isPinned && pinnedColumns.find((p) => p.id === column.id)?.side === "left" ? 0 : "auto",
                        right: isPinned && pinnedColumns.find((p) => p.id === column.id)?.side === "right" ? 0 : "auto",
                        backgroundColor: isPinned ? "#f5f5f5" : "white",
                        zIndex: isPinned ? 2 : "auto",
                      }}
                    >
                      {row[column.id]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
