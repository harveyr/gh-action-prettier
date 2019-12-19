import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'
import { PrettierClient } from './prettier'

async function postCheckRun(flaggedFiles: string[]): Promise<void> {
  await kit.postCheckRun({
    githubToken: core.getInput('github-token'),
    name: 'Prettier',
    conclusion: flaggedFiles.length === 0 ? 'success' : 'failure',
    summary: flaggedFiles.length ? 'Flagged files' : 'No flagged files',
    text: flaggedFiles.join('\n'),
    annotations: flaggedFiles.map(path => {
      return {
        path,
        startLine: 1,
        level: 'failure',
        message: 'Prettier would reformat this file',
      }
    }),
  })
}

async function run(): Promise<void> {
  const executablePath = core.getInput('prettier_path')
  const cwd = core.getInput('working_directory')
  const client = new PrettierClient({ executablePath, cwd })

  const patterns = core
    .getInput('patterns')
    .split(' ')
    .map(p => {
      return p.trim()
    })
    .filter(p => {
      return p.length > 0
    })

  // Cause the version to be printed to the logs. We want to make sure we're
  // using the version in the repo under test, not the one from this repo.
  await client.getVersion()

  let flaggedFiles: string[] = []
  if (patterns.length) {
    const output = await client.run(patterns)
    flaggedFiles = output
      .trim()
      .split('\n')
      .map(f => {
        return f.trim()
      })
      .filter(f => {
        return f.length > 0
      })
  }

  await postCheckRun(flaggedFiles)
}

run().catch(err => {
  core.setFailed(`${err}`)
})
