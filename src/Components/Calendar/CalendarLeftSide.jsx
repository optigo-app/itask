import React from 'react';
import TasklistForCal from './TasklistForCal';

const CalendarLeftSide = ({ calendarsColor, onTasklistDateRangeChange, onTasklistAssigneeChange }) => {
    return (
        <div className="calendarLeftMain">
            <TasklistForCal
                calendarsColor={calendarsColor}
                onDateRangeChange={onTasklistDateRangeChange}
                onAssigneeChange={onTasklistAssigneeChange}
            />
        </div >
    );
};

export default CalendarLeftSide;
