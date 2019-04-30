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
        const state: State = new State();
        const date: string = await this.provider.getLatestReleaseDate();
        const task = $process.task('Getting release state information');

        task.log(`Last release date: ${chalk.bold(date)}`);
        await this.readCommits(date, state);
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
