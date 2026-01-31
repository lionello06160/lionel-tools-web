import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { NewTool, Tool } from '../lib/types';

interface AddToolFormProps {
    initialData?: Tool;
    availableTags?: string[];
    onAdd: (tool: NewTool) => Promise<void>;
    onEdit?: (id: string, tool: NewTool) => Promise<void>;
    onClose: () => void;
}

const AddToolForm: React.FC<AddToolFormProps> = ({ initialData, availableTags = [], onAdd, onEdit, onClose }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const [prLink, setPrLink] = useState(initialData?.pr_link || '');
    const [tagsInput, setTagsInput] = useState(initialData?.tags.join(', ') || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Process tags: split by comma, trim, remove empty
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

        // Auto-prepend https:// to URL if missing
        let formattedUrl = url;
        if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'https://' + formattedUrl;
        }

        try {
            if (initialData && onEdit) {
                await onEdit(initialData.id, {
                    name,
                    url: formattedUrl,
                    pr_link: prLink,
                    tags
                });
            } else {
                await onAdd({
                    name,
                    url: formattedUrl,
                    pr_link: prLink,
                    tags
                });
            }
            onClose();
        } catch (error) {
            console.error("Error adding tool:", error);
            alert("Failed to add tool");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Tool' : 'Add New Tool'}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Tool Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="My Awesome Tool"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">URL</label>
                        <input
                            type="text"
                            required
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="https://... or just example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">GitHub PR (Optional)</label>
                        <input
                            type="url"
                            value={prLink}
                            onChange={e => setPrLink(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="https://github.com/..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="react, utility, web"
                        />
                        {availableTags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {availableTags.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            const currentTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
                                            if (currentTags.includes(tag)) {
                                                setTagsInput(currentTags.filter(t => t !== tag).join(', '));
                                            } else {
                                                setTagsInput([...currentTags, tag].join(', '));
                                            }
                                        }}
                                        className={`text-xs px-2 py-1 rounded-md border transition-colors ${tagsInput.split(',').map(t => t.trim()).includes(tag)
                                                ? 'bg-primary/20 text-primary border-primary/50'
                                                : 'bg-surface text-text-muted border-border hover:border-text-muted'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-text-muted hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> {initialData ? 'Update Tool' : 'Save Tool'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddToolForm;
