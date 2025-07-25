import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Checkbox,
  Avatar,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './PendingAcceptanceDrawer.module.scss';
import { background, ImageUrl, priorityColors } from '../../../Utils/globalfun';
import PriorityBadge from '../PriorityBadge';
import RejectReasonModal from '../../../Utils/Common/RejectReasonModal';

const initialMockData = [
  {
    id: 1,
    type: 'task',
    task: 'Use tools like Google Analytics to track content performance',
    assignedTo: {
      customercode: 'jenis1',
      department: 'Marketing',
      departmentid: 1,
      designation: 'Content Analyst',
      designationid: 101,
      empphoto: 'https://i.pravatar.cc/300?img=1',
      firstname: 'Jenis',
      lastname: 'Gajera',
      id: 18538,
      userid: 'jenis1@eg.com',
    },
    priority: 'High',
    accepted: false,
    categoryPath: 'Marketing > Content Marketing',
  },
  {
    id: 2,
    type: 'meeting',
    task: 'Monthly SEO team sync-up meeting',
    assignedTo: {
      customercode: 'john2',
      department: 'SEO',
      departmentid: 2,
      designation: 'SEO Specialist',
      designationid: 102,
      empphoto: 'https://i.pravatar.cc/300?img=2',
      firstname: 'John',
      lastname: 'Doe',
      id: 18539,
      userid: 'john2@eg.com',
    },
    priority: 'Medium',
    accepted: false,
    categoryPath: 'SEO > Optimization',
  },
  {
    id: 3,
    type: 'task',
    task: 'Develop an engaging ebook or whitepaper',
    assignedTo: {
      customercode: 'emma3',
      department: 'SEO',
      departmentid: 2,
      designation: 'Content Writer',
      designationid: 103,
      empphoto: 'https://i.pravatar.cc/300?img=3',
      firstname: 'Emma',
      lastname: 'Watson',
      id: 18540,
      userid: 'emma3@eg.com',
    },
    priority: 'Low',
    accepted: false,
    categoryPath: 'SEO > Optimization',
  },
  {
    id: 4,
    type: 'meeting',
    task: 'Identify high-impact keywords for content strategy - Strategy Meeting',
    assignedTo: {
      customercode: 'david4',
      department: 'Marketing',
      departmentid: 1,
      designation: 'Marketing Strategist',
      designationid: 104,
      empphoto: 'https://i.pravatar.cc/300?img=4',
      firstname: 'David',
      lastname: 'Smith',
      id: 18541,
      userid: 'david4@eg.com',
    },
    priority: 'High',
    accepted: false,
    categoryPath: 'Marketing > Content Marketing',
  },
  {
    id: 5,
    type: 'task',
    task: 'Plan and schedule blog posts, social media',
    assignedTo: {
      customercode: 'sarah5',
      department: 'Marketing',
      departmentid: 1,
      designation: 'Social Media Manager',
      designationid: 105,
      empphoto: 'https://i.pravatar.cc/300?img=5',
      firstname: 'Sarah',
      lastname: 'Lee',
      id: 18542,
      userid: 'sarah5@eg.com',
    },
    priority: 'Low',
    accepted: false,
    categoryPath: 'Marketing > Content Marketing',
  },
];

const PendingAcceptanceDrawer = ({ open, onClose }) => {
  const [tasks, setTasks] = useState(initialMockData);
  const [selected, setSelected] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [reasonContext, setReasonContext] = useState({ ids: [], mode: '' });

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleAcceptAll = () => {
    if (selected.length === 0) return;
    setReasonContext({ ids: selected, mode: 'multiple' });
    setActionType('accept');
    setReasonModalOpen(true);
  };

  const handleRejectAll = () => {
    if (selected.length === 0) return;
    setReasonContext({ ids: selected, mode: 'multiple' });
    setActionType('reject');
    setReasonModalOpen(true);
  };

  const handleRowAccept = (id) => {
    setReasonContext({ ids: [id], mode: 'single' });
    setActionType('accept');
    setReasonModalOpen(true);
  };

  const handleRowReject = (id) => {
    setReasonContext({ ids: [id], mode: 'single' });
    setActionType('reject');
    setReasonModalOpen(true);
  };

  const handleSelectAllToggle = () => {
    setSelected((prev) =>
      prev.length === tasks.length ? [] : tasks.map((d) => d.id)
    );
  };

  const handleCloseReasonModal = () => {
    setReasonModalOpen(false);
    setRejectReason('');
    setReasonContext({ ids: [], mode: '' });
    setActionType('');
  };

  const handleReasonConfirm = () => {
    const { ids, mode } = reasonContext;
    if (actionType === 'reject') {
      console.log(`Rejected ${mode} tasks: ${ids.join(', ')} with reason: ${rejectReason}`);
      setTasks((prev) => prev.filter((task) => !ids.includes(task.id)));
    } else if (actionType === 'accept') {
      console.log(`Accepted ${mode} tasks: ${ids.join(', ')} with reason: ${rejectReason}`);
      setTasks((prev) =>
        prev.map((task) =>
          ids.includes(task.id) ? { ...task, accepted: true } : task
        )
      );
    }
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    handleCloseReasonModal();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box className={styles.PendingAcceptanceDrawer}>
        <Box className={styles.header}>
          <Typography variant="h6">Pending Tasks & Meetings Acceptance</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box className={styles.actions}>
          <Checkbox
            checked={selected.length === tasks.length && tasks.length > 0}
            onChange={handleSelectAllToggle}
            size="small"
            name="selectAll"
            className={styles.selectAll}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleAcceptAll}
            disabled={selected.length === 0}
            className="buttonClassname"
          >
            Accept All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRejectAll}
            disabled={selected.length === 0}
            className="secondaryBtnClassname"
          >
            Reject All
          </Button>
        </Box>

        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table size="small" className={styles.table}>
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell>Tasks</TableCell>
                <TableCell>Assigned</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell width={140}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Box display="flex" alignItems="flex-start" gap={1} className={styles.taskCell}>
                      <Checkbox
                        checked={selected.includes(task.id)}
                        onChange={() => toggleSelect(task.id)}
                        size="small"
                        className={styles.checkbox}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {task.categoryPath}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">{task.task}</Typography>
                        </Box>
                        <Chip
                          label={task.type === 'meeting' ? 'Meeting' : 'Task'}
                          size="small"
                          sx={{ fontSize: 10, height: 20, mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Avatar
                      key={task.id}
                      alt={`${task?.assignedTo?.firstname} ${task?.assignedTo?.lastname}`}
                      src={ImageUrl(task.assignedTo) || null}
                      sx={{
                        backgroundColor: background(`${task?.assignedTo?.firstname + " " + task?.assignedTo?.lastname}`),
                        width: 30,
                        height: 30,
                        fontSize: '14px',
                      }}
                    >
                      {!task.assignedTo?.avatar && task?.assignedTo?.firstname?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge
                      task={task}
                      priorityColors={priorityColors}
                      disable={true}
                      fontSize={12}
                      padding={5}
                      minWidth={50}
                    />
                  </TableCell>
                  <TableCell className={styles.actionsCell}>
                    {task.accepted ? (
                      <Typography variant="body2" color="success.main">Accepted</Typography>
                    ) : (
                      <>
                        <Button
                          size="small"
                          onClick={() => handleRowAccept(task.id)}
                          className="buttonClassname"
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRowReject(task.id)}
                          className="secondaryBtnClassname"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <RejectReasonModal
        open={reasonModalOpen}
        onClose={handleCloseReasonModal}
        onConfirm={handleReasonConfirm}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        title={actionType === 'reject' ? 'Reject Reason' : 'Acceptance Reason'}
        confirmLabel={actionType === 'reject' ? 'Reject' : 'Accept'}
        confirmText={actionType === 'reject' ? 'Reject' : 'Accept'}
      />
    </Drawer>
  );
};

export default PendingAcceptanceDrawer;
