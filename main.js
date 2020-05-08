import { getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { GitHub, context } from '@actions/github';

import { getPullRequest } from './src/utils/get-pull-request';
import { getCodeCoverage } from './src/utils/get-code-coverage';
import { postComment } from './src/utils/post-comment';
import { buildOutputText } from './src/utils/build-output-text';

let octokit;

async function run() {
  try {
    const myToken = getInput('repo-token', { required: true });

    octokit = new GitHub(myToken);

    const pullRequest = await getPullRequest(context, octokit);

    const prBranch = {
      coverage: await getCodeCoverage(),
      name: pullRequest.head.ref,
    };

    await exec(`git checkout ${pullRequest.base.sha}`);

    const baseBranch = {
      coverage: await getCodeCoverage(),
      name: pullRequest.base.ref,
    };

    const body = buildOutputText(baseBranch, prBranch);

    try {
      await postComment(octokit, context, body);
    } catch (error) {
      console.log('Could not create a comment automatically.');

      console.log(`Here's the diff:\n\n
      ${body}`);
    }
  } catch (error) {
    setFailed(error.message);
  }
}

export default run;
