import { Writer } from '../writer';

export class MockWriter extends Writer {
    private __data: string | undefined;

    public __filePath(): string {
        return this.filePath;
    }

    public __getData(): string | undefined {
        return this.__data;
    }

    // eslint-disable-next-line class-methods-use-this
    protected async writeFile(data: string): Promise<void> {
        this.__data = data;

        await Promise.resolve();
    }
}
