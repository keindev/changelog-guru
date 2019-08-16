import { Author } from '../entities/author';
import { Commit } from '../entities/commit';
import Key from '../utils/key';

export class Filter {
    public static authorsByLogin(authors: Map<string, Author>, rules: string[]): void {
        authors.forEach((author): void => {
            if (rules.indexOf(author.login) >= 0) author.ignore();
        });
    }

    public static commitsByType(commits: Map<string, Commit>, rules: string[]): void {
        commits.forEach((commit): void => {
            if (Key.inArray(commit.getTypeName(), rules)) commit.ignore();
        });
    }

    public static commitsByScope(commits: Map<string, Commit>, rules: string[]): void {
        commits.forEach((commit): void => {
            if (Key.inArray(commit.getScope(), rules)) commit.ignore();
        });
    }

    public static commitsBySubject(commits: Map<string, Commit>, rules: string[]): void {
        commits.forEach((commit): void => {
            if (rules.some((item): boolean => commit.getSubject().includes(item))) commit.ignore();
        });
    }
}
