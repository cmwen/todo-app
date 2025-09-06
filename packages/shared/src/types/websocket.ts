export interface WebSocketMessage {
	id: string;
	type: string;
	payload: any;
	timestamp: number;
}

export interface ClientMessage extends WebSocketMessage {
	type: 'create_todo' | 'update_todo' | 'delete_todo' | 'list_todos';
}

export interface ServerMessage extends WebSocketMessage {
	type: 'todo_created' | 'todo_updated' | 'todo_deleted' | 'todos_listed' | 'error';
}
