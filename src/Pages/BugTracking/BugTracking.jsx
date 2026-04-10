import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { AddBugDataApi } from '../../Api/TaskApi/BugSaveApi';
import { filesUploadApi } from '../../Api/UploadApi/filesUploadApi';
import { fetchBugListDataApi } from '../../Api/TaskApi/GetBugListApi';

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
    const [imageFile, setImageFile] = useState(null); // Store actual file for upload
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleTaskClick = async (task) => {
        setSelectedTask(task);
        
        try {
            // Fetch bugs from API
            const response = await fetchBugListDataApi(task);
            
            if (response?.rd && Array.isArray(response.rd)) {
                // Map API response to local bug format
                const bugsArray = response.rd.map(bug => ({
                    bugId: bug.id,
                    Taskno: bug.taskno,
                    bugtitle: bug.bugtitle,
                    busstatusid: bug.bugstatusid,
                    busstatusName: bug.bugstatus,
                    bugpriorityid: bug.bugpriorityid,
                    bugpriorityName: bug.bugpriority,
                    solvedby: bug.solvedbyid,
                    description: bug.descr,
                    imageDataUrl: bug.imagepath,
                    updatedAt: bug.entrydate,
                    testby: bug.testbyid,
                    testbyName: bug.testbyfullname,
                    solvedByName: bug.solvedbyfullname,
                    solvedDate: bug.solveddate,
                    recheckById: bug.recheckbyid,
                    recheckByName: bug.recheckbyfullname,
                    recheckDate: bug.recheckdate
                }));
                
                setBugList(bugsArray);
            } else {
                setBugList([]);
            }
        } catch (error) {
            console.error('Error fetching bugs:', error);
            toast.error('Failed to load bugs');
            setBugList([]);
        }
        
        setFormOpen(false);
    };

    // Debounce timer ref
    const debounceTimerRef = useRef(null);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        // Update immediately for responsive UI
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for any additional processing if needed
        debounceTimerRef.current = setTimeout(() => {
            // Any additional processing can go here
            // For now, just immediate update is enough
        }, 300);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleAttributeChange = useCallback((arg1, arg2) => {
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
    }, [taskBugStatusData, taskBugPriorityData]);

    const handleDateChange = useCallback((date, name) => {
        setFormData(prev => ({ ...prev, [name]: date ? date.toISOString() : '' }));
    }, []);

    const handleImageUpload = useCallback((e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        processFile(file);
        e.target.value = '';
    }, []);

    const processFile = useCallback((file) => {
        if (file.type.startsWith('image/')) {
            // Store the actual file for upload
            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prev => ({ ...prev, imagePreview: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please upload an image file.');
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

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

    const handleSolvedByChange = useCallback((newValue) => {
        setFormData(prev => ({ ...prev, solvedby: newValue || [] }));
    }, []);

    const handleRemoveImage = useCallback(() => {
        setFormData(prev => ({ ...prev, imagePreview: null }));
        setImageFile(null);
        if (tempBug) {
            setTempBug(null);
            setSelectedBugId(null);
        }
    }, [tempBug]);

    const handleTestedByChange = useCallback((newValue) => {
        const testbyUser = newValue || null;
        setFormData(prev => ({
            ...prev,
            testby: testbyUser,
            testbyName: testbyUser ? `${testbyUser.firstname} ${testbyUser.lastname}` : ''
        }));
    }, []);

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

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!selectedTask?.taskid || isSubmitting) return;

        setIsSubmitting(true);

        try {
            let imageUrl = '';

            // Step 1: Upload image if exists
            if (imageFile) {
                try {
                    // Generate unique number from filename or timestamp
                    const uniqueNo = imageFile?.name?.split(".")?.[0] || `${Date.now()}`;

                    const uploadResponse = await filesUploadApi({
                        attachments: [{ file: imageFile }],
                        folderName: 'bugtracking',
                        uniqueNo: uniqueNo
                    });

                    if (uploadResponse?.files && uploadResponse.files.length > 0) {
                        imageUrl = uploadResponse.files[0]?.url || '';
                    }
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                    toast.error('Failed to upload image');
                    setIsSubmitting(false);
                    return;
                }
            } else if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                // Convert blob URL to File if imageFile is not available
                try {
                    const response = await fetch(formData.imagePreview);
                    const blob = await response.blob();
                    const fileName = `bug-image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
                    const file = new File([blob], fileName, { type: blob.type });

                    const uniqueNo = fileName?.split(".")?.[0] || `${Date.now()}`;

                    const uploadResponse = await filesUploadApi({
                        attachments: [{ file: file }],
                        folderName: 'bugtracking',
                        uniqueNo: uniqueNo
                    });

                    if (uploadResponse?.files && uploadResponse.files.length > 0) {
                        imageUrl = uploadResponse.files[0]?.url || '';
                    }
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                    toast.error('Failed to upload image');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Step 2: Prepare bug data
            const solvedByIds = (formData.solvedby || []).map(u => u.id).join(',');
            const testbyId = (formData.testby || []).map(u => u.id).join(',');

            const bugPayload = {
                taskid: selectedTask.taskid,
                taskno: selectedTask.taskno || '',
                bugtitle: formData.bugtitle,
                solvedbyid: solvedByIds,
                codeby: `${formData.solvedby[0]?.firstname} ${formData.solvedby[0]?.lastname}`,
                testbyid: testbyId,
                bugpriorityid: formData.bugpriorityid || '0',
                bugstatusid: formData.busstatusid || '0',
                bugimagepath: imageUrl,
                remarks: formData.description || ''
            };

            // Step 3: Call AddBugDataApi
            const response = await AddBugDataApi(bugPayload);

            if (response && response.rd && response.rd.length > 0) {
                const savedBug = response.rd[0];

                // Update local bug list
                const effectiveBugId = savedBug.bugid || getNewBugId();
                const statusName = formData.busstatusName || '';
                const priorityName = formData.bugpriorityName || '';

                const localBugData = {
                    bugId: effectiveBugId,
                    Taskno: selectedTask.taskno || '',
                    bugtitle: formData.bugtitle,
                    busstatusid: formData.busstatusid || '',
                    busstatusName: statusName,
                    bugpriorityid: formData.bugpriorityid || '',
                    bugpriorityName: priorityName,
                    solvedby: solvedByIds,
                    description: formData.description || '',
                    imageDataUrl: imageUrl || formData.imagePreview,
                    updatedAt: new Date().toISOString(),
                    testby: testbyId
                };

                setBugList((prev) => {
                    const list = Array.isArray(prev) ? prev : [];
                    const idx = list.findIndex((b) => String(b.bugId) === String(selectedBugId));
                    const updated = idx >= 0
                        ? list.map((b, i) => (i === idx ? { ...b, ...localBugData } : b))
                        : [localBugData, ...list];
                    return updated;
                });

                setSelectedBugId(effectiveBugId);
                toast.success(selectedBugId && !String(selectedBugId).startsWith('temp') ? 'Bug updated successfully' : 'Bug created successfully');

                // Clear temp bug if it was a draft
                if (selectedBugId && String(selectedBugId).startsWith('temp')) {
                    setTempBug(null);
                }

                // Refresh bug list from API after save
                try {
                    const refreshResponse = await fetchBugListDataApi(selectedTask);
                    if (refreshResponse?.rd && Array.isArray(refreshResponse.rd)) {
                        const bugsArray = refreshResponse.rd.map(bug => ({
                            bugId: bug.id,
                            Taskno: bug.taskno,
                            bugtitle: bug.bugtitle,
                            busstatusid: bug.bugstatusid,
                            busstatusName: bug.bugstatus,
                            bugpriorityid: bug.bugpriorityid,
                            bugpriorityName: bug.bugpriority,
                            solvedby: bug.solvedbyid,
                            description: bug.descr,
                            imageDataUrl: bug.imagepath,
                            updatedAt: bug.entrydate,
                            testby: bug.testbyid,
                            testbyName: bug.testbyfullname,
                            solvedByName: bug.solvedbyfullname
                        }));
                        setBugList(bugsArray);
                    }
                } catch (refreshError) {
                    console.error('Error refreshing bug list:', refreshError);
                }

                // Clear form after successful save
                setFormData({
                    bugtitle: '',
                    Taskno: '',
                    busstatusid: '',
                    busstatusName: '',
                    bugpriorityid: '',
                    bugpriorityName: '',
                    solvedby: [],
                    description: '',
                    imagePreview: null,
                    testby: null,
                    testbyName: '',
                    createddate: ''
                });

                setImageFile(null);
                setFormOpen(false);
            } else {
                toast.error('Failed to save bug');
            }
        } catch (error) {
            console.error('Error saving bug:', error);
            toast.error('An error occurred while saving the bug');
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedTask, selectedBugId, formData, imageFile, isSubmitting]);

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
        } else {
            // Switch to gallery view when creating new bug from list view
            setViewMode('gallery');
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

    const handleImageUpdate = useCallback((bugId, editedImageDataUrl) => {
        // Update the bug's image in the bugList
        setBugList((prev) => {
            return prev.map((bug) => {
                if (String(bug.bugId) === String(bugId)) {
                    return {
                        ...bug,
                        imageDataUrl: editedImageDataUrl
                    };
                }
                return bug;
            });
        });

        // Also update tempBug if it's the one being edited
        if (tempBug && String(tempBug.bugId) === String(bugId)) {
            setTempBug((prev) => ({
                ...prev,
                imageDataUrl: editedImageDataUrl
            }));
        }

        // Update formData if this bug is currently selected
        if (String(selectedBugId) === String(bugId)) {
            setFormData((prev) => ({
                ...prev,
                imagePreview: editedImageDataUrl
            }));
        }
    }, [tempBug, selectedBugId]);

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
                onImageUpdate={handleImageUpdate}
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
                handleRemoveImage={handleRemoveImage}
                isSubmitting={isSubmitting}
            />
        </Box>
    );

};

export default BugTracking;
