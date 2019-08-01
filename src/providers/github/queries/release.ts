import { Query } from './query';
import { ReleaseInfo } from '../../typings/types';
import { GitHubResponseRelease } from '../typings/types';

export class ReleaseQuery extends Query {
    public async getLast(): Promise<ReleaseInfo | undefined> {
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
