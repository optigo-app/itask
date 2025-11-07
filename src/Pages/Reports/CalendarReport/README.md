# Calendar Report

A read-only calendar view that displays employee schedules grouped by department.

## Features

- **Employee List with Department Accordion**: Left sidebar showing all employees organized by department
- **Read-Only Calendar**: Right side displays the selected employee's calendar events
- **No Editing**: Calendar is fully read-only - no event add, update, or delete operations
- **Department Grouping**: Employees are automatically grouped by their department
- **Visual Feedback**: Selected employee is highlighted in the list

## Route

Access the calendar report at: `/reports/calendar-report`

## Components

### CalendarReport.jsx
Main component that orchestrates the employee list and calendar display.

### EmployeeList.jsx
Displays employees grouped by department in an accordion layout. Click on any employee card to load their calendar.

### ReadOnlyCalendar.jsx
Displays FullCalendar in read-only mode with all interaction disabled (no event clicks, no date clicks, no drag/drop).

## Usage

1. Navigate to `/reports/calendar-report`
2. Select a department from the accordion on the left
3. Click on an employee card to view their calendar
4. The calendar will load and display all events for that employee
5. Navigate through dates using the calendar navigation buttons

## Styling

The component uses the same styling as the main calendar page with additional custom styles for the employee list cards and accordions.
