import Octokit from '@octokit/rest';
import { GraphQLClient } from 'graphql-request';
import { Variables } from 'graphql-request/dist/src/types';
import { Task } from 'tasktree-cli/lib/task';
import { TaskTree } from 'tasktree-cli';
import { Author } from '../entities/author';
import { Commit } from '../entities/commit';
import { Provider, ServiceProvider, Release } from './provider';

const $tasks = TaskTree.tree();

/*
    const query = `
        query GetPackage($owner: String!, $repository: String!, $expression: String!) {
            repository(owner: $owner, name: $repository) {
                package: object(expression: $expression) {
                    ... on Blob {
                        text
                    }
                }
            }
        }
    `;

    const variables = {
        owner: 'keindev',
        repository: 'changelog-guru',
        expression: '131d1d42d6dfef92350bd506003ae808e9bbfd22:package.json',
    };

    try {
        const data = await graphQLClient.request(query, variables);
        console.log(JSON.stringify(data, undefined, 2));
    } catch (e) {
        task.error(e, true);
    }
*/

interface GitHubRequestOptions {
    variables?: Variables;
    task?: Task;
}

interface GitHubResponseRelease {
    release: {
        nodes: Release[];
    };
}

export class GitHubProvider extends Provider {
    private endpoint = 'https://api.github.com/graphql';
    private kit: Octokit;
    private authors: Map<number, Author> = new Map();
    private graphQLClient: GraphQLClient;
    private release: Release | undefined;

    public constructor(url: string) {
        super(ServiceProvider.GitHub, url);

        this.graphQLClient = new GraphQLClient(this.endpoint, {
            method: 'POST',
            headers: {
                authorization: `token ${process.env.GITHUB_TOKEN || ''}`,
            },
        });

        this.kit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN || ''}` });
    }

    public async getCommits(date: string, page: number): Promise<[Commit, Author][]> {
        const task = $tasks.add(`Loading page #${page.toString()}`);
        const { data: commits } = await this.kit.repos.listCommits({
            page,
            since: date,
            repo: this.repository,
            owner: this.owner,
            sha: this.branch,
            /* eslint-disable-next-line @typescript-eslint/camelcase */
            per_page: GitHubProvider.PAGE_SIZE,
        });

        task.complete(`Page #${page.toString()} loaded (${commits.length.toString()} commits)`);

        return commits.map((response): [Commit, Author] => this.parseResponse(response));
    }

    public async getLastRelease(): Promise<Release> {
        if (!this.release) {
            const response: GitHubResponseRelease = await this.requestData(/* GraphQL */ `
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

            if (response && response.release.nodes.length) {
                [this.release] = response.release.nodes;
            } else {
                this.release = {
                    tag: undefined,
                    date: new Date(0).toISOString(),
                };
            }
        }

        return this.release;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async requestData(query: string, options: GitHubRequestOptions = {}): Promise<any> {
        try {
            const { repository } = await this.graphQLClient.request(
                query,
                Object.assign(options.variables || {}, {
                    owner: this.owner,
                    repository: this.repository,
                })
            );

            return repository;
        } catch (err) {
            if (options && options.task) {
                options.task.error(err, true);
            } else {
                $tasks.add('GraphQLClient: request error!').error(err, true);
            }
        }

        return undefined;
    }

    private parseResponse(response: Octokit.ReposListCommitsResponseItem): [Commit, Author] {
        const author = this.parseAuthor(response.author);
        const commit = new Commit(response.sha, {
            timestamp: new Date(response.commit.author.date).getTime(),
            author: author.login,
            message: response.commit.message,
            url: response.html_url,
        });

        return [commit, author];
    }

    private parseAuthor(response: Octokit.ReposListCommitsResponseItemAuthor): Author {
        const { id, html_url: url, avatar_url: avatar, login } = response;
        const { authors } = this;

        if (!authors.has(id)) {
            authors.set(id, new Author(id, { login, url, avatar }));
        }

        return authors.get(id) as Author;
    }
}

/*
query GetCommitObjectId: String!, $repository: String!, $branch: String!) {
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
*/

/*
query GetCommits($owner: String!, $repository: String!, $branch: String!) {
  repository(owner: $owner, name: $repository) {
    ref(qualifiedName: $branch) {
      target {
        ... on Commit {
          id
          oid
          history(since: "1970-01-01T00:00:00.000Z", after: "be11a9e465627aebbc8222e9186a8fac43b4f3cd 0") {
            pageInfo {
              hasPreviousPage
              hasNextPage
              endCursor
            }
            edges {
              node {
                oid
                messageHeadline
                messageBody
                author {
                  user {
                    login
                  }
                  name
                  email
                  date
                }
              }
            }
          }
        }
      }
    }
  }
}
*/
