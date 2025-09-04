// Generic base repository interface
export interface BaseRepository<T, CreateInput, UpdateInput> {
  create(input: CreateInput): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, input: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

// Repository result types
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface RepositoryOptions {
  throwOnNotFound?: boolean;
}
