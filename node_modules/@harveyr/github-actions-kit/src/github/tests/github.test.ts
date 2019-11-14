import { parseRepo } from '../client'

test('parse repo', () => {
  const { owner, repo } = parseRepo('harveyr/my-repo')
  expect(owner).toEqual('harveyr')
  expect(repo).toEqual('my-repo')
})
