import * as core from '@actions/core'
import * as prettier from './prettier'

// TODO: Use a TS import once this is fixed: https://github.com/actions/toolkit/issues/199
// import * as github from '@actions/github'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const github = require('@actions/github')

const { GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_WORKSPACE } = process.env

interface Annotation {
  annotation_level: 'notice' | 'warning' | 'failure'
  end_column?: number
  end_line: number
  message: string
  path: string
  raw_details?: string
  start_column?: number
  start_line: number
  title?: string
}

async function postCheckRun(flaggedFiles: string[]): Promise<void> {
  if (!GITHUB_WORKSPACE) {
    return core.setFailed(
      'GITHUB_WORKSPACE not set. This should happen automatically.',
    )
  }
  if (!GITHUB_REPOSITORY) {
    return core.setFailed('GITHUB_REPOSITORY was not set')
  }
  if (!GITHUB_SHA) {
    return core.setFailed('GITHUB_SHA was not set')
  }

  const githubToken = core.getInput('github-token')
  if (!githubToken) {
    return core.setFailed('github-token is required')
  }
  const client = new github.GitHub(githubToken)

  const [owner, repo] = GITHUB_REPOSITORY.split('/')
  core.debug(`Found Github owner ${owner}, repo ${repo}`)

  const annotations: Annotation[] = []
  for (const path of flaggedFiles) {
    annotations.push({
      path,
      // eslint-disable-next-line @typescript-eslint/camelcase
      start_line: 1,
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_line: 1,
      // eslint-disable-next-line @typescript-eslint/camelcase
      annotation_level: 'failure',
      message: 'Prettier would reformat this file',
    })
  }

  await client.checks.create({
    name: 'Prettier',
    conclusion: flaggedFiles.length === 0 ? 'success' : 'failure',
    // eslint-disable-next-line @typescript-eslint/camelcase
    head_sha: GITHUB_SHA,
    owner,
    repo,
    output: {
      title: 'Prettier',
      summary: flaggedFiles.length ? 'Flagged files' : 'No flagged files',
      text: flaggedFiles.join('\n'),
      annotations,
    },
  })
}

async function run(): Promise<void> {
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
  await prettier.getVersion()

  const output = await prettier.run(patterns, {
    cwd: core.getInput('working-directory'),
  })
  const flaggedFiles: string[] = output
    .trim()
    .split('\n')
    .map(f => {
      return f.trim()
    })
    .filter(f => {
      return f.length > 0
    })

  await postCheckRun(flaggedFiles)

  if (flaggedFiles.length) {
    core.setFailed(`Prettier would change ${flaggedFiles.length} files`)
  }
}

run().catch(err => {
  console.log('FIXME: caught error', err)
  core.setFailed(`${err}`)
})
