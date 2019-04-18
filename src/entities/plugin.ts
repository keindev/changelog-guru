import Config from '../io/config';
import Commit from './commit';

export default abstract class Plugin {
    public abstract async load(config: Config): Promise<void>;
    public abstract async parse(commit: Commit): Promise<void>;
}
