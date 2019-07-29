import { PluginOption, PluginOptionValue } from './typings/types';
import { ValueOf } from '../typings/types';

export class ConfigUtils {
    public static fillFromEnum<T>(options: PluginOption, enumeration: T, mapping: Map<ValueOf<T>, string>): void {
        Object.entries(options).forEach(
            ([name, value]: [string, PluginOption | PluginOption[] | PluginOptionValue | undefined]): void => {
                if (typeof value === 'string') {
                    const type = Object.values(enumeration).find((itemName): boolean => itemName === name);

                    if (value && type) mapping.set(type, value);
                }
            }
        );
    }
}
