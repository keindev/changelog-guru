import { ReleaseInfo } from '../../typings/types';

// TODO: put in a standalone package?

export interface GitHubResponseHistoryCursor {
    branch: {
        cursor: {
            hash: string;
        };
    };
}

export interface GitHubResponseHistoryAuthor {
    avatar: string;
    user: {
        id: number;
        login: string;
        url: string;
    };
}

export interface GitHubResponseHistoryCommit {
    hash: string;
    header: string;
    body: string;
    url: string;
    date: string;
    author: GitHubResponseHistoryAuthor;
}

export interface GitHubResponseHistoryNode {
    node: GitHubResponseHistoryCommit;
}

export interface GitHubResponseHistoryEdges {
    branch: {
        target: {
            history: {
                edges: GitHubResponseHistoryNode[];
            };
        };
    };
}

export interface GitHubResponsePackageCommit {
    hash: string;
}

export interface GitHubResponsePackageNodes {
    branch: {
        target: {
            history: {
                commits: GitHubResponsePackageCommit[];
            };
        };
    };
}

export interface GitHubResponsePackageData {
    package: {
        text: string;
    };
}

export interface GitHubResponseRelease {
    release: {
        nodes: ReleaseInfo[];
    };
}
