import React from 'react';
import { GitPullRequest, Trash2, Edit2, ExternalLink } from 'lucide-react';
import type { Tool } from '../lib/types';
import { getTagStyles, cn } from '../lib/utils';

interface ToolCardProps {
    tool: Tool;
    onEdit: (tool: Tool) => void;
    onDelete: (id: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onEdit, onDelete }) => {
    return (
        <div className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-lg p-3 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 flex flex-col h-full relative">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
                        {tool.name}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1">
                        {tool.urls && tool.urls.length > 0 ? (
                            tool.urls.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-text-muted hover:text-white transition-all text-[11px] truncate flex items-center gap-1 hover:underline group/link w-fit"
                                >
                                    <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                    <span className="font-medium text-primary/70 group-hover/link:text-primary transition-colors">
                                        {link.label || 'Link'}:
                                    </span>
                                    <span className="truncate max-w-[120px]">
                                        {new URL(link.url).hostname.replace('www.', '')}
                                    </span>
                                </a>
                            ))
                        ) : (
                            <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-text-muted hover:text-white transition-colors text-xs truncate hover:underline"
                            >
                                {new URL(tool.url).hostname.replace('www.', '')}
                            </a>
                        )}
                    </div>
                </div>

                {/* Actions - visible on hover or persistent but subtle */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(tool);
                        }}
                        className="text-text-muted hover:text-white transition-colors p-1"
                        title="Edit Tool"
                    >
                        <Edit2 size={12} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this tool?')) {
                                onDelete(tool.id);
                            }
                        }}
                        className="text-text-muted hover:text-red-400 transition-colors p-1"
                        title="Delete Tool"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            <div className="mt-auto pt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                    {tool.tags.slice(0, 3).map((tag, index) => {
                        const styles = getTagStyles(tag);
                        return (
                            <span
                                key={index}
                                className={cn(
                                    "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors",
                                    styles.badge
                                )}
                            >
                                {tag}
                            </span>
                        );
                    })}
                    {tool.tags.length > 3 && (
                        <span className="text-[10px] text-text-muted">+{tool.tags.length - 3}</span>
                    )}
                </div>

                {tool.pr_link && (
                    <a
                        href={tool.pr_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-primary transition-colors"
                        title="View PR"
                    >
                        <GitPullRequest size={12} />
                    </a>
                )}
            </div>

            <style>{`
                .group button, .group a { position: relative; z-index: 10; }
            `}</style>
        </div>
    );
};

export default ToolCard;

