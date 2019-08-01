import { Query } from './query';
import { GitHubResponseHistoryCursor, GitHubResponseHistoryCommit, GitHubResponseHistoryEdges } from '../typings/types';

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
