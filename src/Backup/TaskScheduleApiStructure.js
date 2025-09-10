/**
 * API JSON Structure for Task Schedule Comparison
 * This file demonstrates the recommended API structure for managing
 * original vs current task schedules and detecting differences
 */

// ============================================================================
// 1. GET ORIGINAL SCHEDULE API
// ============================================================================
// Endpoint: GET /api/tasks/schedule/original?weekStart=2024-01-08
const originalScheduleApiResponse = {
    "success": true,
    "data": {
        "weekInfo": {
            "weekStart": "2024-01-08T00:00:00Z",
            "weekEnd": "2024-01-14T23:59:59Z",
            "weekNumber": 2,
            "year": 2024
        },
        "originalSchedule": {
            "createdAt": "2024-01-08T09:00:00Z", // When original schedule was set
            "totalPlannedHours": 32,
            "totalTasks": 4,
            "tasks": [
                {
                    "taskId": "TSK-001",
                    "title": "Database Migration",
                    "description": "Migrate user data to new schema",
                    "originalStartDate": "2024-01-08T10:00:00Z",
                    "originalEndDate": "2024-01-08T14:00:00Z",
                    "estimatedHours": 4,
                    "priority": "High",
                    "category": "Development",
                    "assigneeId": "USR-123",
                    "assigneeName": "John Doe",
                    "projectId": "PRJ-001",
                    "projectName": "User Management System",
                    "status": "planned",
                    "dependencies": ["TSK-000"], // Tasks this depends on
                    "tags": ["backend", "database"]
                },
                {
                    "taskId": "TSK-002",
                    "title": "API Testing",
                    "description": "Test all user management APIs",
                    "originalStartDate": "2024-01-09T09:00:00Z",
                    "originalEndDate": "2024-01-09T12:00:00Z",
                    "estimatedHours": 3,
                    "priority": "Medium",
                    "category": "Testing",
                    "assigneeId": "USR-124",
                    "assigneeName": "Jane Smith",
                    "projectId": "PRJ-001",
                    "projectName": "User Management System",
                    "status": "planned",
                    "dependencies": ["TSK-001"],
                    "tags": ["api", "testing"]
                }
            ]
        }
    },
    "timestamp": "2024-01-10T10:30:00Z"
};

// ============================================================================
// 2. GET CURRENT SCHEDULE API
// ============================================================================
// Endpoint: GET /api/tasks/schedule/current?weekStart=2024-01-08
const currentScheduleApiResponse = {
    "success": true,
    "data": {
        "weekInfo": {
            "weekStart": "2024-01-08T00:00:00Z",
            "weekEnd": "2024-01-14T23:59:59Z",
            "weekNumber": 2,
            "year": 2024
        },
        "currentSchedule": {
            "lastUpdated": "2024-01-10T14:30:00Z",
            "totalCurrentHours": 38, // Changed from original 32
            "totalTasks": 4, // Same count but different tasks
            "tasks": [
                {
                    "taskId": "TSK-001",
                    "title": "Database Migration",
                    "description": "Migrate user data to new schema",
                    "currentStartDate": "2024-01-10T10:00:00Z", // Rescheduled
                    "currentEndDate": "2024-01-10T14:00:00Z",
                    "estimatedHours": 4,
                    "priority": "High",
                    "category": "Development",
                    "assigneeId": "USR-123",
                    "assigneeName": "John Doe",
                    "projectId": "PRJ-001",
                    "projectName": "User Management System",
                    "status": "rescheduled",
                    "changeReason": "Dependencies not ready on original date",
                    "changeTimestamp": "2024-01-09T16:00:00Z",
                    "changedBy": "USR-125",
                    "originalStartDate": "2024-01-08T10:00:00Z", // Keep original for comparison
                    "originalEndDate": "2024-01-08T14:00:00Z"
                },
                {
                    "taskId": "TSK-002",
                    "title": "API Testing",
                    "description": "Test all user management APIs",
                    "currentStartDate": "2024-01-09T09:00:00Z", // Same as original
                    "currentEndDate": "2024-01-09T12:00:00Z",
                    "estimatedHours": 3,
                    "priority": "Medium",
                    "category": "Testing",
                    "assigneeId": "USR-124",
                    "assigneeName": "Jane Smith",
                    "projectId": "PRJ-001",
                    "projectName": "User Management System",
                    "status": "on_schedule",
                    "originalStartDate": "2024-01-09T09:00:00Z",
                    "originalEndDate": "2024-01-09T12:00:00Z"
                },
                {
                    "taskId": "TSK-005", // New task added
                    "title": "Bug Fixes Sprint",
                    "description": "Fix critical production bugs",
                    "currentStartDate": "2024-01-08T09:00:00Z",
                    "currentEndDate": "2024-01-08T15:00:00Z",
                    "estimatedHours": 6,
                    "priority": "Critical",
                    "category": "Development",
                    "assigneeId": "USR-123",
                    "assigneeName": "John Doe",
                    "projectId": "PRJ-002",
                    "projectName": "Production Support",
                    "status": "new_task",
                    "changeReason": "Critical production issues reported",
                    "changeTimestamp": "2024-01-08T08:00:00Z",
                    "changedBy": "USR-126",
                    "originalStartDate": null, // No original - it's new
                    "originalEndDate": null
                }
            ],
            "postponedTasks": [
                {
                    "taskId": "TSK-003",
                    "title": "Code Documentation",
                    "description": "Document new API endpoints",
                    "originalStartDate": "2024-01-11T14:00:00Z",
                    "originalEndDate": "2024-01-11T16:00:00Z",
                    "estimatedHours": 2,
                    "priority": "Low",
                    "category": "Documentation",
                    "assigneeId": "USR-124",
                    "assigneeName": "Jane Smith",
                    "status": "postponed",
                    "changeReason": "Higher priority tasks added",
                    "changeTimestamp": "2024-01-09T10:00:00Z",
                    "changedBy": "USR-125",
                    "postponedTo": "2024-01-15T14:00:00Z" // Next week
                }
            ]
        }
    },
    "timestamp": "2024-01-10T10:30:00Z"
};

// ============================================================================
// 3. GET SCHEDULE COMPARISON API (WITH DIFF)
// ============================================================================
// Endpoint: GET /api/tasks/schedule/comparison?weekStart=2024-01-08
const scheduleComparisonApiResponse = {
    "success": true,
    "data": {
        "weekInfo": {
            "weekStart": "2024-01-08T00:00:00Z",
            "weekEnd": "2024-01-14T23:59:59Z",
            "weekNumber": 2,
            "year": 2024
        },
        "comparisonSummary": {
            "originalTotalHours": 32,
            "currentTotalHours": 38,
            "hoursDifference": 6,
            "percentageChange": 18.75,
            "originalTaskCount": 4,
            "currentTaskCount": 4,
            "totalChanges": 3,
            "changeBreakdown": {
                "onSchedule": 1,
                "rescheduled": 1,
                "newTasks": 1,
                "postponed": 1,
                "completed": 0,
                "cancelled": 0
            }
        },
        "taskChanges": [
            {
                "changeType": "rescheduled",
                "taskId": "TSK-001",
                "title": "Database Migration",
                "changes": {
                    "startDate": {
                        "original": "2024-01-08T10:00:00Z",
                        "current": "2024-01-10T10:00:00Z",
                        "daysDifference": 2
                    },
                    "endDate": {
                        "original": "2024-01-08T14:00:00Z",
                        "current": "2024-01-10T14:00:00Z",
                        "daysDifference": 2
                    }
                },
                "changeReason": "Dependencies not ready on original date",
                "changeTimestamp": "2024-01-09T16:00:00Z",
                "changedBy": "USR-125",
                "impact": "medium" // low, medium, high
            },
            {
                "changeType": "new_task",
                "taskId": "TSK-005",
                "title": "Bug Fixes Sprint",
                "addedDate": "2024-01-08T08:00:00Z",
                "estimatedHours": 6,
                "priority": "Critical",
                "changeReason": "Critical production issues reported",
                "changedBy": "USR-126",
                "impact": "high"
            },
            {
                "changeType": "postponed",
                "taskId": "TSK-003",
                "title": "Code Documentation",
                "originalDate": "2024-01-11T14:00:00Z",
                "postponedTo": "2024-01-15T14:00:00Z",
                "changeReason": "Higher priority tasks added",
                "changeTimestamp": "2024-01-09T10:00:00Z",
                "changedBy": "USR-125",
                "impact": "low"
            },
            {
                "changeType": "on_schedule",
                "taskId": "TSK-002",
                "title": "API Testing",
                "status": "No changes from original schedule"
            }
        ],
        "recommendations": [
            {
                "type": "workload_warning",
                "message": "Workload increased by 18.75% from original plan",
                "severity": "medium"
            },
            {
                "type": "dependency_check",
                "message": "Check if TSK-002 can still proceed after TSK-001 reschedule",
                "severity": "high"
            }
        ]
    },
    "timestamp": "2024-01-10T10:30:00Z"
};

// ============================================================================
// 4. POST UPDATE SCHEDULE API
// ============================================================================
// Endpoint: POST /api/tasks/schedule/update
const updateScheduleApiRequest = {
    "taskId": "TSK-001",
    "updateType": "reschedule", // reschedule, add_new, postpone, cancel, complete
    "changes": {
        "newStartDate": "2024-01-10T10:00:00Z",
        "newEndDate": "2024-01-10T14:00:00Z",
        "reason": "Dependencies not ready on original date",
        "updatedBy": "USR-125"
    },
    "notifyStakeholders": true,
    "updateDependentTasks": true
};

const updateScheduleApiResponse = {
    "success": true,
    "data": {
        "taskId": "TSK-001",
        "updateApplied": true,
        "affectedTasks": [
            {
                "taskId": "TSK-002",
                "impact": "dependency_delay",
                "recommendation": "Consider rescheduling dependent task"
            }
        ],
        "notificationsSent": [
            "USR-123", // Assignee
            "USR-124", // Dependent task assignee
            "USR-125"  // Project manager
        ]
    },
    "timestamp": "2024-01-09T16:00:00Z"
};

// ============================================================================
// 5. DIFF ALGORITHM IMPLEMENTATION
// ============================================================================
const scheduleComparisonAlgorithm = {
    /**
     * Compare original and current schedules to detect changes
     */
    compareSchedules: function(originalTasks, currentTasks, postponedTasks = []) {
        const changes = [];
        const originalTaskMap = new Map(originalTasks.map(task => [task.taskId, task]));
        const currentTaskMap = new Map(currentTasks.map(task => [task.taskId, task]));
        
        // Check for rescheduled and on-schedule tasks
        currentTasks.forEach(currentTask => {
            const originalTask = originalTaskMap.get(currentTask.taskId);
            
            if (originalTask) {
                if (this.isTaskRescheduled(originalTask, currentTask)) {
                    changes.push({
                        type: 'rescheduled',
                        taskId: currentTask.taskId,
                        title: currentTask.title,
                        original: originalTask,
                        current: currentTask,
                        changes: this.getTaskChanges(originalTask, currentTask)
                    });
                } else {
                    changes.push({
                        type: 'on_schedule',
                        taskId: currentTask.taskId,
                        title: currentTask.title
                    });
                }
            } else {
                // New task
                changes.push({
                    type: 'new_task',
                    taskId: currentTask.taskId,
                    title: currentTask.title,
                    task: currentTask
                });
            }
        });
        
        // Check for postponed tasks
        postponedTasks.forEach(postponedTask => {
            changes.push({
                type: 'postponed',
                taskId: postponedTask.taskId,
                title: postponedTask.title,
                original: originalTaskMap.get(postponedTask.taskId),
                postponed: postponedTask
            });
        });
        
        // Check for removed/cancelled tasks
        originalTasks.forEach(originalTask => {
            if (!currentTaskMap.has(originalTask.taskId) && 
                !postponedTasks.find(p => p.taskId === originalTask.taskId)) {
                changes.push({
                    type: 'cancelled',
                    taskId: originalTask.taskId,
                    title: originalTask.title,
                    original: originalTask
                });
            }
        });
        
        return changes;
    },
    
    isTaskRescheduled: function(original, current) {
        return original.originalStartDate !== current.currentStartDate ||
               original.originalEndDate !== current.currentEndDate ||
               original.estimatedHours !== current.estimatedHours;
    },
    
    getTaskChanges: function(original, current) {
        const changes = {};
        
        if (original.originalStartDate !== current.currentStartDate) {
            changes.startDate = {
                original: original.originalStartDate,
                current: current.currentStartDate,
                daysDifference: this.calculateDayDifference(
                    original.originalStartDate, 
                    current.currentStartDate
                )
            };
        }
        
        if (original.originalEndDate !== current.currentEndDate) {
            changes.endDate = {
                original: original.originalEndDate,
                current: current.currentEndDate,
                daysDifference: this.calculateDayDifference(
                    original.originalEndDate, 
                    current.currentEndDate
                )
            };
        }
        
        if (original.estimatedHours !== current.estimatedHours) {
            changes.estimatedHours = {
                original: original.estimatedHours,
                current: current.estimatedHours,
                difference: current.estimatedHours - original.estimatedHours
            };
        }
        
        return changes;
    },
    
    calculateDayDifference: function(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

// ============================================================================
// 6. FRONTEND INTEGRATION EXAMPLE
// ============================================================================
const frontendIntegrationExample = {
    // Fetch and compare schedules
    fetchScheduleComparison: async function(weekStart) {
        try {
            const response = await fetch(`/api/tasks/schedule/comparison?weekStart=${weekStart}`);
            const data = await response.json();
            
            if (data.success) {
                return {
                    summary: data.data.comparisonSummary,
                    changes: data.data.taskChanges,
                    recommendations: data.data.recommendations
                };
            }
        } catch (error) {
            console.error('Failed to fetch schedule comparison:', error);
            return null;
        }
    },
    
    // Update task schedule
    updateTaskSchedule: async function(taskId, updateData) {
        try {
            const response = await fetch('/api/tasks/schedule/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskId,
                    ...updateData
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Failed to update task schedule:', error);
            return null;
        }
    }
};

export {
    originalScheduleApiResponse,
    currentScheduleApiResponse,
    scheduleComparisonApiResponse,
    updateScheduleApiRequest,
    updateScheduleApiResponse,
    scheduleComparisonAlgorithm,
    frontendIntegrationExample
};
