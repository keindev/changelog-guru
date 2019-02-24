import Reader from './io/reader';
import Process from './utils/process';

const reader = new Reader();

reader.read().then(() => {
    Process.exit(Process.EXIT_CODE_SUCCES);
});
