import dayjs from 'dayjs';
import { calculateProgress } from './reusable';

// Maps the pmsreport SP output to the grid-row shape both PMS report pages render.
// res.rd  = employee-wise rows, res.rd1 = module-wise rows, res.rd2 = category counts.
export const mapPmsReportData = (res, viewMode) => {
    const empRows = res?.rd ?? [];
    const modRows = res?.rd1 ?? [];
    const catRows = res?.rd2 ?? [];

    const catsFor = (type, id) =>
        catRows
            .filter((c) => c.grouptype === type && c.groupid === id)
            .map((c) => ({ categoryname: c.categoryname, count: c.count }));

    const decorate = (row) => {
        const progress = calculateProgress(row.Completed || 0, row.TotalTasks || 0);
        const totalEstimate = row.TotalEstimate || 0;
        const totalActual = row.TotalActual || 0;
        const performance =
            totalEstimate > 0 && totalActual > 0
                ? Math.round((totalActual / totalEstimate) * 100)
                : 0;
        return {
            ...row,
            Progress: `${progress}%`,
            TotalDiff: totalActual - totalEstimate,
            Performance: `${performance}%`,
            Tasks: [],
        };
    };

    if (viewMode === 'ModuleWiseData') {
        return modRows.map((m) => decorate({ ...m, CategorySummary: catsFor('mod', m.moduleid) }));
    }
    return empRows.map((e) => decorate({ ...e, CategorySummary: catsFor('emp', e.id) }));
};

// Converts the page's time filter + currentDate into SP date params (YYYY-MM-DD).
// 'All' sends empty bounds (no date filter in SQL).
export const getPmsDateWindow = (filters, currentDate) => {
    const empty = { startdatefrom: '', startdateto: '' };
    if (!filters || filters.timeFilter === 'All') return empty;

    const fmt = (d) => dayjs(d).format('YYYY-MM-DD');
    const base = dayjs(currentDate);

    switch (filters.timeFilter) {
        case 'Today':
            return { startdatefrom: fmt(base), startdateto: fmt(base) };
        case 'Tomorrow': {
            const t = base.add(1, 'day');
            return { startdatefrom: fmt(t), startdateto: fmt(t) };
        }
        case 'Week': {
            // Monday..Sunday, same bounds as updateDatePickerBasedOnFilter
            const start = base.startOf('week').add(1, 'day');
            const end = base.endOf('week').add(1, 'day');
            return { startdatefrom: fmt(start), startdateto: fmt(end) };
        }
        case 'Date-Range': {
            const { startDate, endDate } = filters.dateRangeFilter || {};
            return startDate && endDate
                ? { startdatefrom: fmt(startDate), startdateto: fmt(endDate) }
                : empty;
        }
        default:
            return empty;
    }
};

// Maps pmsreportdetail rows into the task shape TaskDetailsModal/pms2TaskTable expect.
export const mapPmsDetailTasks = (rows) => {
    const assigneeData = JSON.parse(sessionStorage.getItem('taskAssigneeData') || '[]');
    const byId = new Map((assigneeData || []).map((u) => [Number(u.id), u]));

    const list = (rows || []).map((t) => {
        const ids = String(t.assigneids || '')
            .split(',')
            .map((v) => Number(v))
            .filter(Boolean);
        const assignee = ids.map((id) => byId.get(id)).filter(Boolean);
        const childcnt = t.childcnt || 0;
        return {
            ...t,
            assignee,
            hasChildren: childcnt > 0,
            children: [],
            subtasks: [],
            type: Number(t.parentid) === 0 ? 'module' : childcnt > 0 ? 'major' : 'minor',
        };
    });

    // nest direct children so the tree view can expand them (flat list unchanged)
    const byTaskId = new Map(list.map((t) => [t.taskid, t]));
    list.forEach((t) => {
        const parent = byTaskId.get(Number(t.parentid));
        if (parent && parent !== t) {
            parent.children.push(t);
            parent.subtasks.push(t);
        }
    });

    return list;
};
