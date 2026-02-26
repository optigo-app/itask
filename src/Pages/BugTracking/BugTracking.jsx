import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Upload, X, Bug, Image as ImageIcon, Search, Filter, ChevronLeft, ChevronRight, List, LayoutGrid } from 'lucide-react';
import useFullTaskFormatFile from '../../Utils/TaskList/FullTasKFromatfile';
import { isValidTaskNo, flattenTasks, priorityColors, statusColors, getAuthData } from '../../Utils/globalfun';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import StatusBadge from '../../Components/ShortcutsComponent/StatusBadge';
import PriorityBadge from '../../Components/ShortcutsComponent/PriorityBadge';
import AssigneeAvatarGroup from '../../Components/ShortcutsComponent/Assignee/AssigneeAvatarGroup';
import DepartmentAssigneeAutocomplete from '../../Components/ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import CustomAutocomplete from '../../Components/ShortcutsComponent/CustomAutocomplete';
import { commonTextFieldProps } from '../../Utils/globalfun';
import './BugTracking.scss';
import BugTrackingFiltersPopover from './BugTrackingFiltersPopover';
import BugGallery from './BugGallery';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from 'dayjs/plugin/timezone';
import CustomDateTimePicker from '../../Utils/DateComponent/CustomDateTimePicker';
import BugTrackingTasks from './BugTrackingTasks';
import BugTrackingCenter from './BugTrackingCenter';
import BugTrackingForm from './BugTrackingForm';

const BugTracking = () => {
    const {
        taskFinalData,
        priorityData,
        taskCategory,
        statusData,
        iswhTLoading,
        taskAssigneeData,
        taskBugStatusData,
        taskBugPriorityData
    } = useFullTaskFormatFile();

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [listFilters, setListFilters] = useState({
        status: '',
        priority: '',
        category: ''
    });
    const [bugFilters, setBugFilters] = useState({
        status: '',
        assignee: '',
        priority: '',
        testby: '',
        createddate: '',
        reassigned: ''
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFormOpen, setFormOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [bugList, setBugList] = useState([]);
    const [selectedBugId, setSelectedBugId] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'gallery'
    const [tempBug, setTempBug] = useState(null);

    // Filter handlers
    const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
    const handleFilterClose = () => setAnchorEl(null);
    const handleListFilterChange = (e) => {
        const { name, value } = e.target;
        setListFilters((prev) => ({ ...prev, [name]: value }));
    };
    const handleClearListFilters = () => setListFilters({ status: '', priority: '', category: '' });

    // Form State
    const [formData, setFormData] = useState({
        bugtitle: '',
        Taskno: '',
        busstatusid: '',
        busstatusName: '',
        bugpriorityid: '',
        bugpriorityName: '',
        solvedby: [], // array of assignee objects
        description: '',
        imagePreview: null,
        testby: null, // single assignee object
        testbyName: '',
        createddate: ''
    });

    // --- Mock API / Session Storage Logic ---

    const getBugsStorageKey = (taskId) => `bugTracking:bugs:${taskId}`;

    const loadBugsFromSession = (taskId) => {
        if (!taskId) return [];
        try {
            const raw = sessionStorage.getItem(getBugsStorageKey(taskId));
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error('Failed to load bugs from sessionStorage', err);
            return [];
        }
    };

    const saveBugsToSession = (taskId, bugs) => {
        if (!taskId) return;
        try {
            sessionStorage.setItem(getBugsStorageKey(taskId), JSON.stringify(bugs));
        } catch (err) {
            console.error('Failed to save bugs to sessionStorage', err);
        }
    };

    const getNewBugId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const applyBugToForm = (task, bug) => {
        let solvedByArray = [];
        if (bug?.solvedby) {
            const solvedByIds = String(bug.solvedby).split(',').map(id => Number(id)).filter(id => !isNaN(id));
            solvedByArray = taskAssigneeData?.filter(u => solvedByIds.includes(u.id)) || [];
        }

        const testbyUser = taskAssigneeData?.find(u => String(u.id) === String(bug?.testby)) || null;

        const selectedStatusId = bug?.busstatusid ?? task.statusid;
        const selectedPriorityId = bug?.bugpriorityid ?? task.priorityid;

        const statusObj = taskBugStatusData?.find(s => String(s.id) === String(selectedStatusId)) || null;
        const priorityObj = taskBugPriorityData?.find(p => String(p.id) === String(selectedPriorityId)) || null;

        setFormData({
            Taskno: task.taskno,
            bugtitle: bug?.bugtitle ?? '',
            bugpriorityid: priorityObj?.id ?? (bug?.bugpriorityid ?? task.priorityid ?? ''),
            bugpriorityName: priorityObj?.labelname || bug?.bugpriorityName || '',
            busstatusid: statusObj?.id ?? (bug?.busstatusid ?? task.statusid ?? ''),
            busstatusName: statusObj?.labelname || bug?.busstatusName || '',
            solvedby: solvedByArray,
            description: bug?.description ?? '',
            imagePreview: bug?.imageDataUrl ?? null,
            testby: testbyUser,
            testbyName: testbyUser ? `${testbyUser.firstname} ${testbyUser.lastname}` : (bug?.testbyName || ''),
            createddate: bug?.createddate || ''
        });
    };

    useEffect(() => {
        if (taskFinalData?.TaskData) {
            const flat = flattenTasks(taskFinalData.TaskData);
            const filtered = flat.filter(task => isValidTaskNo(task?.taskno));
            setTasks(filtered);
            setFilteredTasks(filtered);
        }
    }, [taskFinalData]);

    useEffect(() => {
        const results = tasks.filter(task => {
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch = !searchStr
                ? true
                : (
                    task.taskname?.toLowerCase().includes(searchStr) ||
                    task.taskno?.toString().includes(searchStr) ||
                    task.status?.toLowerCase().includes(searchStr) ||
                    task.priority?.toLowerCase().includes(searchStr)
                );

            const matchesStatus = listFilters.status ? Number(task.statusid) === Number(listFilters.status) : true;
            const matchesPriority = listFilters.priority ? Number(task.priorityid) === Number(listFilters.priority) : true;
            const matchesCategory = listFilters.category ? Number(task.workcategoryid) === Number(listFilters.category) : true;

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
        });
        setFilteredTasks(results);
    }, [searchTerm, tasks, listFilters]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        const bugs = loadBugsFromSession(task.taskid);
        const bugsArray = Array.isArray(bugs) ? bugs : [];
        setBugList(bugsArray);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAttributeChange = (arg1, arg2) => {
        const name = arg1?.target?.name ?? arg1;
        const value = arg1?.target?.value ?? arg2;

        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'busstatusid') {
                const status = taskBugStatusData?.find(s => String(s.id) === String(value));
                updated.busstatusName = status?.labelname || '';
            } else if (name === 'bugpriorityid') {
                const priority = taskBugPriorityData?.find(p => String(p.id) === String(value));
                updated.bugpriorityName = priority?.labelname || '';
            }
            return updated;
        });
    };

    console.log(formData);

    const handleDateChange = (date, name) => {
        setFormData(prev => ({ ...prev, [name]: date ? date.toISOString() : '' }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        processFile(file);
        e.target.value = '';
    };

    const processFile = (file) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prev => ({ ...prev, imagePreview: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please upload an image file.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = () => {
                    setFormData(prev => ({ ...prev, imagePreview: reader.result }));
                };
                reader.readAsDataURL(blob);
                e.preventDefault(); // Prevent default paste behavior
                break;
            }
        }
    };

    const handleSolvedByChange = (newValue) => {
        setFormData(prev => ({ ...prev, solvedby: newValue || [] }));
    };

    const handleTestedByChange = (newValue) => {
        const testbyUser = newValue || null;
        setFormData(prev => ({ 
            ...prev, 
            testby: testbyUser, 
            testbyName: testbyUser ? `${testbyUser.firstname} ${testbyUser.lastname}` : '' 
        }));
    };

    const handleSelectBug = (bug) => {
        if (!selectedTask?.taskid || !bug) return;
        setSelectedBugId(bug.bugId);
        applyBugToForm(selectedTask, bug);
        setViewMode('gallery');
        setFormOpen(true);
    };

    const handleDeleteBug = (bugId) => {
        deleteBugLogic(bugId);
    };

    const handleDeleteSelectedBug = () => {
        if (selectedBugId) deleteBugLogic(selectedBugId);
    };

    const deleteBugLogic = (bugId) => {
        if (!selectedTask?.taskid) return;
        const updated = bugList.filter(b => b.bugId !== bugId);
        setBugList(updated);
        saveBugsToSession(selectedTask.taskid, updated);

        if (selectedBugId === bugId) {
            if (updated.length > 0) {
                handleSelectBug(updated[0]);
            } else {
                setSelectedBugId(null);
                handleNewBugClick(selectedTask);
            }
        }
        toast.success('Bug deleted');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTask?.taskid) return;

        const effectiveBugId = selectedBugId || getNewBugId();
        const solvedByIds = (formData.solvedby || []).map(u => u.id).join(',');

        const statusId = formData.busstatusid ?? '';
        const statusName = formData.busstatusName ?? '';
        const priorityId = formData.bugpriorityid ?? '';
        const priorityName = formData.bugpriorityName ?? '';
        const testbyId = formData.testby?.id || '';

        const bugPayload = {
            bugId: effectiveBugId,
            Taskno: formData.Taskno,
            bugtitle: formData.bugtitle,
            busstatusid: statusId,
            busstatusName: statusName,
            bugpriorityid: priorityId,
            bugpriorityName: priorityName,
            solvedby: solvedByIds,
            description: formData.description,
            imageDataUrl: formData.imagePreview,
            updatedAt: new Date().toISOString(),
            testby: testbyId
        };

        setBugList((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            const idx = list.findIndex((b) => String(b.bugId) === String(effectiveBugId));
            const updated = idx >= 0
                ? list.map((b, i) => (i === idx ? { ...b, ...bugPayload } : b))
                : [bugPayload, ...list];
            saveBugsToSession(selectedTask.taskid, updated);
            return updated;
        });

        setSelectedBugId(effectiveBugId);
        toast.success(selectedBugId ? 'Bug updated successfully' : 'Bug created successfully');

        // Clear temp bug if it was a draft
        if (effectiveBugId.startsWith('temp')) {
            setTempBug(null);
        }
    };

    const handleNewBugClick = (arg = null) => {
        let task = selectedTask;
        let imageFile = null;

        if (arg instanceof File) {
            imageFile = arg;
        } else if (arg && arg.taskid) {
            task = arg;
        }

        const auth = getAuthData();
        const user = taskAssigneeData?.find(u => u.id == auth?.uid);
        setSelectedBugId(null);

        const statusObj = taskBugStatusData?.find(s => String(s.id) === String(task?.statusid)) || null;
        const priorityObj = taskBugPriorityData?.find(p => String(p.id) === String(task?.priorityid)) || null;

        if (imageFile) {
            // Create temp bug for gallery preview
            const tempId = 'temp-' + Date.now();
            const imageUrl = URL.createObjectURL(imageFile);
            setTempBug({
                bugId: tempId,
                Taskno: task?.taskno || '',
                bugtitle: '',
                busstatusid: statusObj?.id || task?.statusid || '',
                busstatusName: statusObj?.labelname || '',
                bugpriorityid: priorityObj?.id || task?.priorityid || '',
                bugpriorityName: priorityObj?.labelname || '',
                solvedby: [],
                description: '',
                imageDataUrl: imageUrl,
                testby: user || null,
                testbyName: user ? `${user.firstname} ${user.lastname}` : '',
                createddate: new Date().toISOString(),
                isDraft: true
            });
            setSelectedBugId(tempId);
            setViewMode('gallery'); // Switch to gallery to show preview
        }

        setFormData({
            Taskno: task?.taskno || '',
            bugtitle: '',
            busstatusid: statusObj?.id || task?.statusid || '',
            busstatusName: statusObj?.labelname || '',
            bugpriorityid: priorityObj?.id || task?.priorityid || '',
            bugpriorityName: priorityObj?.labelname || '',
            solvedby: [],
            description: '',
            imagePreview: imageFile ? URL.createObjectURL(imageFile) : null,
            testby: user || null,
            testbyName: user ? `${user.firstname} ${user.lastname}` : '',
            createddate: new Date().toISOString()
        });
        if (!isFormOpen && task) setFormOpen(true);
    };

    const handleGalleryUploadClick = () => {
        handleNewBugClick();
        // Optionally focus file input trigger if we had one global
    };

    const allBugs = tempBug ? [tempBug, ...bugList] : bugList;
    const filteredBugList = allBugs.filter(bug => {
        const statusMatch = !bugFilters.status || String(bug.busstatusid) === bugFilters.status;
        const assigneeMatch = !bugFilters.assignee || String(bug.solvedby).split(',').includes(bugFilters.assignee);
        const priorityMatch = !bugFilters.priority || String(bug.bugpriorityid) === bugFilters.priority;
        const testbyMatch = !bugFilters.testby || String(bug.testby) === bugFilters.testby;
        const dateMatch = !bugFilters.createddate || bug.createddate === bugFilters.createddate;
        // reassigned not implemented yet
        return statusMatch && assigneeMatch && priorityMatch && testbyMatch && dateMatch;
    });

    if (iswhTLoading) return <LoadingBackdrop isLoading="true" />;

    return (
        <Box className="bugtracking-container" onPaste={handlePaste}>
            <BugTrackingTasks
                filteredTasks={filteredTasks}
                selectedTask={selectedTask}
                handleTaskClick={handleTaskClick}
                isSidebarOpen={isSidebarOpen}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleFilterClick={handleFilterClick}
                anchorEl={anchorEl}
                handleFilterClose={handleFilterClose}
                listFilters={listFilters}
                statusData={statusData}
                priorityData={priorityData}
                taskCategory={taskCategory}
                handleListFilterChange={handleListFilterChange}
                handleClearListFilters={handleClearListFilters}
                setIsSidebarOpen={setIsSidebarOpen}
            />
            <BugTrackingCenter
                selectedTask={selectedTask}
                viewMode={viewMode}
                setViewMode={setViewMode}
                bugList={filteredBugList}
                selectedBugId={selectedBugId}
                handleSelectBug={handleSelectBug}
                handleNewBugClick={handleNewBugClick}
                handleDeleteSelectedBug={handleDeleteSelectedBug}
                taskBugStatusData={taskBugStatusData}
                taskBugPriorityData={taskBugPriorityData}
                taskAssigneeData={taskAssigneeData}
                handleDeleteBug={handleDeleteBug}
                onUploadClick={handleNewBugClick}
                bugFilters={bugFilters}
                setBugFilters={setBugFilters}
            />
            <BugTrackingForm
                isFormOpen={isFormOpen}
                selectedTask={selectedTask}
                selectedBugId={selectedBugId}
                formData={formData}
                handleChange={handleChange}
                handleAttributeChange={handleAttributeChange}
                handleSolvedByChange={handleSolvedByChange}
                handleTestedByChange={handleTestedByChange}
                handleDateChange={handleDateChange}
                handleSubmit={handleSubmit}
                handleImageUpload={handleImageUpload}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handlePaste={handlePaste}
                taskBugStatusData={taskBugStatusData}
                taskBugPriorityData={taskBugPriorityData}
                taskAssigneeData={taskAssigneeData}
                setFormOpen={setFormOpen}
            />
        </Box>
    );

};

export default BugTracking;
