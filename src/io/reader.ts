import chalk from 'chalk';
import Provider from '../providers/provider';
import State from '../entities/state';
import Process from '../utils/process';

const $process = Process.getInstance();

export default class Reader {
    private provider: Provider;

    public constructor(provider: Provider) {
        this.provider = provider;
    }

    public async read(): Promise<State> {
        const task = $process.task('Getting release state information');
        const state: State = new State();
        const date: string = await this.provider.getLatestReleaseDate();
        const version: string | undefined = await this.provider.getVersion();

        task.log(`Last release date: ${chalk.bold(date)}`);
        task.log(`Last release version: ${chalk.bold(version || '-')}`);
        await this.readCommits(date, state);

        if (version) state.setVersion(version);
        task.complete(`Release information`);

        return state;
    }

    private async readCommits(date: string, state: State, pageNumber: number = 0): Promise<void> {
        const commits = await this.provider.getCommits(date, pageNumber + 1);
        const { length } = commits;

        if (length) {
            commits.forEach(
                (entities): void => {
                    state.addCommit(...entities);
                }
            );

            if (length === Provider.PAGE_SIZE) {
                await this.readCommits(date, state, pageNumber);
            }
        }
    }
}
