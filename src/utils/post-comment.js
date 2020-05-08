import { getPullRequest } from './get-pull-request';

export async function postComment(octokit, context, body) {
  const pullRequest = await getPullRequest(context, octokit);

  await octokit.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pullRequest.number,
    body,
  });
}
