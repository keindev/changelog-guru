import { Reader } from './reader';

const reader = new Reader();

reader.read().then(() => {
    process.exit(0);
});
