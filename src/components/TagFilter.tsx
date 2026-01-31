import React from 'react';
import { getTagStyles, cn } from '../lib/utils';
import { Check } from 'lucide-react';

interface TagFilterProps {
    allTags: string[];
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, selectedTags, onToggleTag }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const styles = getTagStyles(tag);

                return (
                    <button
                        key={tag}
                        onClick={() => onToggleTag(tag)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1.5",
                            isSelected
                                ? cn(styles.solid, "scale-105 shadow-md")
                                : cn(styles.border, "bg-surface hover:bg-opacity-50")
                        )}
                    >
                        {isSelected && <Check size={14} className="stroke-[3]" />}
                        {tag}
                    </button>
                );
            })}
        </div>
    );
};

export default TagFilter;
