import { promises as fs } from 'fs';
import { execSync } from 'child_process';

import { Injectable } from '@nestjs/common';
import {
  PR_REVIEW_TEMPLATE_REPO,
  GIT_CLONE_URL,
  GIT_PUSH_URL_BASE,
  TEMP_DIR,
  TEMPLATE_MAIN_BRANCH,
  TEMPLATE_PR_BRANCH,
} from '../constants';

// We can't use the GH API to create a new repo with a pull request from a template.
// (See the readme for more details). Instead, we use this module to setup the PR review.
// It uses git CLI to setup the PR in a repository.
//
// HACK(Kev Cox): This module has an underlying assumption that the webserver it runs
// on has git installed locally. The Dockerfile handles this.
//
// How this works:
// Creates a temporary directory
// Clones a template GitHub repository
// Pushes the template's main & PR branch to a provided repo
// Destroys the temp directory
//
// Once this is done, the repo has code and branches set up correctly and we can
// go back to using the GH API finish creating our pull request.
@Injectable()
export class GithubCliService {
  async createTempDirectory() {
    try {
      // Check if the directory exists
      await fs.stat(TEMP_DIR);
      // If the directory exists, delete it
      await this.removeTempDirectory();
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    await fs.mkdir(TEMP_DIR);
  }

  async removeTempDirectory() {
    await fs.rm(TEMP_DIR, { recursive: true });
  }

  execAt(command, at) {
    // Save the current working directory
    const cwd = process.cwd();
    // Change to the "temp" directory
    process.chdir(at);

    let error;
    let cliOutput;
    try {
      cliOutput = execSync(command).toString();
    } catch (execError) {
      // store error and re-throw after we change back to
      // the original working directory
      error = execError;
    }
    // Change back to original directory
    process.chdir(cwd);

    if (error) throw error;
    return cliOutput;
  }

  async git(options) {
    const { command, at } = options;
    // Throws error if 'at' directory doesn't exist
    await fs.stat(at);
    this.execAt(`git ${command}`, at);
  }

  async pushTemplateBranchesTo(repoName) {
    await this.createTempDirectory();
    // from temp directory, git clone template repo
    await this.git({
      command: `clone ${GIT_CLONE_URL}`,
      at: TEMP_DIR,
    });
    // from cloned template directory, git switch main
    await this.git({
      command: `switch ${TEMPLATE_MAIN_BRANCH}`,
      at: `${TEMP_DIR}/${PR_REVIEW_TEMPLATE_REPO}`,
    });
    // from template directory, git push main to PR repo
    await this.git({
      command: `push ${GIT_PUSH_URL_BASE}${repoName}.git`,
      at: `${TEMP_DIR}/${PR_REVIEW_TEMPLATE_REPO}`,
    });
    // from template directory, git switch pr-branch
    await this.git({
      command: `switch ${TEMPLATE_PR_BRANCH}`,
      at: `${TEMP_DIR}/${PR_REVIEW_TEMPLATE_REPO}`,
    });
    // from template directory, git push pr-branch to PR repo
    await this.git({
      command: `push ${GIT_PUSH_URL_BASE}${repoName}.git`,
      at: `${TEMP_DIR}/${PR_REVIEW_TEMPLATE_REPO}`,
    });

    await this.removeTempDirectory();
  }
}
