import * as core from '@actions/core'
import { ExecOptions, captureOutput } from './exec'

const PRETTIER_PATH = 'node_modules/.bin/prettier'

export async function getVersion(): Promise<string> {
  const { stdout } = await captureOutput('node', [PRETTIER_PATH, '--version'], {
    failOnStdErr: true,
  })
  return stdout
}

export async function run(
  patterns: string[],
  opt: ExecOptions = {},
): Promise<string> {
  opt.failOnStdErr = false
  const args = [PRETTIER_PATH, '--list-different'].concat(patterns)
  const { stdout, stderr } = await captureOutput('node', args, opt)
  return stdout + stderr
}
