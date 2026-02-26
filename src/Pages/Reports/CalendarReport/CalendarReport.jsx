import React, { useState, useEffect, useRef } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import '../../Calendar/Calendar.scss';
import './CalendarReport.scss';
import { fetchMettingListByLoginApi } from '../../../Api/MeetingApi/MeetingListApi';
import { toast } from 'react-toastify';
import EmployeeDrawer from '../../../Components/Reports/CalendarReport/EmployeeDrawer';
import EmployeeList from '../../../Components/Reports/CalendarReport/EmployeeList';
import ReadOnlyCalendar from '../../../Components/Reports/CalendarReport/ReadOnlyCalendar';

const CalendarReport = () => {
    const isLaptop = useMediaQuery('(max-width:1420px)');
    const isLaptop1 = useMediaQuery('(max-width:1600px) and (min-width:1421px)');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [calendarsColor, setCalendarsColor] = useState({});
    const [openSideDrawer, setSideDrawer] = useState(false);
    const [dailyReportRows, setDailyReportRows] = useState([]);
    const lastRequestIdRef = useRef(0);

    useEffect(() => {
        const taskCategories = JSON?.parse(sessionStorage.getItem('taskworkcategoryData')) || [];
        const colorClasses = [
            'productive',
            'rnd-tech',
            'creative',
            'sop-correction',
            'leave',
            'maintenance',
            'unplanned',
        ];
        const dynamicCalendarsColor = taskCategories.reduce(
            (acc, category, index) => {
                const categoryName = category.labelname;
                acc[categoryName] = colorClasses[index % colorClasses.length];
                return acc;
            },
            {}
        );
        setCalendarsColor(dynamicCalendarsColor);
    }, []);

    const handleEmployeeClick = async (employee) => {
        const requestId = Date.now();
        lastRequestIdRef.current = requestId;
        setSelectedEmployee(employee);
        setIsLoading(true);
        try {
            const meetingApiRes = await fetchMettingListByLoginApi(employee);
            if (lastRequestIdRef.current !== requestId) return;
            const data = (meetingApiRes && meetingApiRes?.rd) || [];
            if (data) {
                const taskAssigneeData = JSON.parse(
                    sessionStorage.getItem('taskAssigneeData') || '[]'
                );
                const taskCategory = JSON.parse(
                    sessionStorage.getItem('taskworkcategoryData') || '[]'
                );
                const statusData = JSON.parse(
                    sessionStorage.getItem('taskstatusData') || '[]'
                );
                const priorityData = JSON.parse(
                    sessionStorage.getItem('taskpriorityData') || '[]'
                );
                const enhancedMeetings = data.map((meeting) => ({
                    ...meeting,
                    guests:
                        taskAssigneeData.filter((user) =>
                            meeting?.assigneids?.split(',').map(Number).includes(user.id)
                        ) || [],
                    prModule: [],
                    category:
                        taskCategory?.find((item) => item?.id == meeting?.workcategoryid)
                            ?.labelname || '',
                    status:
                        statusData?.find((item) => item?.id == meeting?.statusid)?.labelname ||
                        meeting?.status ||
                        '',
                    priority:
                        priorityData?.find((item) => item?.id == meeting?.priorityid)?.labelname ||
                        meeting?.priority ||
                        '',
                    prModule: {
                        projectid: meeting?.projectid,
                        taskid: meeting?.taskid,
                    },
                }));
                setCalendarEvents(enhancedMeetings);
            } else {
                setCalendarEvents([]);
            }
        } catch (error) {
            console.error('Error fetching meeting list:', error);
            toast.error('Failed to fetch calendar data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            className="calendarMain"
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                position: 'relative',
                backgroundColor: '#ffffff',
            }}
        >
            {isLaptop ? (
                <EmployeeDrawer
                    openSideDrawer={openSideDrawer}
                    setSideDrawer={setSideDrawer}
                    selectedEmployee={selectedEmployee}
                    onEmployeeClick={handleEmployeeClick}
                    dailyReportRows={dailyReportRows}
                />
            ) : (
                <Box
                    sx={{
                        width: isLaptop1 ? '29%' : '20%',
                        height: '100vh',
                        padding: '0px',
                        borderRight: '1px solid #e0e0e0',
                        zIndex: 1,
                        position: 'relative',
                    }}
                >
                    <EmployeeList
                        selectedEmployee={selectedEmployee}
                        onEmployeeClick={handleEmployeeClick}
                        dailyReportRows={dailyReportRows}
                    />
                </Box>
            )}

            <Box
                className="calendarRightMain"
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    bgcolor: '#ffffff',
                    padding: '0px 5px',
                    position: 'relative',
                    zIndex: 0,
                }}
            >
                <ReadOnlyCalendar
                    calendarEvents={calendarEvents}
                    calendarsColor={calendarsColor}
                    isLoading={isLoading}
                    selectedEmployee={selectedEmployee}
                    setSideDrawer={setSideDrawer}
                    onDailyReportRowsChange={setDailyReportRows}
                />
            </Box>
        </Box>
    );
};

export default CalendarReport;
