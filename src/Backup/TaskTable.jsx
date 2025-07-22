import React, { useState } from "react";

// ✅ key mapping from string number keys to field names
const fieldKeyMap = {
  parentid: "1",
  taskid: "2",
  projectid: "3",
  entrydate: "4",
  taskname: "5",
  StartDate: "6",
  estimate_hrs: "7",
  DeadLineDate: "8",
  priorityid: "9",
  statusid: "10",
  workcategoryid: "11",
  departmentid: "12",
  isFreez: "13",
  progress_per: "14",
  ismilestone: "15",
  estimate1_hrs: "16",
  estimate2_hrs: "17",
  isfavourite: "18",
  isnew: "19",
  isburning: "20",
  ticketno: "21",
  assigneids: "22",
  descr: "23",
  createdbyid: "24",
  maingroupids: "25",
  workinghr: "26",
  secstatusid: "27",
  EndDate: "28",
};

// ✅ convert raw tasks (number-keyed) into readable keyed objects
const transformTask = (rawTask) => {
  const result = {};
  for (const key in fieldKeyMap) {
    const mappedKey = fieldKeyMap[key];
    result[key] = rawTask[mappedKey];
  }
  return result;
};

// ✅ descending comparator
function descendingComparator(a, b, orderByKey) {
  const valA = a?.[orderByKey];
  const valB = b?.[orderByKey];

  // Handle dates
  if (Date.parse(valA) && Date.parse(valB)) {
    return new Date(valB) - new Date(valA);
  }

  // Handle numbers and strings
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

// ✅ order comparator
function getComparator(order, orderByKey) {
  return order === "asc"
    ? (a, b) => -descendingComparator(a, b, orderByKey)
    : (a, b) => descendingComparator(a, b, orderByKey);
}

// ✅ Sample Component
const TaskTable = ({ tasks }) => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("entrydate"); // default sort by entrydate

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const transformedTasks = tasks.map(transformTask);
  const sortedData = [...transformedTasks].sort(getComparator(order, orderBy));

  return (
    <div>
      <table border="1" cellPadding={6} cellSpacing={0}>
        <thead>
          <tr>
            <th onClick={() => handleRequestSort("entrydate")}>Entry Date</th>
            <th onClick={() => handleRequestSort("taskname")}>Task Name</th>
            <th onClick={() => handleRequestSort("taskid")}>Task ID</th>
            <th onClick={() => handleRequestSort("priorityid")}>Priority</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((task, index) => (
            <tr key={index}>
              <td>{new Date(task.entrydate).toLocaleDateString()}</td>
              <td>{task.taskname}</td>
              <td>{task.taskid}</td>
              <td>{task.priorityid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
