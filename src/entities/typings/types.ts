import { Author } from '../author';

export interface AuthorOptions {
    url: string;
    avatar: string;
}

export interface CommitOptions {
    timestamp: number;
    header: string;
    body?: string;
    url: string;
    author: Author;
}
