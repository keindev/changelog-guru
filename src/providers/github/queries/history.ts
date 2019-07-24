import { Query } from './query';

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

export class HistoryQuery extends Query {
    public static moveCursor(cursor: string, position: number): string {
        return position ? `${cursor} ${position}` : cursor;
    }

    public async getCursor(): Promise<string> {
        const response: GitHubResponseHistoryCursor = await this.execute(/* GraphQL */ `
            query GetCommitObjectId($owner: String!, $repository: String!, $branch: String!) {
                repository(owner: $owner, name: $repository) {
                    branch: ref(qualifiedName: $branch) {
                        cursor: target {
                            ... on Commit {
                                hash: oid
                            }
                        }
                    }
                }
            }
        `);

        return response.branch.cursor.hash;
    }

    public async getCommits(date: string, limit: number, cursor?: string): Promise<GitHubResponseHistoryCommit[]> {
        let cursorVariable = '';
        let cursorParameter = '';

        if (cursor) {
            cursorVariable = '$cursor: String!';
            cursorParameter = ', after: $cursor';
        }

        const response: GitHubResponseHistoryEdges = await this.execute(
            /* GraphQL */ `
            fragment CommitEdges on CommitHistoryConnection {
                edges {
                    node {
                        hash: oid
                        header: messageHeadline
                        body: messageBody
                        url
                        date: authoredDate
                        author {
                            avatar: avatarUrl
                            user {
                                id: databaseId
                                login
                                url
                            }
                        }
                    }
                }
            }

            query GetCommits(
                $owner: String!
                $repository: String!
                $branch: String!
                $limit: Int!
                $date: GitTimestamp!
                ${cursorVariable}
            ) {
                repository(owner: $owner, name: $repository) {
                    branch: ref(qualifiedName: $branch) {
                        target {
                            ... on Commit {
                                history(since: $date, first: $limit${cursorParameter}) {
                                    ...CommitEdges
                                }
                            }
                        }
                    }
                }
            }
        `,
            {
                date,
                limit,
                cursor,
            }
        );

        return response.branch.target.history.edges.map((edge): GitHubResponseHistoryCommit => edge.node);
    }
}