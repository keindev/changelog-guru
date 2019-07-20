import Writer from '../../src/io/writer';

export class MockWriter extends Writer {
    public __filePath(): string {
        return this.filePath;
    }

    public __getData(): string {
        return this.getData();
    }

    // eslint-disable-next-line class-methods-use-this
    protected async writeFile(): Promise<void> {
        await Promise.resolve();
    }
}
