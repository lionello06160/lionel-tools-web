export interface ToolLink {
    label?: string;
    url: string;
}

export interface Tool {
    id: string;
    name: string;
    url: string; // Keeping for backward compatibility
    urls?: ToolLink[];
    pr_link?: string;
    tags: string[];
    userId: string;
    order?: number;
    createdAt: any; // Firestore Timestamp
}

export type NewTool = Omit<Tool, 'id' | 'createdAt' | 'userId'>;

