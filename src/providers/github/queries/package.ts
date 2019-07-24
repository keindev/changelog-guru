import { PackageJson } from 'read-pkg';
import { Query } from './query';

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

export class PackageQuery extends Query {
    public async getPackageChanges(date: string): Promise<GitHubResponsePackageCommit | undefined> {
        const response: GitHubResponsePackageNodes = await this.execute(
            /* GraphQL */ `
                query GetPackageChangeCommits(
                    $owner: String!
                    $repository: String!
                    $branch: String!
                    $date: GitTimestamp!
                ) {
                    repository(owner: $owner, name: $repository) {
                        branch: ref(qualifiedName: $branch) {
                            target {
                                ... on Commit {
                                    history(path: "package.json", until: $date, first: 2) {
                                        commits: nodes {
                                            hash: oid
                                        }
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

        return response.branch.target.history.commits.pop();
    }

    public async getPackageFrom(commit: GitHubResponsePackageCommit): Promise<PackageJson> {
        const response: GitHubResponsePackageData = await this.execute(
            /* GraphQL */ `
                query GetPackage($owner: String!, $repository: String!, $expression: String!) {
                    repository(owner: $owner, name: $repository) {
                        package: object(expression: $expression) {
                            ... on Blob {
                                text
                            }
                        }
                    }
                }
            `,
            {
                expression: `${commit.hash}:package.json`,
            }
        );

        return JSON.parse(response.package.text);
    }
}
