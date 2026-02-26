/**
 * Shared utility functions for task estimation calculations
 * Used by Sidedrawer and Calendar components
 */

/**
 * Find a task by ID in the flat task list
 */
export const findTaskById = (actualTaskDataValue, targetId) => {
    if (!targetId || !actualTaskDataValue) return null;
    const target = String(targetId);
    return actualTaskDataValue.find(task => String(task?.taskid ?? '') === target) || null;
};

/**
 * Find the path from a task to the root (all ancestors)
 */
export const findPathById = (actualTaskDataValue, targetId) => {
    if (!targetId || !actualTaskDataValue) return [];

    const path = [];
    let currentId = String(targetId);

    while (currentId && currentId !== '0') {
        const task = actualTaskDataValue.find(t => String(t.taskid) === String(currentId));
        if (!task) break;
        path.push(task);
        currentId = String(task.parentid ?? '0');
        if (currentId === '0') break;
    }

    return path;
};

/**
 * Get hours from a task node
 */
export const getNodeHours = (node) => {
    return {
        estimate_hrs: Number(node?.estimate_hrs ?? 0),
        estimate1_hrs: Number(node?.estimate1_hrs ?? 0),
        estimate2_hrs: Number(node?.estimate2_hrs ?? 0),
        workinghr: Number(node?.workinghr ?? 0),
    };
};

/**
 * Sum all direct children's hours for a given parent
 */
export const sumDirectChildrenHours = (actualTaskDataValue, parentTaskId, overridesById, extraChildForNew) => {
    const children = actualTaskDataValue.filter(t => String(t.parentid) === String(parentTaskId));
    const withExtra = extraChildForNew ? [...children, extraChildForNew] : children;
    return withExtra.reduce(
        (acc, child) => {
            const id = String(child?.taskid ?? '');
            const hours = overridesById?.[id] || getNodeHours(child);
            acc.estimate_hrs += Number(hours?.estimate_hrs ?? 0);
            acc.estimate1_hrs += Number(hours?.estimate1_hrs ?? 0);
            acc.estimate2_hrs += Number(hours?.estimate2_hrs ?? 0);
            acc.workinghr += Number(hours?.workinghr ?? 0);
            return acc;
        },
        { estimate_hrs: 0, estimate1_hrs: 0, estimate2_hrs: 0, workinghr: 0 }
    );
};

/**
 * Build the splitestimate string for updating parent task estimates
 * @param {Array} actualTaskDataValue - The flat list of all tasks
 * @param {Object} params - Parameters for the calculation
 * @param {string|number} params.parentTaskId - The parent task ID to update
 * @param {string|number} params.childTaskId - The child task ID being updated (empty if new)
 * @param {Object} params.childValues - The new values for the child task
 * @param {boolean} params.isNewChild - Whether this is a new child being added
 * @returns {string} The splitestimate string for EstimateCalApi
 */
export const buildAncestorSumSplitestimate = (actualTaskDataValue, { parentTaskId, childTaskId, childValues, isNewChild, isDelete }) => {
    if (!parentTaskId || String(parentTaskId) === '0') return '';

    const overridesById = {};
    const targetChildId = childTaskId ? String(childTaskId) : '';
    if (targetChildId) {
        overridesById[targetChildId] = isDelete
            ? { estimate_hrs: 0, estimate1_hrs: 0, estimate2_hrs: 0, workinghr: 0 }
            : {
                estimate_hrs: Number(childValues?.estimate_hrs ?? 0),
                estimate1_hrs: Number(childValues?.estimate1_hrs ?? 0),
                estimate2_hrs: Number(childValues?.estimate2_hrs ?? 0),
                workinghr: Number(childValues?.workinghr ?? 0),
            };
    }

    const parentPath = findPathById(actualTaskDataValue, parentTaskId);
    if (!parentPath?.length) return '';

    const extraNewChild = isNewChild
        ? {
            taskid: '__new__',
            estimate_hrs: Number(childValues?.estimate_hrs ?? 0),
            estimate1_hrs: Number(childValues?.estimate1_hrs ?? 0),
            estimate2_hrs: Number(childValues?.estimate2_hrs ?? 0),
            workinghr: Number(childValues?.workinghr ?? 0),
        }
        : null;

    for (let i = 0; i < parentPath.length; i++) {
        const node = parentPath[i];
        const summed = sumDirectChildrenHours(
            actualTaskDataValue,
            node.taskid,
            overridesById,
            i === 0 ? extraNewChild : null
        );
        overridesById[String(node?.taskid ?? '')] = summed;
    }

    const entries = [];
    // Only include child in update string if it's not being deleted
    if (targetChildId && !isDelete) {
        const childHrs = overridesById[targetChildId];
        const est = Number(childHrs?.estimate_hrs ?? 0) || 0;
        const est1 = Number(childHrs?.estimate1_hrs ?? 0) || 0;
        const est2 = Number(childHrs?.estimate2_hrs ?? 0) || 0;
        const work = Number(childHrs?.workinghr ?? 0) || 0;
        entries.push(`${targetChildId}#${est}#${est1}#${est2}#${work}`);
    }

    for (let i = parentPath.length - 1; i >= 0; i--) {
        const nodeId = String(parentPath[i]?.taskid ?? '');
        const hrs = overridesById[nodeId];
        if (!nodeId) continue;
        const est = Number(hrs?.estimate_hrs ?? 0) || 0;
        const est1 = Number(hrs?.estimate1_hrs ?? 0) || 0;
        const est2 = Number(hrs?.estimate2_hrs ?? 0) || 0;
        const work = Number(hrs?.workinghr ?? 0) || 0;
        entries.push(`${nodeId}#${est}#${est1}#${est2}#${work}`);
    }

    return entries.join(',');
};
