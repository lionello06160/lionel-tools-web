export interface Tool {
    id: string;
    name: string;
    url: string;
    pr_link?: string;
    tags: string[];
    userId: string;
    order?: number;
    createdAt: any; // Firestore Timestamp
}

export type NewTool = Omit<Tool, 'id' | 'createdAt' | 'userId'>;
