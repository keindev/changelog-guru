import Author from '../entities/Author';
import Commit from '../entities/Commit';
import Key from '../utils/Key';

export default class Filter {
    public static authorsByLogin(authors: Map<string, Author>, rules: string[]): void {
        authors.forEach(author => {
            if (rules.indexOf(author.login) >= 0) author.ignore();
        });
    }

    public static commitsByType(commits: Map<string, Commit>, rules: string[]): void {
        commits.forEach(commit => {
            if (Key.inArray(commit.getTypeName(), rules)) commit.ignore();
        });
    }

    public static commitsByScope(commits: Map<string, Commit>, rules: string[]): void {
        commits.forEach(commit => {
            if (Key.inArray(commit.getScope(), rules)) commit.ignore();
        });
    }

    public static commitsBySubject(commits: Map<string, Commit>, rules: string[]): void {
        commits.forEach(commit => {
            if (rules.some(item => commit.getSubject().includes(item))) commit.ignore();
        });
    }
}
