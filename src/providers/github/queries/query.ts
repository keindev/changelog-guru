import { GraphQLClient } from 'graphql-request';
import { Variables } from 'graphql-request/dist/src/types';
import { TaskTree } from 'tasktree-cli';

export class Query {
    protected client: GraphQLClient;
    protected variables: Variables;

    public constructor(client: GraphQLClient, variables: Variables = {}) {
        this.client = client;
        this.variables = variables;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async execute(query: string, variables: Variables = {}): Promise<any> {
        let data;

        try {
            data = await this.client.request(query, Object.assign(variables, this.variables));
        } catch (err) {
            TaskTree.add('GraphQLClient: request error!').error(err, true);
        }

        return data ? data.repository : undefined;
    }
}
