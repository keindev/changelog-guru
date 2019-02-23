import Reader from './reader';
import Process from './process';

const reader = new Reader();

reader.read().then(() => {
    Process.exit(Process.EXIT_CODE_SUCCES);
});
