import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Tooltip, useMediaQuery, Skeleton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DynamicFilterMasterApi } from "../../../Api/TaskApi/DynamicFilterMasterApi";
import { DynamicFilterApi } from "../../../Api/TaskApi/DynamicFilterApi";
import { Advfilters, dynamicFilterDrawer, exportDynamicFilterExcel, exportDynamicFilterLoading, filterDrawer } from "../../../Recoil/atom";
import * as XLSX from "xlsx";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { cleanDate, formatDate2, getcolorsData, priorityColors, statusColors } from "../../../Utils/globalfun";
import DynamicFilterBadge from "../../ShortcutsComponent/DynamincBadge";
import { toast } from "react-toastify";
import { DynamicFilterEditApi } from "../../../Api/TaskApi/DynamicFilterEditApi";
import ReusableAvatar from "../../ShortcutsComponent/ReusableAvatar";
import DynamicColumnFilterDrawer from "./DynamicColumnFilterDrawer";
import { useLocation } from "react-router-dom";
import StatusBadge from "../../ShortcutsComponent/StatusBadge";
import PriorityBadge from "../../ShortcutsComponent/PriorityBadge";
import { Star, Flag, OctagonAlert, Folder } from "lucide-react";

const normalize = (s) => (s || "").toString().trim().toLowerCase().replace(/\s+/g, "");

const columnColors = {
  status: statusColors,
  priority: priorityColors,
  color: getcolorsData,
};

const columnHeaderOverrides = {
  workcategoryid: "CATEGORY",
  statusid: "STATUS",
  createdbyid: "CREATED BY",
  priorityid: "PRIORITY",
  taskno: "TASK / MM NO",
  entrydate: "CREATED DATE",
};

const DynamicFilterReport = ({ selectedMainGroupId = "", selectedAttrsByGroupId = {}, queryData = null, completedFlag = false, archivedFlag = false, filtersProp = null, setFiltersProp = null, isActiveProp, refreshKey = 0, showFavoritesOnly = false, showMilestonesOnly = false, showBlockersOnly = false }) => {
  const location = useLocation();
  const [dynamicFilterOpen, setDynamicFiltersOpen] = useRecoilState(dynamicFilterDrawer);
  const [globalFilters, setGlobalFilters] = useRecoilState(Advfilters);
  const filters = filtersProp ?? globalFilters;
  const setFilters = setFiltersProp ?? setGlobalFilters;
  const showAdvancedFil = useRecoilValue(filterDrawer);
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const gridOffset = showAdvancedFil && !isLaptop ? 395 : 250;
  const exportKey = useRecoilValue(exportDynamicFilterExcel);
  const setExportLoading = useSetRecoilState(exportDynamicFilterLoading);
  const isPaneActive = isActiveProp !== false;
  const [isLoading, setIsLoading] = useState(false);
  const [status500, setStatus500] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const pageSizeOptions = [20, 25, 50, 100];

  const [rd, setRd] = useState([]);
  const [rd1, setRd1] = useState([]);
  const [rd2, setRd2] = useState([]);
  const [rd3, setRd3] = useState([]);
  const [qlColIdToName, setQlColIdToName] = useState({});
  const [rawRows, setRawRows] = useState([]);
  const gridWrapRef = useRef(null);
  const [finalRowData, setFinalRowData] = useState([]);
  const taskAssigneeData = JSON?.parse(localStorage.getItem('taskAssigneeData'));
  const taskStatusData = JSON?.parse(localStorage.getItem("taskstatusData"));
  const taskPriorityData = JSON?.parse(localStorage.getItem("taskpriorityData"));
  const taskProjectData = JSON?.parse(sessionStorage.getItem("taskprojectData") || localStorage.getItem("taskprojectData") || "[]");
  const taskWorkCategoryData = JSON?.parse(localStorage.getItem("taskworkcategoryData"));
  const taskCategory = JSON?.parse(localStorage.getItem("taskworkcategoryData"));
  const searchParams = new URLSearchParams(location.search);
  const encodedData = searchParams.get("data");

  useEffect(() => {
    setFilterDrawerOpen(dynamicFilterOpen);
  }, [dynamicFilterOpen])

  useEffect(() => {
    let parsedData = queryData || null;
    if (!parsedData && encodedData) {
      try {
        const decodedString = decodeURIComponent(encodedData);
        const jsonString = atob(decodedString);
        parsedData = JSON.parse(jsonString);
      } catch (error) {
        console.error("Error decoding or parsing encodedData:", error);
      }
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const masterRes = await DynamicFilterMasterApi();
        setRd(masterRes?.rd ?? []);
        setRd1(masterRes?.rd1 ?? []);
        setRd2(masterRes?.rd2 ?? []);
        setRd3(masterRes?.rd3 ?? []);

        // Entry-date filter → fdate/tdate (supports range object or single ISO date)
        const entryF = typeof filters?.entrydate === 'object' && filters?.entrydate ? filters.entrydate.startDate : filters?.entrydate;
        const entryT = typeof filters?.entrydate === 'object' && filters?.entrydate ? filters.entrydate.endDate : filters?.entrydate;

        const dataRes = await DynamicFilterApi({
          ...parsedData,
          isCompleted: completedFlag ? 1 : 0,
          isarchive: archivedFlag ? 1 : 0,
          fdate: entryF || '',
          tdate: entryT || '',
        });
        if (dataRes?.rd[0]?.stat == 0) {
          toast.error(dataRes?.rd[0]?.stat_msg);
          setRawRows([]);
          setQlColIdToName({});
        } else {
          setQlColIdToName(dataRes?.rd?.[0] ?? {});
          setRawRows(dataRes?.rd1 ?? []);
        }
      } catch {
        setStatus500(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location.pathname, queryData?.taskid, completedFlag, archivedFlag, refreshKey, filters?.entrydate]);

  // Map attribute IDs to labels
  const idToAttr = useMemo(() => {
    const map = new Map();
    rd2.forEach((attr) => map.set(Number(attr.id), attr.filterattr));
    return map;
  }, [rd2]);

  // Master columns
  const allColumnNames = useMemo(
    () => Object.keys(qlColIdToName)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((k) => qlColIdToName[k]),
    [qlColIdToName]
  );

  const masterColNameSet = useMemo(() => {
    const normMap = Object.fromEntries(allColumnNames.map((c) => [normalize(c), c]));
    return new Set(rd1.map((g) => normMap[normalize(g.filtergroup)]).filter(Boolean));
  }, [rd1, allColumnNames]);

  const groupIdToColumnKey = useMemo(() => {
    const normMap = Object.fromEntries(allColumnNames.map((c) => [normalize(c), c]));
    return Object.fromEntries(rd1.map((g) => [g.id, normMap[normalize(g.filtergroup)]]).filter(([_, val]) => val));
  }, [rd1, allColumnNames]);

  // Grid columns
  const gridColumns = useMemo(() => {
    // Dynamic data columns (exclude technical/id & group columns)
    const flagIcons = {
      isfavourite: <Star size={15} color="#FFD700" fill="#FFD700" />,
      ismilestone: <Flag size={15} color="#7367f0" fill="#7367f0" />,
      isblocker: <OctagonAlert size={15} color="#d32f2f" />,
    };
    const flagTooltips = {
      isfavourite: "Favourite",
      ismilestone: "Milestone",
      isblocker: "Blocker",
    };
    const hiddenFlagFields = ["isfavourite", "ismilestone", "isblocker"];

    const dynamicColumns = allColumnNames
      ?.filter((name) => !/^G\d+$/i.test(name) && name !== "taskno" && name !== "maintenanceno" && name !== "id" && name !== "projectid"
        && name !== "createdbyid" // Created By hidden — remove this + uncomment its renderCell below to re-show
        && name !== "entrydate" // Created Date merged into the Start Date cell below
        && !hiddenFlagFields.includes(name))
      .map((name) => {
        const isTaskName = name === "taskname";
        const isHourColumn = name === "estimate_hrs" || name === "working_hr";
        const base = {
          field: name,
          headerName: (columnHeaderOverrides[name?.toLowerCase()] || name?.replace(/_/g, " "))?.toUpperCase(),
          minWidth: isTaskName ? 350 : (isHourColumn ? 120 : 140),
          flex: isTaskName ? 1.2 : 1,
        };
        if (masterColNameSet?.has(name)) {
          return {
            ...base,
            renderCell: ({ value, row }) => {
              const label = value ? idToAttr.get(Number(value)) ?? value : "";
              return (
                <DynamicFilterBadge
                  task={row}
                  columnKey={name.toLowerCase()}
                  value={label}
                  colors={columnColors[name.toLowerCase()] || {}}
                  onChange={(task, col, newVal) => {
                    handleDataChnage(task, col, newVal);
                  }}
                />
              );
            },
          };
        }
        if (name === "deadline") {
          return {
            ...base,
            renderCell: (params) =>
              params?.row?.deadline && cleanDate(params?.row?.deadline)
                ? formatDate2(cleanDate(params?.row?.deadline))
                : "-",
          };
        }

        if (name === "start_date") {
          return {
            ...base,
            renderCell: (params) => {
              const start = params?.row?.start_date && cleanDate(params?.row?.start_date)
                ? formatDate2(cleanDate(params?.row?.start_date)) : "-";
              const created = params?.row?.entrydate && cleanDate(params?.row?.entrydate)
                ? formatDate2(cleanDate(params?.row?.entrydate)) : "-";
              return (
                <Box
                  title={`Created Date: ${created} | Start Date: ${start}`}
                  sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, justifyContent: 'center' }}
                >
                  <span style={{ fontSize: '11px', color: '#8a8a96' }}>{created}</span>
                  <span>{start}</span>
                </Box>
              );
            },
          };
        }

        if (name === "entrydate") {
          return {
            ...base,
            renderCell: (params) =>
              params?.row?.entrydate && cleanDate(params?.row?.entrydate)
                ? formatDate2(cleanDate(params?.row?.entrydate))
                : "-",
          };
        }

        if (name === "taskname") {
          return {
            ...base,
            renderCell: (params) => {
              const taskno = params?.row?.taskno;
              const displayNo = params?.row?.maintenanceno ? params?.row?.maintenanceno : taskno;
              const taskname = params?.row?.taskname;
              const projectLabel = taskProjectData?.find(
                (item) => item?.id == params?.row?.projectid
              )?.labelname;
              const activeFlags = hiddenFlagFields.filter((f) => params?.row?.[f] == 1);
              const hasProject = params?.row?.projectid && params?.row?.projectid != 0;
              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    overflow: "hidden",
                    lineHeight: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayNo && displayNo !== 0 && displayNo !== "0" && (
                      <Box
                        component="span"
                        sx={{
                          marginRight: "4px",
                          color: "#666",
                          fontWeight: "500",
                        }}
                      >
                        {displayNo}
                      </Box>
                    )}
                    <Box component="span">{taskname || "-"}</Box>
                  </Box>
                  {(hasProject || activeFlags.length > 0) && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        fontWeight: 400,
                        color: "#9a97a5",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {hasProject && (
                        <Tooltip title="Project" arrow>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <Folder size={12} color="#7367f0" style={{ flexShrink: 0 }} />
                            <Box
                              component="span"
                              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                            >
                              {projectLabel || params?.row?.projectid}
                            </Box>
                          </Box>
                        </Tooltip>
                      )}
                      {activeFlags.map((f) => (
                        <Tooltip key={f} title={flagTooltips[f]} arrow>
                          <Box
                            component="span"
                            sx={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
                          >
                            {flagIcons[f]}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            },
          };
        }

        if (name === "assignee") {
          return {
            ...base,
            renderCell: (params) => {
              const assigneeIdArray = params?.row?.assignee
                ?.split(",")
                ?.map((id) => Number(id));
              const matchedAssignees = taskAssigneeData?.filter((user) =>
                assigneeIdArray?.includes(user.id)
              );
              return <ReusableAvatar assineeData={matchedAssignees} width={25} max={4} />;
            },
          };
        }

        // Created By column hidden — uncomment this block and remove "createdbyid" from the filter above to re-show
        // if (name === "createdbyid") {
        //   return {
        //     ...base,
        //     renderCell: (params) => {
        //       const assigneeIdArray = params?.row?.createdbyid
        //       const matchedAssignees = taskAssigneeData?.filter((user) =>
        //         assigneeIdArray == user.id
        //       );
        //       return <ReusableAvatar assineeData={matchedAssignees} width={25} max={4} />;
        //     },
        //   };
        // }

        if (name === "workcategoryid") {
          return {
            ...base,
            renderCell: (params) => {
              const category = taskWorkCategoryData?.find(
                (item) => item?.id == params?.row?.workcategoryid
              );
              return <Box component="span">{category?.labelname || "-"}</Box>;
            },
          };
        }

        if (name === "statusid") {
          return {
            ...base,
            renderCell: (params) => {
              const status = taskStatusData?.find(
                (item) => item?.id == params?.row?.statusid
              );
              return <StatusBadge
                task={{ status: status?.labelname ?? "" }}
                statusColors={statusColors}
                onStatusChange={() => { }}
                flag="status"
                fontSize="13px"
                padding="0.15rem 0.6rem"
                minWidth="60px"
                disable={true}
              />
            },
          };
        }

        if (name === "priorityid") {
          return {
            ...base,
            renderCell: (params) => {
              const priority = taskPriorityData?.find(
                (item) => item?.id == params?.row?.priorityid
              );
              return <PriorityBadge
                task={{ priority: priority?.labelname ?? "" }}
                priorityColors={priorityColors}
                onPriorityChange={() => { }}
                fontSize="13px"
                padding="0.15rem 0.6rem"
                minWidth="60px"
                disable={true}
              />
            },
          };
        }

        return base;
      });

    // Prepend SR NO column (value is precomputed on the row)
    const srNoColumn = {
      field: "srNo",
      headerName: "SR#",
      width: 80,
      minWidth: 80,
      flex: 0,
      sortable: false,
      filterable: false,
    };

    return [srNoColumn, ...(dynamicColumns || [])];
  }, [allColumnNames, masterColNameSet, idToAttr]);

  // Original rows with proper column names
  const originalRows = useMemo(() => {
    return rawRows.map((row, idx) => {
      const formatted = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [qlColIdToName[k], v]).filter(([key]) => key)
      );
      return { id: formatted.id ?? idx + 1, ...formatted };
    });
  }, [rawRows, qlColIdToName]);

  useEffect(() => {
    setFinalRowData(originalRows);
  }, [originalRows]);

  // MUI X v7 known bug (mui-x#16667): a DataGrid that mounts inside a hidden
  // container (display:none pane / route shell) calculates wrong column widths
  // and never recovers — resize()/forceUpdate() don't fix it. Gate mounting on
  // IntersectionObserver instead: elements inside display:none ancestors are
  // NOT intersecting, so the grid only mounts while genuinely visible and
  // remounts clean on every hide → show. rootMargin lets it mount slightly
  // before scrolling into view.
  const [gridIntersecting, setGridIntersecting] = useState(false);
  useEffect(() => {
    const el = gridWrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setGridIntersecting(entry.isIntersecting && entry.boundingClientRect.width > 0),
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Excel export — triggered from HeaderButtons via exportDynamicFilterExcel atom
  useEffect(() => {
    if (!exportKey || !isPaneActive || isLoading) return;
    const hidden = ["id", "projectid", "createdbyid", "isfavourite", "ismilestone", "isblocker", "maintenanceno"];
    const filteredNames = allColumnNames.filter(
      (name) => !/^G\d+$/i.test(name) && !hidden.includes(name)
    );
    const visibleNames = filteredNames.includes("taskno")
      ? ["taskno", ...filteredNames.filter((n) => n !== "taskno")]
      : filteredNames;
    const getCellValue = (row, name) => {
      if (name === "taskname") {
        return row?.taskname ?? "";
      }
      if (name === "taskno") {
        const no = row?.maintenanceno ? row?.maintenanceno : row?.taskno;
        return no && no !== 0 && no !== "0" ? no : "";
      }
      if (name === "assignee") {
        return (row?.assignee || "").split(",").map((id) => {
          const u = taskAssigneeData?.find((u) => u.id == id);
          return u ? `${u?.firstname ?? ""} ${u?.lastname ?? ""}`.trim() : "";
        }).filter(Boolean).join(", ");
      }
      if (name === "deadline" || name === "start_date" || name === "entrydate") {
        return row?.[name] && cleanDate(row?.[name]) ? formatDate2(cleanDate(row?.[name])) : "";
      }
      if (name === "statusid") return taskStatusData?.find((s) => s.id == row?.statusid)?.labelname ?? "";
      if (name === "priorityid") return taskPriorityData?.find((p) => p.id == row?.priorityid)?.labelname ?? "";
      if (name === "workcategoryid") return taskWorkCategoryData?.find((c) => c.id == row?.workcategoryid)?.labelname ?? "";
      if (masterColNameSet.has(name)) return row?.[name] ? (idToAttr.get(Number(row?.[name])) ?? row?.[name]) : "";
      return row?.[name] ?? "";
    };
    setExportLoading(true);
    let cancelled = false;
    const dateStr = new Date().toISOString().slice(0, 10);
    // Large exports go out as CSV — a Blob of text chunks stays small in memory,
    // while XLSX would need ~1.5M cell objects for 1 lakh rows and can crash the tab
    const useCsv = filteredRows.length > 20000;

    const timer = setTimeout(async () => {
      try {
        const headers = ["SR#", ...visibleNames.map(
          (name) => (columnHeaderOverrides[name?.toLowerCase()] || name?.replace(/_/g, " "))?.toUpperCase()
        )];
        const CHUNK = 5000;

        if (useCsv) {
          const esc = (v) => {
            const s = v == null ? "" : String(v);
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          };
          // BOM (\uFEFF) so Excel reads UTF-8 correctly
          const parts = ["﻿" + headers.map(esc).join(",") + "\r\n"];
          for (let i = 0; i < filteredRows.length; i += CHUNK) {
            if (cancelled) return;
            parts.push(
              filteredRows.slice(i, i + CHUNK)
                .map((row) => [row.srNo, ...visibleNames.map((n) => getCellValue(row, n))].map(esc).join(","))
                .join("\r\n") + "\r\n"
            );
            await new Promise((r) => setTimeout(r, 0));
          }
          if (cancelled) return;
          const blob = new Blob(parts, { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `DynamicFilterReport_${dateStr}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const ws = XLSX.utils.aoa_to_sheet([headers]);
          for (let i = 0; i < filteredRows.length; i += CHUNK) {
            if (cancelled) return;
            const aoa = filteredRows.slice(i, i + CHUNK).map(
              (row) => [row.srNo, ...visibleNames.map((name) => getCellValue(row, name))]
            );
            XLSX.utils.sheet_add_aoa(ws, aoa, { origin: -1 });
            await new Promise((r) => setTimeout(r, 0));
          }
          if (cancelled) return;
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Tasks");
          XLSX.writeFile(wb, `DynamicFilterReport_${dateStr}.xlsx`);
        }
      } catch (error) {
        console.error("Excel export failed:", error);
        toast.error("Export failed");
      } finally {
        setExportLoading(false);
      }
    }, 50);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportKey]);

  const handleDataChnage = async (task, col, newVal) => {
    try {
      const data = {
        [`group${newVal.filtergroupid}_attr`]: newVal.filterattrid,
      }
      const apiRes = await DynamicFilterEditApi(data, task);
      if (apiRes?.rd[0]?.stat == 1) {
        const data = originalRows?.map((item) => {
          if (item.id === task.id) {
            item[col] = newVal?.filterattrid;
          }
          return item;
        })
        setFinalRowData(data);
        toast.success("Filter updated successfully");
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Error in updating filter");
    }
  }

  // Filtered rows
  const filteredRows = useMemo(() => {
    const filtered = finalRowData.filter((row) => {
      // Quick toggle filters (favourite / milestone / blocker)
      if (showFavoritesOnly && row?.isfavourite != 1) return false;
      if (showMilestonesOnly && row?.ismilestone != 1) return false;
      if (showBlockersOnly && row?.isblocker != 1) return false;

      const matchesGroups = Object.entries(selectedAttrsByGroupId).every(([gid, vals]) => {
        if (!vals?.length) return true;
        const colKey = groupIdToColumnKey[gid];
        if (!colKey) return true;
        const rowVal = row[colKey];
        if (rowVal === undefined || rowVal === null) return false;

        return vals.some((v) => {
          const label = masterColNameSet.has(colKey) ? idToAttr.get(Number(v)) : v;
          return normalize(String(rowVal)) === normalize(String(label));
        });
      });
      if (!matchesGroups) return false;

      // Date filters — Filters.jsx writes a range object { startDate, endDate };
      // clearing emits { startDate: "", endDate: "" } (truthy!) so must validate first
      const isValidRange = (v) => v && typeof v === 'object' && v.startDate && v.endDate;
      const dateFilterActive = (f) => isValidRange(f) || (f && typeof f !== 'object');
      const withinRange = (dateStr, range) => {
        const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
        const s = new Date(range.startDate); s.setHours(0, 0, 0, 0);
        const e = new Date(range.endDate); e.setHours(23, 59, 59, 999);
        return d >= s && d <= e;
      };

      // Date filtering for start_date
      if (dateFilterActive(filters?.startDate)) {
        const rowStartDate = row?.start_date && cleanDate(row.start_date);
        if (!rowStartDate) return false;
        if (isValidRange(filters.startDate)) {
          if (!withinRange(rowStartDate, filters.startDate)) return false;
        } else if (formatDate2(filters.startDate) !== formatDate2(rowStartDate)) {
          return false;
        }
      }

      // Date filtering for deadline
      if (dateFilterActive(filters?.dueDate)) {
        const rowDeadline = row?.deadline && cleanDate(row.deadline);
        if (!rowDeadline) return false;
        if (isValidRange(filters.dueDate)) {
          if (!withinRange(rowDeadline, filters.dueDate)) return false;
        } else if (formatDate2(filters.dueDate) !== formatDate2(rowDeadline)) {
          return false;
        }
      }

      // Entry-date filtering — only MM-numbered (maintenance module) tasks
      // qualify; subtasks carry no maintenanceno and drop out.
      if (dateFilterActive(filters?.entrydate)) {
        if (!row?.maintenanceno) return false;
        const rowEntry = row?.entrydate && cleanDate(row.entrydate);
        if (!rowEntry) return false;
        if (isValidRange(filters.entrydate)) {
          if (!withinRange(rowEntry, filters.entrydate)) return false;
        } else if (formatDate2(filters.entrydate) !== formatDate2(rowEntry)) {
          return false;
        }
      }

      // Assignee filtering
      if (filters?.assignee?.trim()) {
        const rowAssigneeIds = row?.assignee?.split(",")?.map(id => Number(id));
        if (rowAssigneeIds?.length) {
          const matchedAssignees = taskAssigneeData?.filter(user =>
            rowAssigneeIds.includes(user.id)
          );
          const hasMatchingAssignee = matchedAssignees?.some(assignee => {
            const fullName = `${assignee?.firstname} ${assignee?.lastname}`;
            return fullName?.toLowerCase().includes(filters.assignee.toLowerCase());
          });
          if (!hasMatchingAssignee) return false;
        } else {
          return false; // No assignees in row, but filter is applied
        }
      }

      // Work category filtering
      if (filters?.workcategoryid) {
        const rowWorkCategoryId = row?.workcategoryid;
        const filterCategory = taskWorkCategoryData?.find(cat => cat.labelname === filters.workcategoryid);
        if (filterCategory && rowWorkCategoryId != filterCategory.id) {
          return false;
        } else if (!filterCategory && filters.workcategoryid !== rowWorkCategoryId) {
          return false;
        }
      }

      // Status filtering (filters.status -> row.statusid)
      if (filters?.status) {
        const rowStatusId = row?.statusid;
        const filterStatus = taskStatusData?.find(st => st.labelname === filters.status);
        if (filterStatus) {
          if (rowStatusId != filterStatus.id) return false;
        } else {
          const rowStatusLabel = taskStatusData?.find(st => st.id == rowStatusId)?.labelname;
          if (!rowStatusLabel || normalize(rowStatusLabel) !== normalize(filters.status)) return false;
        }
      }

      // Priority filtering (filters.priority -> row.priorityid)
      if (filters?.priority) {
        const rowPriorityId = row?.priorityid;
        const filterPriority = taskPriorityData?.find(pr => pr.labelname === filters.priority);
        if (filterPriority) {
          if (rowPriorityId != filterPriority.id) return false;
        } else {
          const rowPriorityLabel = taskPriorityData?.find(pr => pr.id == rowPriorityId)?.labelname;
          if (!rowPriorityLabel || normalize(rowPriorityLabel) !== normalize(filters.priority)) return false;
        }
      }

      // Project filtering (filters.project -> row.projectid)
      if (filters?.project) {
        const rowProjectId = row?.projectid;
        const filterProject = taskProjectData?.find(pr => pr.labelname === filters.project);
        if (filterProject) {
          if (rowProjectId != filterProject.id) return false;
        } else {
          const rowProjectLabel = taskProjectData?.find(pr => pr.id == rowProjectId)?.labelname;
          if (!rowProjectLabel || normalize(rowProjectLabel) !== normalize(filters.project)) return false;
        }
      }

      // Dynamic master column filtering
      for (const [filterKey, filterValue] of Object.entries(filters)) {
        if (filterValue && masterColNameSet.has(filterKey) &&
          !['searchTerm', 'startDate', 'dueDate', 'assignee', 'workcategoryid'].includes(filterKey)) {
          const rowValue = row[filterKey];
          if (rowValue) {
            const rowLabel = idToAttr.get(Number(rowValue));
            if (rowLabel !== filterValue) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      // Category filtering (special handling for Unset Deadline, Due, and Today)
      if (filters?.category && filters.category.length > 0) {
        const hasUnsetDeadline = filters.category.includes("Unset Deadline");
        const hasDue = filters.category.includes("Due");
        const hasToday = filters.category.includes("Today");

        if (hasUnsetDeadline || hasDue || hasToday) {
          // Handle special categories
          if (hasUnsetDeadline && hasDue && hasToday) {
            // All three selected - show tasks with no deadline OR due tasks OR start_date today
            const hasNoDeadline = !row?.deadline || !cleanDate(row?.deadline);
            const isDue = row?.deadline && cleanDate(row?.deadline) &&
              new Date(cleanDate(row?.deadline)) <= new Date();
            const isToday = row?.start_date && cleanDate(row?.start_date) &&
              formatDate2(cleanDate(row?.start_date)) === formatDate2(new Date());
            if (!hasNoDeadline && !isDue && !isToday) return false;
          } else if (hasUnsetDeadline && hasDue) {
            // Unset Deadline + Due selected - show tasks with no deadline OR due tasks
            const hasNoDeadline = !row?.deadline || !cleanDate(row?.deadline);
            const isDue = row?.deadline && cleanDate(row?.deadline) &&
              new Date(cleanDate(row?.deadline)) <= new Date();
            if (!hasNoDeadline && !isDue) return false;
          } else if (hasUnsetDeadline && hasToday) {
            // Unset Deadline + Today selected - show tasks with no deadline OR start_date today
            const hasNoDeadline = !row?.deadline || !cleanDate(row?.deadline);
            const isToday = row?.start_date && cleanDate(row?.start_date) &&
              formatDate2(cleanDate(row?.start_date)) === formatDate2(new Date());
            if (!hasNoDeadline && !isToday) return false;
          } else if (hasDue && hasToday) {
            // Due + Today selected - show due tasks OR start_date today
            const isDue = row?.deadline && cleanDate(row?.deadline) &&
              new Date(cleanDate(row?.deadline)) <= new Date();
            const isToday = row?.start_date && cleanDate(row?.start_date) &&
              formatDate2(cleanDate(row?.start_date)) === formatDate2(new Date());
            if (!isDue && !isToday) return false;
          } else if (hasUnsetDeadline) {
            // Only Unset Deadline selected
            if (row?.deadline && cleanDate(row?.deadline)) return false;
          } else if (hasDue) {
            // Only Due selected
            if (!row?.deadline || !cleanDate(row?.deadline)) return false;
            const deadlineDate = new Date(cleanDate(row?.deadline));
            if (deadlineDate > new Date()) return false;
          } else if (hasToday) {
            // Only Today selected - show tasks with start_date today
            if (!row?.start_date || !cleanDate(row?.start_date)) return false;
            if (formatDate2(cleanDate(row?.start_date)) !== formatDate2(new Date())) return false;
          }

          // Remove special categories from further processing
          const regularCategories = filters.category.filter(cat =>
            cat !== "Unset Deadline" && cat !== "Due" && cat !== "Today"
          );

          // If there are regular categories, also check those
          if (regularCategories.length > 0) {
            const rowCategoryId = row?.workcategoryid;
            if (!rowCategoryId) return false;

            const hasMatchingCategory = regularCategories.some(catName => {
              const category = taskCategory?.find(cat => cat.labelname === catName);
              return category && rowCategoryId == category.id;
            });

            if (!hasMatchingCategory) return false;
          }
        } else {
          // Regular category filtering
          const rowCategoryId = row?.workcategoryid;
          if (!rowCategoryId) return false;

          const hasMatchingCategory = filters.category.some(catName => {
            const category = taskCategory?.find(cat => cat.labelname === catName);
            return category && rowCategoryId == category.id;
          });

          if (!hasMatchingCategory) return false;
        }
      }

      // Search term filtering
      if (filters?.searchTerm?.trim()) {
        const term = filters.searchTerm.toLowerCase();
        return Object.entries(row).some(([col, val]) => {
          if (!val) return false;

          // Master column filtering
          if (masterColNameSet.has(col)) {
            const label = idToAttr.get(Number(val));
            if (label?.toLowerCase().includes(term)) return true;
          }

          // Work category filtering
          if (col === 'workcategoryid' && val) {
            const category = taskWorkCategoryData?.find(cat => cat.id == val);
            if (category?.labelname?.toLowerCase().includes(term)) return true;
          }

          // Assignee filtering
          if (col === 'assignee' && val) {
            const assigneeIds = val.split(',').map(id => Number(id));
            const matchedAssignees = taskAssigneeData?.filter(user =>
              assigneeIds.includes(user.id)
            );
            const hasMatchingAssignee = matchedAssignees?.some(assignee => {
              const fullName = `${assignee?.firstname} ${assignee?.lastname}`;
              return fullName?.toLowerCase().includes(term);
            });
            if (hasMatchingAssignee) return true;
          }

          return String(val).toLowerCase().includes(term);
        });
      }
      return true;
    });

    // Latest start_date first; rows without a valid start date sink to the bottom
    filtered.sort((a, b) => {
      const aTime = a?.start_date && cleanDate(a.start_date) ? new Date(cleanDate(a.start_date)).getTime() || 0 : 0;
      const bTime = b?.start_date && cleanDate(b.start_date) ? new Date(cleanDate(b.start_date)).getTime() || 0 : 0;
      return bTime - aTime;
    });

    // Add sequential SR NO based on current filtered order (1-based)
    return filtered.map((row, index) => ({ ...row, srNo: index + 1 }));
  }, [finalRowData, selectedAttrsByGroupId, groupIdToColumnKey, idToAttr, filters, masterColNameSet, taskAssigneeData, taskWorkCategoryData, taskCategory, taskStatusData, taskPriorityData, taskProjectData, showFavoritesOnly, showMilestonesOnly, showBlockersOnly]);

  // Count active filters
  const activeFiltersCount = Object.keys(filters).filter(key =>
    filters[key] && filters[key] !== '' && key !== 'searchTerm'
  ).length;

  return (
    <Box sx={{ pt: 2 }}>
      {status500 && (
        <Typography color="error" sx={{ mb: 2 }}>
          Something went wrong while fetching data.
        </Typography>
      )}
      {
        <Box ref={gridWrapRef} sx={{ height: `calc(100vh - ${gridOffset}px)`, width: "100%", minWidth: 0 }}>
          {allColumnNames.length === 0 || !gridIntersecting ? (
            <Skeleton variant="rounded" width="100%" height="100%" sx={{ transform: "translateY(-10px)", borderRadius: 2 }} />
          ) : (
          <DataGrid
            rows={filteredRows}
            loading={isLoading}
            localeText={{ noRowsLabel: 'No matching records found' }}
            columns={gridColumns}
            getRowId={(r) => r.id}
            pageSize={paginationModel.pageSize}
            onPageSizeChange={(size) => setPaginationModel((p) => ({ ...p, pageSize: size }))}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={pageSizeOptions}
            disableColumnMenu
            disableSelectionOnClick
            disableRowSelectionOnClick

            sx={{
              fontFamily: "Public Sans",
              transform: "translateY(-10px)",
              transition: "transform 0.3s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              border: "none",
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold", color: "#6D6B77" },
              "& .MuiDataGrid-row": { alignItems: "center", height: "45px !important", minHeight: "45px !important" },
              "& .MuiDataGrid-cell": { fontSize: "14px", display: "flex", alignItems: "center", color: "#6D6B77" },
              "& .MuiDataGrid-columnHeaders ": {
                "& div": {
                  backgroundColor: "#f5f5f5 !important"
                }
              },
              "& .MuiDataGrid-columnHeader, .MuiDataGrid-columnSeparator": {
                height: '40px !important',
                minHeight: '40px !important',
              }
            }}
          />
          )}
        </Box>
      }

      {/* Dynamic Filter Drawer */}
      <DynamicColumnFilterDrawer
        open={filterDrawerOpen}
        onClose={() => { setFilterDrawerOpen(false); setDynamicFiltersOpen(false) }}
        availableColumns={allColumnNames}
        filters={filters}
        setFilters={setFilters}
        masterData={{}}
        idToAttr={idToAttr}
        masterColNameSet={masterColNameSet}
      />
    </Box>
  );
};

export default memo(DynamicFilterReport);
