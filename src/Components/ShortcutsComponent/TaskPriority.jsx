
import { getDynamicPriorityColor } from '../../Utils/globalfun';

const TaskPriority = (priority, priorityColors) => {
    const key = (priority || '').toLowerCase().trim();
    const apiColor = getDynamicPriorityColor(priority);
    const color = priority && (apiColor?.color || priorityColors[key]?.color) || '#fff';
    const backgroundColor = priority && (apiColor?.backgroundColor || priorityColors[key]?.backgroundColor) || '#7d7f85a1';

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
