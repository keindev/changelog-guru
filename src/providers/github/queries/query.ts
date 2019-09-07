import { GraphQLClient } from 'graphql-request';
import { Variables, ClientError } from 'graphql-request/dist/src/types';
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
        } catch (error) {
            const clientError = error as ClientError;

            clientError.message = JSON.stringify(clientError.response, null, 4);

            TaskTree.add('GraphQLClient: request error!').error(clientError, true);
        }

        return data ? data.repository : undefined;
    }
}
