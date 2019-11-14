import { ExecOptions, execAndCapture } from '@harveyr/github-actions-kit'

const PRETTIER_PATH = 'node_modules/.bin/prettier'

export async function getVersion(opt: ExecOptions = {}): Promise<string> {
  opt.failOnStdErr = true
  const { stdout } = await execAndCapture(
    'node',
    [PRETTIER_PATH, '--version'],
    opt,
  )
  return stdout
}

export async function run(
  patterns: string[],
  opt: ExecOptions = {},
): Promise<string> {
  opt.failOnStdErr = false
  const args = [PRETTIER_PATH, '--list-different'].concat(patterns)
  const { stdout, stderr } = await execAndCapture('node', args, opt)
  return stdout + stderr
}
