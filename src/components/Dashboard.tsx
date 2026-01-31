import { useState, useEffect } from 'react';
import { Plus, LogOut, Search } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, onSnapshot, serverTimestamp, where, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { auth, db } from '../firebase';
import type { Tool, NewTool } from '../lib/types';
import SortableToolProxy from './SortableToolProxy';
import TagFilter from './TagFilter';
import AddToolForm from './AddToolForm';

const Dashboard = () => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<Tool | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to start drag (prevents accidental drags)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch tools (Realtime)
    useEffect(() => {
        setLoading(true);
        // Wait for auth to initialize
        if (auth.currentUser === undefined) return;

        const userId = auth.currentUser?.uid;
        if (!userId) {
            setTools([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'tools'),
            where('userId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const toolsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Tool[];

            // Client-side sort by 'order' then 'createdAt'
            toolsData.sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                }
                const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date();
                const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date();
                return dateB.getTime() - dateA.getTime();
            });

            setTools(toolsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching tools:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth.currentUser]);

    const handleSignOut = () => signOut(auth);

    const handleAddTool = async (newTool: NewTool) => {
        if (!auth.currentUser) return;

        try {
            // Assign order to be last
            const maxOrder = tools.length > 0 ? Math.max(...tools.map(t => t.order || 0)) : 0;

            await addDoc(collection(db, 'tools'), {
                ...newTool,
                userId: auth.currentUser.uid,
                order: maxOrder + 1,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error adding tool:", error);
            alert("Failed to add tool to database");
        }
    };

    const handleUpdateTool = async (id: string, updatedTool: NewTool) => {
        if (!auth.currentUser) return;

        try {
            const toolRef = doc(db, 'tools', id);
            await updateDoc(toolRef, { ...updatedTool });
        } catch (error) {
            console.error("Error updating tool:", error);
            alert("Failed to update tool");
        }
    };

    const handleDeleteTool = async (id: string) => {
        if (!auth.currentUser) return;

        try {
            await deleteDoc(doc(db, 'tools', id));
        } catch (error) {
            console.error("Error deleting tool:", error);
            alert("Failed to delete tool");
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tools.findIndex((t) => t.id === active.id);
            const newIndex = tools.findIndex((t) => t.id === over.id);

            // Optimistic update
            const newTools = arrayMove(tools, oldIndex, newIndex);

            // Re-assign orders
            const reorderedTools = newTools.map((tool, index) => ({
                ...tool,
                order: index
            }));

            setTools(reorderedTools);

            // Persist to Firestore
            if (!auth.currentUser) return;

            try {
                const batch = writeBatch(db);
                reorderedTools.forEach((tool) => {
                    // Only update tools that have changed order or don't have an order
                    const originalTool = tools.find(t => t.id === tool.id);
                    if (originalTool?.order !== tool.order) {
                        const toolRef = doc(db, 'tools', tool.id);
                        batch.update(toolRef, { order: tool.order });
                    }
                });
                await batch.commit();
            } catch (error) {
                console.error("Error saving order:", error);
                // Revert on error (optional, but good UX)
                // For now, we rely on the next snapshot update to correct it if failed, 
                // but optimistic update gives instant feedback.
            }
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // Derive all unique tags from tools
    const allTags = Array.from(new Set(tools.flatMap(t => t.tags))).sort();

    // Filter tools
    const filteredTools = tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesTags = selectedTags.length === 0 ||
            selectedTags.every(t => tool.tags.includes(t)); // AND logic, or use some for OR logic

        return matchesSearch && matchesTags;
    });

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Header */}
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-surface/50 p-4 rounded-2xl border border-border backdrop-blur-md sticky top-4 z-30">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-white">
                    My Tools
                </h1>

                <div className="flex-1 max-w-md mx-4 relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm text-text focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingTool(undefined);
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Add Tool</span>
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-all"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {/* Search Hero */}
                {/* Tag Filter Section */}
                <div className="flex flex-col items-center mb-8">
                    {/* Mobile Search (Visible only on small screens) */}
                    <div className="relative w-full mb-6 md:hidden">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-border rounded-full py-3 pl-12 pr-6 text-text focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-lg"
                        />
                    </div>

                    <TagFilter
                        allTags={allTags}
                        selectedTags={selectedTags}
                        onToggleTag={toggleTag}
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20 text-text-muted animate-pulse">Loading your toolbox...</div>
                ) : filteredTools.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-text-muted text-lg mb-4">No tools found.</p>
                        {tools.length === 0 && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="text-primary hover:text-primary-hover underline underline-offset-4"
                            >
                                Add your first tool
                            </button>
                        )}
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredTools.map(t => t.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredTools.map(tool => (
                                    <SortableToolProxy
                                        key={tool.id}
                                        tool={tool}
                                        onEdit={(tool) => {
                                            setEditingTool(tool);
                                            setIsAddModalOpen(true);
                                        }}
                                        onDelete={handleDeleteTool}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </main>

            {isAddModalOpen && (
                <AddToolForm
                    initialData={editingTool}
                    availableTags={allTags}
                    onAdd={handleAddTool}
                    onEdit={handleUpdateTool}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingTool(undefined);
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;
