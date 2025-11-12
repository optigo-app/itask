import React, { memo, useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DynamicFilterMasterApi } from "../../../Api/TaskApi/DynamicFilterMasterApi";
import { DynamicFilterApi } from "../../../Api/TaskApi/DynamicFilterApi";
import { Advfilters, dynamicFilterDrawer } from "../../../Recoil/atom";
import { useRecoilState } from "recoil";
import { cleanDate, formatDate2, getcolorsData, priorityColors, statusColors } from "../../../Utils/globalfun";
import DynamicFilterBadge from "../../ShortcutsComponent/DynamincBadge";
import { toast } from "react-toastify";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { DynamicFilterEditApi } from "../../../Api/TaskApi/DynamicFilterEditApi";
import ReusableAvatar from "../../ShortcutsComponent/ReusableAvatar";
import DynamicColumnFilterDrawer from "./DynamicColumnFilterDrawer";
import { useLocation } from "react-router-dom";

const normalize = (s) => (s || "").toString().trim().toLowerCase().replace(/\s+/g, "");

const columnColors = {
  status: statusColors,
  priority: priorityColors,
  color: getcolorsData,
};

const DynamicFilterReport = ({ selectedMainGroupId = "", selectedAttrsByGroupId = {} }) => {
  const location = useLocation();
  const [dynamicFilterOpen, setDynamicFiltersOpen] = useRecoilState(dynamicFilterDrawer);
  const [filters] = useRecoilState(Advfilters);
  const [isLoading, setIsLoading] = useState(false);
  const [status500, setStatus500] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const pageSizeOptions = [20, 25, 50, 100];

  const [rd, setRd] = useState([]);
  const [rd1, setRd1] = useState([]);
  const [rd2, setRd2] = useState([]);
  const [rd3, setRd3] = useState([]);
  const [qlColIdToName, setQlColIdToName] = useState({});
  const [rawRows, setRawRows] = useState([]);
  const [finalRowData, setFinalRowData] = useState([]);
  const taskAssigneeData = JSON?.parse(sessionStorage.getItem('taskAssigneeData'));
  const taskWorkCategoryData = JSON?.parse(sessionStorage.getItem("taskworkcategoryData"));
  const searchParams = new URLSearchParams(location.search);
  const encodedData = searchParams.get("data");

  useEffect(() => {
    setFilterDrawerOpen(dynamicFilterOpen);
  }, [dynamicFilterOpen])

  useEffect(() => {
    let parsedData = null;
    if (encodedData) {
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

        const dataRes = await DynamicFilterApi(parsedData?.taskid);
        setQlColIdToName(dataRes?.rd?.[0] ?? {});
        setRawRows(dataRes?.rd1 ?? []);
      } catch {
        setStatus500(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
    return allColumnNames?.filter((name) => !/^G\d+$/i.test(name) && name !== "taskno").map((name) => {
      const base = {
        field: name,
        headerName: name?.replace(/_/g, " ")?.toUpperCase(),
        width: name === "id" ? 60 : name === "taskname" ? 350 : name === "estimate_hrs" || name === "working_hr" ? 120 : 140,
        flex: name === "id" || name === "taskname" ? "" : '',
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
              : '-'
        };
      }
      if (name === "start_date") {
        return {
          ...base,
          renderCell: (params) =>
            params?.row?.start_date && cleanDate(params?.row?.start_date)
              ? formatDate2(cleanDate(params?.row?.start_date))
              : '-'
        };
      }
      if (name === "taskname") {
        return {
          ...base,
          renderCell: (params) => {
            const taskno = params?.row?.taskno;
            const taskname = params?.row?.taskname;
            return (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {taskno && taskno !== 0 && taskno !== "0" && (
                  <Box component="span" sx={{
                    marginRight: '8px',
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    {taskno}
                  </Box>
                )}
                <Box component="span">
                  {taskname || '-'}
                </Box>
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
            return (
              <ReusableAvatar assineeData={matchedAssignees} width={25} max={4} />

            );
          },
        };
      }

      if (name === "workcategoryid") {
        return {
          ...base,
          renderCell: (params) => {
            const category = taskWorkCategoryData?.find(
              (item) => item?.id == params?.row?.workcategoryid
            );
            return (
              <Box component="span">
                {category?.labelname || '-'}
              </Box>

            );
          },
        };
      }
      return base;
    });
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
    return finalRowData.filter((row) => {
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

      // Date filtering for start_date
      if (filters?.startDate) {
        const rowStartDate = row?.start_date;
        if (rowStartDate && cleanDate(rowStartDate)) {
          const filterStartDate = formatDate2(filters.startDate);
          const rowFormattedStartDate = formatDate2(cleanDate(rowStartDate));
          if (filterStartDate !== rowFormattedStartDate) return false;
        } else {
          return false; // No start date in row, but filter is applied
        }
      }

      // Date filtering for deadline
      if (filters?.dueDate) {
        const rowDeadline = row?.deadline;
        if (rowDeadline && cleanDate(rowDeadline)) {
          const filterDueDate = formatDate2(filters.dueDate);
          const rowFormattedDeadline = formatDate2(cleanDate(rowDeadline));
          if (filterDueDate !== rowFormattedDeadline) return false;
        } else {
          return false; // No deadline in row, but filter is applied
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
  }, [finalRowData, selectedAttrsByGroupId, groupIdToColumnKey, idToAttr, filters, masterColNameSet, taskAssigneeData, taskWorkCategoryData]);

  // Count active filters
  const activeFiltersCount = Object.keys(filters).filter(key =>
    filters[key] && filters[key] !== '' && key !== 'searchTerm'
  ).length;

  return (
    <Box sx={{ pt: 2 }}>
      {isLoading && filteredRows?.length == 0 && (
        <Box sx={{ textAlign: "center", my: 2 }}>
          <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
        </Box>
      )}
      {status500 && (
        <Typography color="error" sx={{ mb: 2 }}>
          Something went wrong while fetching data.
        </Typography>
      )}
      {filteredRows?.length != 0 &&
        <Box sx={{ height: "calc(100vh - 250px)" }}>
          <DataGrid
            rows={filteredRows}
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
        </Box>
      }

      {/* Dynamic Filter Drawer */}
      <DynamicColumnFilterDrawer
        open={filterDrawerOpen}
        onClose={() => { setFilterDrawerOpen(false); setDynamicFiltersOpen(false) }}
        availableColumns={allColumnNames}
        masterData={{}}
        idToAttr={idToAttr}
        masterColNameSet={masterColNameSet}
      />
    </Box>
  );
};

export default memo(DynamicFilterReport);
