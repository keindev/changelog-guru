import { MockState } from '../__mocks__/entities/state.mock';
import { ConfigLoader } from '../../src/config/config-loader';
import { SectionPluginOptions } from '../../src/plugins/implementations/section/typings/types';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';
import SectionPlugin from '../../src/plugins/implementations/section/section';

describe('SectionPlugin', (): void => {
    const $context = new MockState();
    const $loader = new ConfigLoader();
    const $plugin = new SectionPlugin($context);
    const $author = new Author('keindev', {
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });

    beforeAll((done): void => {
        $loader.load().then((config): void => {
            const options = config.getPlugin('section');

            if (options) {
                $plugin.init(options as SectionPluginOptions).then((): void => {
                    done();
                });
            } else {
                throw new Error('SectionPlugin config not found!');
            }
        });
    });

    it('Default', (): void => {
        expect($context.getSections().length).toBe(7);
        expect($context.findSection('Features')).toBeDefined();
        expect($context.findSection('Improvements')).toBeDefined();
        expect($context.findSection('Bug Fixes')).toBeDefined();
        expect($context.findSection('Internal changes')).toBeDefined();
        expect($context.findSection('Performance Improvements')).toBeDefined();
        expect($context.findSection('Code Refactoring')).toBeDefined();
        expect($context.findSection('Reverts')).toBeDefined();
    });

    it('Parse commits', (done): void => {
        const section = $context.findSection('Bug Fixes');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                header: 'fix: subject',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: $author,
            });

            $plugin.parse(commit).then((): void => {
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });
});
