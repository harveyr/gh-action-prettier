import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'
import * as prettier from './prettier'

async function postCheckRun(flaggedFiles: string[]): Promise<void> {
  kit.postCheckRun({
    githubToken: core.getInput('github-token'),
    name: 'Prettier',
    conclusion: flaggedFiles.length === 0 ? 'success' : 'failure',
    summary: flaggedFiles.length ? 'Flagged files' : 'No flagged files',
    text: flaggedFiles.join('\n'),
    annotations: flaggedFiles.map(path => {
      return {
        path,
        // eslint-disable-next-line @typescript-eslint/camelcase
        start_line: 1,
        // eslint-disable-next-line @typescript-eslint/camelcase
        end_line: 1,
        // eslint-disable-next-line @typescript-eslint/camelcase
        annotation_level: 'failure',
        message: 'Prettier would reformat this file',
      }
    }),
  })
}

async function run(): Promise<void> {
  const cwd = core.getInput('working-directory')
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
  await prettier.getVersion({ cwd })

  let flaggedFiles: string[] = []
  if (patterns.length) {
    const output = await prettier.run(patterns, { cwd })
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
