
const TaskPriority = (priority, priorityColors) => {
    const color = priority && priorityColors[priority]?.color || '#fff';
    const backgroundColor = priority && priorityColors[priority]?.backgroundColor || '#7d7f85a1';

    return (
        <div style={{
            color,
            backgroundColor,
            width: 'fit-content',
            padding: '0.2rem 0.8rem',
            borderRadius: '5px',
            textAlign: 'center',
            fontSize: '13.5px',
            fontWeight: '500',
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
        }}
            className="priority-label"
        >
            {priority ?? '-'}
        </div>
    );
};

export default TaskPriority;
