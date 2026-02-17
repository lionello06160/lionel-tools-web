import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import type { NewTool, Tool, ToolLink } from '../lib/types';

interface AddToolFormProps {
    initialData?: Tool;
    availableTags?: string[];
    onAdd: (tool: NewTool) => Promise<void>;
    onEdit?: (id: string, tool: NewTool) => Promise<void>;
    onClose: () => void;
}

const AddToolForm: React.FC<AddToolFormProps> = ({ initialData, availableTags = [], onAdd, onEdit, onClose }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [urls, setUrls] = useState<ToolLink[]>(
        initialData?.urls && initialData.urls.length > 0
            ? initialData.urls
            : [{ label: 'Main', url: initialData?.url || '' }]
    );
    const [prLink, setPrLink] = useState(initialData?.pr_link || '');
    const [tagsInput, setTagsInput] = useState(initialData?.tags.join(', ') || '');
    const [loading, setLoading] = useState(false);

    const handleAddUrl = () => {
        setUrls([...urls, { label: '', url: '' }]);
    };

    const handleRemoveUrl = (index: number) => {
        if (urls.length <= 1) return;
        setUrls(urls.filter((_, i) => i !== index));
    };

    const handleUrlChange = (index: number, field: keyof ToolLink, value: string) => {
        const newUrls = [...urls];
        newUrls[index] = { ...newUrls[index], [field]: value };
        setUrls(newUrls);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Process tags: split by comma, trim, remove empty
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

        // Process and format URLs
        const formattedUrls = urls
            .filter(u => u.url.trim())
            .map(u => {
                let formattedUrl = u.url.trim();
                if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
                    formattedUrl = 'https://' + formattedUrl;
                }
                return {
                    label: u.label?.trim() || 'Link',
                    url: formattedUrl
                };
            });

        if (formattedUrls.length === 0) {
            alert("Please provide at least one URL");
            setLoading(false);
            return;
        }

        try {
            const toolData: NewTool = {
                name,
                url: formattedUrls[0].url, // Still keep first one for compatibility
                urls: formattedUrls,
                pr_link: prLink,
                tags
            };

            if (initialData && onEdit) {
                await onEdit(initialData.id, toolData);
            } else {
                await onAdd(toolData);
            }
            onClose();
        } catch (error) {
            console.error("Error saving tool:", error);
            alert("Failed to save tool");
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
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

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <LinkIcon size={16} className="text-primary" />
                            <label className="block text-sm font-medium text-text-muted">Links</label>
                        </div>
                        {urls.map((urlObj, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={urlObj.label}
                                            onChange={e => handleUrlChange(index, 'label', e.target.value)}
                                            className="w-24 bg-background border border-border rounded-lg p-2 text-xs text-text focus:border-primary outline-none transition-all"
                                            placeholder="Label (e.g. Web)"
                                        />
                                        <input
                                            type="text"
                                            required={index === 0}
                                            value={urlObj.url}
                                            onChange={e => handleUrlChange(index, 'url', e.target.value)}
                                            className="flex-1 bg-background border border-border rounded-lg p-2 text-sm text-text focus:border-primary outline-none transition-all"
                                            placeholder="example.com"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveUrl(index)}
                                    disabled={urls.length <= 1}
                                    className="mt-1.5 p-1.5 text-text-muted hover:text-red-400 disabled:opacity-30 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddUrl}
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors mt-1"
                        >
                            <Plus size={16} />
                            Add another link
                        </button>
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

