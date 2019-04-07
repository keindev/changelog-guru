export default interface Package {
    version: string;
    repository: {
        type: string,
        url: string,
    };
}
