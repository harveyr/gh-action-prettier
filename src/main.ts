import * as core from '@actions/core'
import * as prettier from './prettier'

// TODO: Use a TS import once this is fixed: https://github.com/actions/toolkit/issues/199
// import * as github from '@actions/github'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const github = require('@actions/github')

const { GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_WORKSPACE } = process.env

// It appears the setup-node step adds a "problem matcher" that will catch lints
// and create annotations automatically!
const POST_ANNOTATIONS = false

function getAnnotationLevel(
  severity: string,
): 'notice' | 'warning' | 'failure' {
  if (severity === 'error') {
    return 'failure'
  }
  // not sure what the actual string is yet
  if (severity.indexOf('warn') === 0) {
    return 'warning'
  }
  return 'notice'
}

async function postCheckRun(success: boolean, text: string): Promise<void> {
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

  await client.checks.create({
    name: 'Prettier',
    conclusion: success ? 'success' : 'failure',
    // eslint-disable-next-line @typescript-eslint/camelcase
    head_sha: GITHUB_SHA,
    owner,
    repo,
    output: {
      title: 'Prettier',
      summary: `Output`,
      text,
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

  const success = output.trim().length === 0
  postCheckRun(success, output)
  if (output.length) {
    core.setFailed('Prettier would change files')
  }
}

run().catch(err => {
  core.error(err)
  core.setFailed(`${err}`)
})
