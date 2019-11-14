import * as core from '@actions/core'

import { CheckRunAbridged } from './types'

// TODO: Use a TS import once this is fixed: https://github.com/actions/toolkit/issues/199
// import * as github from '@actions/github'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const github = require('@actions/github')

export const { GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_WORKSPACE } = process.env

export interface ParsedRepo {
  repo: string
  owner: string
}

export function parseRepo(s?: string): ParsedRepo {
  if (!s) {
    if (!GITHUB_REPOSITORY) {
      throw new Error('GITHUB_REPOSITORY is empty')
    }
    s = GITHUB_REPOSITORY
  }
  const [owner, repo] = s.split('/')
  core.debug(`Found Github owner ${owner}, repo ${repo}`)
  return { owner, repo }
}

export function getSha(): string {
  if (!GITHUB_SHA) {
    throw new Error('GITHUB_SHA is empty')
  }
  return GITHUB_SHA
}

export async function postCheckRun(data: CheckRunAbridged): Promise<unknown> {
  const { owner, repo } = parseRepo()
  const { githubToken, name, conclusion, summary, text, annotations } = data

  if (!githubToken) {
    throw new Error('No Github token provided')
  }
  const client = new github.GitHub(githubToken)

  return client.checks.create({
    name,
    conclusion,
    // eslint-disable-next-line @typescript-eslint/camelcase
    head_sha: getSha(),
    owner,
    repo,
    output: {
      title: name,
      summary: summary ? summary : 'Output',
      text,
      annotations,
    },
  })
}
