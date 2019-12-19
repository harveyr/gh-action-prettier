import { ExecOptions, execAndCapture } from '@harveyr/github-actions-kit'

export interface PrettierClientParam {
  cwd?: string
  executablePath: string
}

export class PrettierClient {
  constructor(public readonly param: PrettierClientParam) {}

  async runPrettier(args: string[], opt: ExecOptions = {}): Promise<string> {
    if (this.param.cwd) {
      opt.cwd = this.param.cwd
    }
    args = [this.param.executablePath].concat(args)

    const result = await execAndCapture('node', args, opt)
    return result.stdout + result.stderr
  }

  async getVersion(): Promise<string> {
    return this.runPrettier(['--version'], { failOnStdErr: true })
  }

  async run(patterns: string[]): Promise<string> {
    return this.runPrettier(['--list-different'].concat(patterns), {
      failOnStdErr: false,
    })
  }
}
