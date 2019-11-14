"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const kit = __importStar(require("@harveyr/github-actions-kit"));
const prettier = __importStar(require("./prettier"));
function postCheckRun(flaggedFiles) {
    return __awaiter(this, void 0, void 0, function* () {
        const annotations = flaggedFiles.map(path => {
            return {
                path,
                // eslint-disable-next-line @typescript-eslint/camelcase
                start_line: 1,
                // eslint-disable-next-line @typescript-eslint/camelcase
                end_line: 1,
                // eslint-disable-next-line @typescript-eslint/camelcase
                annotation_level: 'failure',
                message: 'Prettier would reformat this file',
            };
        });
        kit.postCheckRun({
            githubToken: core.getInput('github-token'),
            name: 'Prettier',
            conclusion: flaggedFiles.length === 0 ? 'success' : 'failure',
            summary: flaggedFiles.length ? 'Flagged files' : 'No flagged files',
            text: flaggedFiles.join('\n'),
            annotations,
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = core.getInput('working-directory');
        const patterns = core
            .getInput('patterns')
            .split(' ')
            .map(p => {
            return p.trim();
        })
            .filter(p => {
            return p.length > 0;
        });
        // Cause the version to be printed to the logs. We want to make sure we're
        // using the version in the repo under test, not the one from this repo.
        yield prettier.getVersion({ cwd });
        let flaggedFiles = [];
        if (patterns.length) {
            const output = yield prettier.run(patterns, { cwd });
            flaggedFiles = output
                .trim()
                .split('\n')
                .map(f => {
                return f.trim();
            })
                .filter(f => {
                return f.length > 0;
            });
        }
        yield postCheckRun(flaggedFiles);
    });
}
run().catch(err => {
    core.setFailed(`${err}`);
});
