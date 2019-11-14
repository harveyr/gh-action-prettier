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
Object.defineProperty(exports, "__esModule", { value: true });
const github_actions_kit_1 = require("github-actions-kit");
const PRETTIER_PATH = 'node_modules/.bin/prettier';
function getVersion(opt = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        opt.failOnStdErr = true;
        const { stdout } = yield github_actions_kit_1.execAndCapture('node', [PRETTIER_PATH, '--version'], opt);
        return stdout;
    });
}
exports.getVersion = getVersion;
function run(patterns, opt = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        opt.failOnStdErr = false;
        const args = [PRETTIER_PATH, '--list-different'].concat(patterns);
        const { stdout, stderr } = yield github_actions_kit_1.execAndCapture('node', args, opt);
        return stdout + stderr;
    });
}
exports.run = run;
