import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Collapse,
    TextField,
    InputAdornment,
    Button,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";
import "./Styles/MasterBind.scss"
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AdvancedMasterApiFunc } from "../../../Utils/globalfun";
import { AddTaskDataApi } from "../../../Api/TaskApi/AddTaskApi";
import { toast } from "react-toastify";
import { fetchlistApiCall, selectedRowData } from "../../../Recoil/atom";
import { useSetRecoilState } from "recoil";
import { SearchIcon } from "lucide-react";

export default function MasterBind({ taskModuleList, decodedData }) {
    const [leftGroups, setLeftGroups] = useState([]);
    const [rightGroups, setRightGroups] = useState([]);
    const [openCards, setOpenCards] = useState({});
    const [searchParams, setSearchParams] = useState({
        searchTerm: "",
    });
    const [searchTarget, setSearchTarget] = useState('both');
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);

    const handleMasterApiCall = async () => {
        await AdvancedMasterApiFunc();
    }
    // for show all master
    useEffect(() => {
        const masterData = JSON?.parse(sessionStorage.getItem('structuredAdvMasterData'));
        if (masterData) {
            setLeftGroups(masterData);
        } else {
            handleMasterApiCall();
        }
    }, [])

    // show master that associated with this module
    useEffect(() => {
        const masterData = JSON?.parse(sessionStorage.getItem('structuredAdvMasterData'));
        const selectedGroupIds = taskModuleList[0]?.maingroupids
            ?.split(",")
            ?.map((id) => parseInt(id, 10));

        const filteredData = masterData?.filter(item =>
            selectedGroupIds?.includes(item.id)
        );
        setRightGroups(filteredData);
    }, [])

    const handleAddApicall = async (updatedTasks) => {
        setOpenChildTask(false);
        let rootSubrootflagval = { "Task": "root" }
        const addTaskApi = await AddTaskDataApi(updatedTasks, rootSubrootflagval ?? {}, { module: true });
        if (addTaskApi?.rd[0]?.stat == 1) {
            toast.success(addTaskApi?.rd[0]?.stat_msg);
            setTimeout(() => {
                setOpenChildTask(true);
            }, 5000);
        }
    }

    const toggleCard = (id) => {
        setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = async (id) => {
        setOpenChildTask(false);
        const updatedRightGroups = rightGroups.filter((g) => g.id !== id);
        setRightGroups(updatedRightGroups);
        const updatedIds = updatedRightGroups.map((g) => g.id);
        const task = taskModuleList[0];
        const updatedTask = {
            ...task,
            maingroupids: updatedIds.join(',')
        };
        await handleAddApicall(updatedTask);
        setSelectedTask(updatedTask);
        setTimeout(() => {
            setOpenChildTask(true);
        }, 5000);
    };

    const handleDragEnd = async (result) => {
        const { destination, draggableId } = result;
        if (!destination || destination.droppableId !== "right") return;
        const draggedGroup = leftGroups.find((g) => g.id.toString() === draggableId);
        if (!draggedGroup) return;
        const alreadyExists = rightGroups.find((g) => g.id === draggedGroup.id);
        if (alreadyExists) return;
        const updatedRightGroups = [...rightGroups, draggedGroup];
        setRightGroups(updatedRightGroups);
        const updatedIds = updatedRightGroups.map((g) => g.id);
        const task = taskModuleList[0];
        const updatedTask = {
            ...task,
            maingroupids: updatedIds.join(',')
        };
        await handleAddApicall(updatedTask);
        setSelectedTask(updatedTask);
    };

    const onFilterChange = (key, value) => {
        setSearchParams((prev) => ({
            ...prev,
            [key]: value,
        }));

        if (key === "searchTerm") {
            const searchTerm = value.toLowerCase();
            const masterData = JSON?.parse(sessionStorage.getItem('structuredAdvMasterData')) || [];

            const filtered = masterData.filter(group =>
                group.name.toLowerCase().includes(searchTerm) ||
                group.groups.some(subGroup =>
                    subGroup.name.toLowerCase().includes(searchTerm) ||
                    subGroup.attributes.some(attr => attr.name.toLowerCase().includes(searchTerm))
                )
            );

            if (searchTarget === 'both') {
                setLeftGroups(filtered);
                setRightGroups(filtered.filter(g => rightGroups.some(rg => rg.id === g.id)));
            } else if (searchTarget === 'left') {
                setLeftGroups(filtered);
            } else if (searchTarget === 'right') {
                setRightGroups(filtered.filter(g => rightGroups.some(rg => rg.id === g.id)));
            }
        }
    };

    const handleSearchTarget = (event, newTarget) => {
        if (newTarget !== null) {
            setSearchTarget(newTarget);
            // Optionally trigger filtering again on toggle change if needed
            if (searchParams.searchTerm) {
                onFilterChange("searchTerm", searchParams.searchTerm);
            }
        }
    };

    const renderCard = (group, index, isDeletable = false) => {
        return (
            <Draggable draggableId={group?.id.toString()} index={index} key={group.id}>
                {(provided) => (
                    <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                            p: 1,
                            mb: 2,
                            cursor: "grab",
                            userSelect: "none",
                            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px !important',
                            borderRadius: '8px'
                        }}
                    >
                        <Box display="flex" alignItems="center">
                            <DragIndicatorIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography flexGrow={1}>{group?.name}</Typography>
                            <IconButton
                                size="small"
                                onClick={() => toggleCard(group.id)}
                                sx={{ ml: 1 }}
                            >
                                {openCards[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            {isDeletable && (
                                <IconButton size="small" onClick={() => handleDelete(group.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>

                        <Collapse in={openCards[group.id]}>
                            <Box mt={1} ml={3}>
                                {group?.groups?.map((subGroup) => (
                                    <Box key={subGroup.id} mb={1}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            {subGroup.name}
                                        </Typography>
                                        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                            {subGroup?.attributes?.map((attr) => (
                                                <li style={{ color: '#6D6B75' }} key={attr.id}>{attr.name}</li>
                                            ))}
                                        </ul>
                                    </Box>
                                ))}
                            </Box>
                        </Collapse>
                    </Paper>
                )}
            </Draggable>
        );
    };

    return (
        <Box>
            <>
                <Box display="flex" justifyContent="flex-end" mb={2} gap={1} alignItems="center" className="advSideBarTgBox">
                    <TextField
                        placeholder="Search tasks..."
                        value={searchParams?.searchTerm}
                        onChange={(e) => onFilterChange("searchTerm", e.target.value)}
                        size="small"
                        className="textfieldsClass"
                        sx={{
                            minWidth: 250,
                            "@media (max-width: 600px)": { minWidth: "100%" },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon size={20} color="#7d7f85" opacity={0.5} />
                                </InputAdornment>
                            ),
                        }}
                        aria-label="Search tasks..."
                    />
                    <ToggleButtonGroup
                        value={searchTarget}
                        exclusive
                        onChange={handleSearchTarget}
                        size="small"
                        aria-label="search target"
                        className="toggle-group"
                    >
                        <ToggleButton className="toggle-button" value="left" aria-label="search left only">
                            Filter Group
                        </ToggleButton>
                        <ToggleButton className="toggle-button" value="right" aria-label="search right only">
                            Bind Group
                        </ToggleButton>
                        <ToggleButton className="toggle-button" value="both" aria-label="search both">
                            Both
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Box display="flex" height="100vh" gap={2}>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="left" isDropDisabled>
                            {(provided) => (
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    flex={1}
                                    border="1px solid #ccc"
                                    p={2}
                                    borderRadius={2}
                                    overflow="auto"
                                >
                                    <Typography variant="h6" mb={2}>
                                        Advanced Filter Groups
                                    </Typography>

                                    {leftGroups.map((group, index) => {
                                        const alreadyAssigned = rightGroups.some((g) => g.id === group.id);

                                        if (alreadyAssigned) {
                                            return (
                                                <Paper
                                                    key={group.id}
                                                    sx={{
                                                        p: 1,
                                                        mb: 2,
                                                        border: "1px solid #ccc",
                                                        opacity: 0.5,
                                                        cursor: "not-allowed",
                                                        backgroundColor: "#f2f2f2",
                                                        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px !important',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="center">
                                                        <DragIndicatorIcon fontSize="small" sx={{ mr: 1 }} />
                                                        <Typography flexGrow={1}>{group.name}</Typography>
                                                        <Typography variant="caption" color="error">
                                                            Already Bind
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            );
                                        }

                                        return renderCard(group, index, false);
                                    })}

                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                        <Droppable droppableId="right">
                            {(provided) => (
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    flex={1}
                                    border="1px solid #ccc"
                                    p={2}
                                    borderRadius={2}
                                    overflow="auto"
                                >
                                    <Typography variant="h6" mb={2}>
                                        Module Bind Groups
                                    </Typography>

                                    {rightGroups.map((group, index) =>
                                        renderCard(group, index, true)
                                    )}

                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Box>
            </>
        </Box>
    );
}
