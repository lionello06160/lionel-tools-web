import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ToolCard from './ToolCard';
import type { Tool } from '../lib/types';

interface SortableToolProxyProps {
    tool: Tool;
    onEdit: (tool: Tool) => void;
    onDelete: (id: string) => void;
}

const SortableToolProxy: React.FC<SortableToolProxyProps> = ({ tool, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tool.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
        touchAction: 'none', // Critical for touch devices
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <ToolCard tool={tool} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );
};

export default SortableToolProxy;
