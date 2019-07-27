import { Query } from './query';
import { Release } from '../../provider';

export interface GitHubResponseRelease {
    release: {
        nodes: Release[];
    };
}

export class ReleaseQuery extends Query {
    public async getLast(): Promise<Release | undefined> {
        const response: GitHubResponseRelease = await this.execute(/* GraphQL */ `
            query GetRelease($owner: String!, $repository: String!) {
                repository(owner: $owner, name: $repository) {
                    release: releases(last: 1) {
                        nodes {
                            tag: tagName
                            date: publishedAt
                        }
                    }
                }
            }
        `);

        return response.release.nodes.pop();
    }
}
