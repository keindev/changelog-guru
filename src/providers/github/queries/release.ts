import { Query } from './query';
import { ReleaseInfo } from '../../provider';

export class ReleaseQuery extends Query {
    public async getLast(): Promise<ReleaseInfo | undefined> {
        const response = await this.execute(/* GraphQL */ `
            query GetRelease($owner: String!, $repository: String!) {
                repository(owner: $owner, name: $repository) {
                    releases(last: 1) {
                        nodes {
                            tag: tagName
                            date: publishedAt
                        }
                    }
                }
            }
        `);

        return (response.releases.nodes as ReleaseInfo[]).pop();
    }
}
