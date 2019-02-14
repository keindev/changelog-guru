const Reader = require('./src/reader');
const reader = new Reader();

reader.init();
reader.parse().then(() => {
    process.exit(0);
});
