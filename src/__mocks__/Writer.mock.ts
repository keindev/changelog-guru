import Writer from '../Writer';

export default class MockWriter extends Writer {
  private __data: string | undefined;

  __filePath(): string {
    return this.filePath;
  }

  __getData(): string | undefined {
    return this.__data;
  }

  protected async writeFile(data: string): Promise<void> {
    this.__data = data;

    await Promise.resolve();
  }
}
