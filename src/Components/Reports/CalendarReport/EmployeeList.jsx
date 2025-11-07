import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    TextField,
    InputAdornment,
} from '@mui/material';
import { ChevronDown, Users, Search } from 'lucide-react';
import { background, ImageUrl } from '../../../Utils/globalfun';

const EmployeeList = ({ selectedEmployee, onEmployeeClick }) => {
    const [employeeData, setEmployeeData] = useState([]);
    const [expandedDepartments, setExpandedDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const assigneeData = JSON?.parse(sessionStorage?.getItem('taskAssigneeData')) || [];
        setEmployeeData(assigneeData);
    }, []);

    // Filter employees based on search term
    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employeeData;
        const lowerSearch = searchTerm.toLowerCase();
        return employeeData.filter((employee) => {
            const fullName = `${employee.firstname} ${employee.lastname}`.toLowerCase();
            const dept = (employee.department || '').toLowerCase();
            const email = (employee.username || employee.email || '').toLowerCase();
            return fullName.includes(lowerSearch) || dept.includes(lowerSearch) || email.includes(lowerSearch);
        });
    }, [employeeData, searchTerm]);

    // Group employees by department
    const groupedEmployees = useMemo(() => {
        const grouped = {};
        filteredEmployees.forEach((employee) => {
            const dept = employee.department || 'No Department';
            if (!grouped[dept]) {
                grouped[dept] = [];
            }
            grouped[dept].push(employee);
        });
        
        // Sort departments alphabetically
        const sortedGrouped = {};
        Object.keys(grouped)
            .sort((a, b) => {
                // Put "No Department" at the end
                if (a === 'No Department') return 1;
                if (b === 'No Department') return -1;
                return a.localeCompare(b);
            })
            .forEach((dept) => {
                sortedGrouped[dept] = grouped[dept];
            });
        
        return sortedGrouped;
    }, [filteredEmployees]);

    const handleAccordionChange = (department) => (event, isExpanded) => {
        setExpandedDepartments((prev) =>
            isExpanded
                ? [department] // Only keep the current department open
                : prev.filter((dept) => dept !== department)
        );
    };

    const getEmployeeAvatar = (employee) => {
        return (
            <Avatar
                alt={`${employee?.firstname} ${employee?.lastname}`}
                src={ImageUrl(employee) || null}
                sx={{
                    width: 40,
                    height: 40,
                    fontSize: '16px',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'transform 0.3s ease-in-out',
                    backgroundColor: background(`${employee?.firstname + " " + employee?.lastname}`),
                    '&:hover': {
                        transform: 'scale(1.2)',
                        zIndex: 10,
                    },
                }}
            >
                {!employee.avatar && employee?.firstname?.charAt(0)}
            </Avatar>
        );
    };

    if (employeeData.length === 0) {
        return (
            <Box className="employeeListMain">
                <Box className="employeeListHeader stickyHeader">
                    <Typography variant="h5">Employees</Typography>
                </Box>
                <Box className="emptyState">
                    <Users className="emptyIcon" size={48} />
                    <Typography className="emptyText">
                        No employees found
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="employeeListMain">
            <Box className="employeeListHeader stickyHeader">
                <Typography variant="h5">Employees</Typography>
                <Typography variant="body2" sx={{ color: '#7d7f85', mt: 0.5, mb: 2 }}>
                    Select an employee to view their calendar
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} style={{ color: '#7d7f85' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#7367f0',
                                },
                            },
                        },
                    }}
                />
            </Box>

            <Box className="employeeListContent">
                {Object.keys(groupedEmployees)?.length === 0 ? (
                    <Box className="emptyState">
                        <Users className="emptyIcon" size={48} />
                        <Typography className="emptyText">
                            No employees found matching "{searchTerm}"
                        </Typography>
                    </Box>
                ) : (
                    Object.entries(groupedEmployees)?.map(([department, employees]) => (
                        <Accordion
                            key={department}
                            className="departmentAccordion"
                            expanded={expandedDepartments.includes(department)}
                            onChange={handleAccordionChange(department)}
                        >
                            <AccordionSummary
                                expandIcon={<ChevronDown size={20} />}
                                aria-controls={`${department}-content`}
                                id={`${department}-header`}
                            >
                                <Box className="departmentHeader">
                                    <Users className="departmentIcon" size={18} />
                                    <Typography className="departmentName">
                                        {department}
                                    </Typography>
                                    <Typography className="employeeCount">
                                        ({employees.length})
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {employees?.map((employee) => (
                                    <Box
                                        key={employee.id}
                                        className={`employeeCard ${selectedEmployee?.id === employee.id ? 'selected' : ''
                                            }`}
                                        onClick={() => onEmployeeClick(employee)}
                                    >
                                        {getEmployeeAvatar(employee)}
                                        <Box className="employeeInfo">
                                            <Typography className="employeeName">
                                                {employee.firstname} {employee.lastname}
                                            </Typography>
                                            <Typography className="employeeEmail">
                                                {employee.username || employee.userid || 'No email'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default EmployeeList;
