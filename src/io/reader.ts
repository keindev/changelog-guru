import Provider from '../providers/provider';
import State from '../entities/state';

export default class Reader {
    private provider: Provider;

    public constructor(provider: Provider) {
        this.provider = provider;
    }

    public async read(): Promise<State> {
        const state: State = new State();
        const date: string = await this.provider.getLatestReleaseDate();

        await this.readCommits(date, state);

        return state;
    }

    private async readCommits(date: string, state: State, pageNumber: number = 0): Promise<void> {
        const commits = await this.provider.getCommits(date, pageNumber + 1);
        const { length } = commits;

        if (length) {
            commits.forEach((entities): void => {
                state.addCommit(...entities);
            });

            if (length === Provider.PAGE_SIZE) {
                await this.readCommits(date, state, pageNumber);
            }
        }
    }
}
