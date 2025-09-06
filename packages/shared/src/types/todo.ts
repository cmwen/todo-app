export interface Todo {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	priority: 'low' | 'medium' | 'high';
	createdAt: string; // ISO string for serialization across process boundaries
	updatedAt: string;
	completedAt?: string;
}

export interface CreateTodoInput {
	title: string;
	description?: string;
	priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoInput {
	id: string;
	title?: string;
	description?: string;
	completed?: boolean;
	priority?: 'low' | 'medium' | 'high';
}
