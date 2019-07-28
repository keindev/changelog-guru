export interface AuthorOptions {
    login: string;
    url: string;
    avatar: string;
}

export interface CommitOptions {
    timestamp: number;
    header: string;
    body?: string;
    url: string;
    author: string;
}


