import { exportVariable } from '@actions/core';
import { exec } from '@actions/exec';
import { existsSync, promises as fs } from 'fs';

async function getContent(filePath, encoding = 'utf8') {
  return fs.readFile(filePath, { encoding });
}

export async function getCodeCoverage() {
  if (existsSync('yarn.lock')) {
    await exec('yarn --frozen-lockfile');
  } else {
    await exec('npm ci');
  }

  exportVariable('COVERAGE', 'TRUE');

  await exec('npx ember t');

  const contents = await getContent('./coverage/coverage-summary.json');

  const coverage = JSON.parse(contents).total;

  console.log('COVERAGE is generated');
  console.log(coverage);

  return coverage;
}
