import { OptionDefinition, CommandLineOptions } from 'command-line-args';
import { ChangelogOptions } from '../../changelog';

export enum CommandType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    List = 'string[]',
}

export abstract class Command {
    public readonly name: string;
    public readonly description: string;
    public readonly alias?: string;

    protected changelogOptions: ChangelogOptions = {
        types: new Map(),
        exclusions: new Map(),
        provider: undefined,
        filePath: undefined,
        bump: undefined,
        branch: undefined,
    };

    private options: Map<string, [string, CommandType]> = new Map();

    public constructor(name: string, alias: string, description: string) {
        this.name = name;
        this.alias = alias;
        this.description = description;
    }

    public static getDefinition(name: string, type: CommandType, defaultOption?: boolean): OptionDefinition {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let typeCallback: ((str: string) => any) | undefined;
        let multiple = false;

        switch (type) {
            case CommandType.Boolean:
                typeCallback = Boolean;
                break;
            case CommandType.String:
                typeCallback = String;
                break;
            case CommandType.Number:
                typeCallback = Number;
                break;
            case CommandType.List:
                typeCallback = String;
                multiple = true;
                break;
            default:
                typeCallback = undefined;
                break;
        }

        return {
            name,
            multiple,
            defaultOption,
            type: typeCallback,
        };
    }

    public getDefinitions(): OptionDefinition[] {
        const definitions: OptionDefinition[] = [];

        this.options.forEach(([, type], name): void => {
            definitions.push(Command.getDefinition(name, type));
        });

        return definitions;
    }

    public getOptions(): [string, string, CommandType][] {
        const options: [string, string, CommandType][] = [];

        this.options.forEach(([description, type], name): void => {
            options.push([name, description, type]);
        });

        return options;
    }

    public hasOptions(): boolean {
        return !!this.options.size;
    }

    public isMatched(name: string): boolean {
        return name === this.name || name === this.alias;
    }

    public setOption(name: string, description: string, type: CommandType = CommandType.String): void {
        this.options.set(name, [description, type]);
    }

    public abstract async execute(options: CommandLineOptions): Promise<void>;
}
