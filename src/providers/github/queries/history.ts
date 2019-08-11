import { Query } from './query';

export interface GitHubResponseHistoryAuthorUser {
    id: number;
    login: string;
    url: string;
}

export interface GitHubResponseHistoryAuthor {
    avatar: string;
    user: GitHubResponseHistoryAuthorUser;
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

export class HistoryQuery extends Query {
    public static moveCursor(cursor: string, position: number): string {
        return position ? `${cursor} ${position}` : cursor;
    }

    public async getCursor(): Promise<string> {
        const response = await this.execute(/* GraphQL */ `
            query GetCommitObjectId($owner: String!, $repository: String!, $branch: String!) {
                repository(owner: $owner, name: $repository) {
                    ref(qualifiedName: $branch) {
                        target {
                            ... on Commit {
                                oid
                            }
                        }
                    }
                }
            }
        `);

        return response.ref.target.oid as string;
    }

    public async getCommits(date: string, limit: number, cursor?: string): Promise<GitHubResponseHistoryCommit[]> {
        let cursorVariable = '';
        let cursorParameter = '';

        if (cursor) {
            cursorVariable = '$cursor: String!';
            cursorParameter = ', after: $cursor';
        }

        const response = await this.execute(
            /* GraphQL */ `
            fragment CommitEdges on CommitHistoryConnection {
                edges {
                    node {
                        hash: oid
                        header: messageHeadline
                        body: messageBody
                        url
                        date: committedDate
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
                $owner: String!,
                $repository: String!,
                $branch: String!,
                $limit: Int!,
                $date: GitTimestamp!,
                ${cursorVariable}
            ) {
                repository(owner: $owner, name: $repository) {
                    ref(qualifiedName: $branch) {
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

        return response.ref.target.history.edges.map(
            (edge: GitHubResponseHistoryNode): GitHubResponseHistoryCommit => edge.node
        );
    }

    public async getCommitsCount(date: string): Promise<number> {
        const response = await this.execute(
            /* GraphQL */ `
                query GetCommitsCount($owner: String!, $repository: String!, $branch: String!, $date: GitTimestamp!) {
                    repository(owner: $owner, name: $repository) {
                        ref(qualifiedName: $branch) {
                            target {
                                ... on Commit {
                                    history(since: $date) {
                                        totalCount
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            {
                date,
            }
        );

        return response.ref.target.history.totalCount as number;
    }
}
