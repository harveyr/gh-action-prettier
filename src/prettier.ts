import { ExecOptions, execAndCapture } from '@harveyr/github-actions-kit'

export interface PrettierClientParam {
  cwd?: string
  npx?: boolean
  executablePath?: string
}

export class PrettierClient {
  constructor(public readonly param: PrettierClientParam) {}

  async runPrettier(args: string[], opt: ExecOptions = {}): Promise<string> {
    let command = ''
    if (this.param.npx) {
      command = 'npx'
      args = ['prettier'].concat(args)
    } else if (this.param.executablePath) {
      command = 'node'
      args = [this.param.executablePath].concat(args)
    } else {
      throw new Error('Neither npx option nor executable path were provided')
    }

    if (this.param.cwd) {
      opt.cwd = this.param.cwd
    }

    const result = await execAndCapture(command, args, opt)
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
