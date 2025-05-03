// import React, { useState } from "react";
// import {
//   Autocomplete,
//   TextField,
//   Chip,
//   Typography,
//   Box,
// } from "@mui/material";

// // More realistic employee dataset
// const employees = [
//   { id: 1, name: "Alice Johnson", department: "Human Resources" },
//   { id: 2, name: "Bob Smith", department: "Finance" },
//   { id: 3, name: "Charlie Brown", department: "Information Technology" },
//   { id: 4, name: "David Clark", department: "Human Resources" },
//   { id: 5, name: "Eva Adams", department: "Information Technology" },
//   { id: 6, name: "Frank Wright", department: "Marketing" },
//   { id: 7, name: "Grace Lee", department: "Finance" },
//   { id: 8, name: "Henry Ford", department: "Logistics" },
//   { id: 9, name: "Ivy Green", department: "Marketing" },
//   { id: 10, name: "Jack White", department: "Legal" },
// ];

// export default function DepartmentWiseEmployeeSelect() {
//   const [selectedEmployees, setSelectedEmployees] = useState([]);
//   console.log('selectedEmployees: ', selectedEmployees);

//   const filterOptions = (options, { inputValue }) => {
//     return options.filter(
//       (emp) =>
//         emp.name.toLowerCase().includes(inputValue.toLowerCase()) ||
//         emp.department.toLowerCase().includes(inputValue.toLowerCase())
//     );
//   };

//   return (
//     <Autocomplete
//       multiple
//       options={employees}
//       filterOptions={filterOptions}
//       groupBy={(option) => option.department}
//       getOptionLabel={(option) => option.name}
//       value={selectedEmployees}
//       onChange={(e, newValue) => setSelectedEmployees(newValue)}
//       renderInput={(params) => (
//         <TextField
//           {...params}
//           label="Select Employees"
//           placeholder="Search by name or department"
//           variant="outlined"
//         />
//       )}
//       renderGroup={(params) => (
//         <Box key={params.key} sx={{ pt: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 600, pl: 2 }}>
//             {params.group}
//           </Typography>
//           {params.children}
//         </Box>
//       )}
//       renderTags={(value, getTagProps) =>
//         value.map((option, index) => (
//           <Chip
//             label={`${option.name} (${option.department})`}
//             {...getTagProps({ index })}
//             key={option.id}
//             sx={{ m: 0.3 }}
//           />
//         ))
//       }
//       sx={{ width: 500 }}
//     />
//   );
// }


import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  Chip,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import { commonTextFieldProps, ImageUrl } from "../Utils/globalfun";

// Updated sample data
const employees = [
  {
    id: 6,
    userid: "Accountant@eg.com",
    customercode: "account",
    firstname: "Ashish",
    lastname: "Patel",
    designation: "Account Head",
    department: "Account",
    empphoto: "",
  },
  {
    id: 7,
    userid: "hr@eg.com",
    customercode: "hr",
    firstname: "Riya",
    lastname: "Shah",
    designation: "HR Manager",
    department: "Human Resources",
    empphoto: "",
  },
  {
    id: 8,
    userid: "it@eg.com",
    customercode: "it",
    firstname: "Jay",
    lastname: "Mehta",
    designation: "IT Support",
    department: "Information Technology",
    empphoto: "",
  },
  {
    id: 9,
    userid: "logistics@eg.com",
    customercode: "log001",
    firstname: "Meera",
    lastname: "Kapoor",
    designation: "Logistics Manager",
    department: "Logistics",
    empphoto: "",
  },
  {
    id: 10,
    userid: "design@eg.com",
    customercode: "des001",
    firstname: "Aman",
    lastname: "Verma",
    designation: "Graphic Designer",
    department: "Design",
    empphoto: "",
  },
  {
    id: 11,
    userid: "legal@eg.com",
    customercode: "leg001",
    firstname: "Neha",
    lastname: "Joshi",
    designation: "Legal Advisor",
    department: "Legal",
    empphoto: "",
  },
  {
    id: 12,
    userid: "ops@eg.com",
    customercode: "ops001",
    firstname: "Rakesh",
    lastname: "Singh",
    designation: "Operations Manager",
    department: "Operations",
    empphoto: "",
  },
  {
    id: 13,
    userid: "sales@eg.com",
    customercode: "sal001",
    firstname: "Priya",
    lastname: "Desai",
    designation: "Sales Executive",
    department: "Sales",
    empphoto: "",
  },
  {
    id: 14,
    userid: "marketing@eg.com",
    customercode: "mkt001",
    firstname: "Arjun",
    lastname: "Rao",
    designation: "Marketing Analyst",
    department: "Marketing",
    empphoto: "",
  },
  {
    id: 15,
    userid: "admin@eg.com",
    customercode: "adm001",
    firstname: "Tanvi",
    lastname: "Nair",
    designation: "Admin Officer",
    department: "Administration",
    empphoto: "",
  },
  {
    id: 16,
    userid: "procurement@eg.com",
    customercode: "prc001",
    firstname: "Kunal",
    lastname: "Dixit",
    designation: "Procurement Specialist",
    department: "Procurement",
    empphoto: "",
  }
];


export default function DepartmentAssigneeAutocomplete() {
  const [selected, setSelected] = useState([]);

  const getFullName = (emp) => `${emp.firstname} ${emp.lastname}`;
  const getDeptAssignee = (emp) => `${emp.department} / ${getFullName(emp)}`;

  const filterOptions = (options, { inputValue }) =>
    options.filter(
      (emp) =>
        getFullName(emp).toLowerCase().includes(inputValue.toLowerCase()) ||
        emp.department.toLowerCase().includes(inputValue.toLowerCase())
    );

  return (
    <Autocomplete
      multiple
      fullWidth
      options={employees}
      filterOptions={filterOptions}
      getOptionLabel={(option) => getDeptAssignee(option)}
      value={selected}
      onChange={(e, newValue) => setSelected(newValue)}
      sx={{
        "& .MuiOutlinedInput-root.Mui-focused": {
          paddingTop: selected.length > 2 ? "5px !important" : "0px",
        },
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const imageSrc = ImageUrl(option);
          return (
            <Chip
              key={option.id}
              avatar={
                imageSrc ? (
                  <Avatar src={imageSrc} alt={option.firstname} />
                ) : (
                  <Avatar
                    sx={{
                      fontSize: "14px",
                      textTransform: "capitalize",
                    }}
                  >
                    {option.firstname.charAt(0)}
                  </Avatar>
                )
              }
              label={
                <Box
                  sx={{
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>{option.department}</span> / {option.firstname} {option.lastname}
                </Box>
              }
              {...getTagProps({ index })}
              sx={{
                borderRadius: "8px",
                fontSize: "14px",
                textTransform: "capitalize",
              }}
            />
          );
        })
      }
      renderOption={(props, option) => {
        const imageSrc = ImageUrl(option);
        return (
          <li {...props} key={option.id}>
            <Avatar
              src={imageSrc}
              alt={option.firstname}
              sx={{
                width: 25,
                height: 25,
                marginRight: 1,
                fontSize: "14px",
                textTransform: "capitalize",
              }}
            >
              {!imageSrc && option.firstname.charAt(0)}
            </Avatar>
            <span style={{ fontWeight: 'bold' }}>{option.department}</span> / {option.firstname} {option.lastname}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          {...commonTextFieldProps}
          placeholder={selected.length === 0 ? "Select Assignee" : ""}
          variant="outlined"
        />
      )}
    />
  );
}


