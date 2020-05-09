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
    let baseBranch = {};
    const myToken = getInput('repo-token', { required: true });
    const artifactJSON = getInput('artifact-json');

    octokit = new GitHub(myToken);

    const pullRequest = await getPullRequest(context, octokit);

    const prBranch = {
      coverage: await getCodeCoverage(),
      name: pullRequest.head.ref,
    };

    baseBranch = {
      name: pullRequest.base.ref,
    };

    if (artifactJSON) {
      baseBranch.coverage = JSON.parse(artifactJSON).total;
    } else {
      await exec(`git checkout ${pullRequest.base.sha}`);

      baseBranch.coverage = await getCodeCoverage();
    }

    const body = buildOutputText(baseBranch, prBranch);

    try {
      await postComment(octokit, context, body);
    } catch (error) {
      console.log('Could not create a comment automatically.');

      console.log(`Here's the diff:\n${body}`);
    }
  } catch (error) {
    setFailed(error.message);
  }
}

export default run;
