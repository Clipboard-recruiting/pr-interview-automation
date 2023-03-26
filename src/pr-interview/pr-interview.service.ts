import { Injectable } from '@nestjs/common';
import { GithubCliService } from '../github-cli/github-cli.service';
import { GithubApiService } from '../github-api/github-api.service';
import { CANDITATE_PR_REVIEW_REPO_PREFIX } from '../constants';

/************ Utils ************/
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getNextIncrementingRepoId(repos) {
  const existingNumericalIds = repos.map((repo) => {
    const numericalStringMatch = repo.name.match(/\d+/);
    return numericalStringMatch ? parseInt(numericalStringMatch[0]) : 0;
  });

  const largestId = Math.max(0, ...existingNumericalIds);
  return largestId + 1;
}

@Injectable()
export class PrInterviewService {
  constructor(
    private githubCliService: GithubCliService,
    private githubApiService: GithubApiService,
  ) {}

  // Fetch PR interview repos, add collaborators and invites to repo
  // data.
  async list() {
    const repos = await this.githubApiService.repos.listPrInterviewRepos();

    const listCollaboratorRequests = repos.map((repo) =>
      this.githubApiService.collaborators.list(repo.name),
    );
    const collaborators = await Promise.all(listCollaboratorRequests);
    repos.forEach((repo, index) => {
      repo.collaborators = collaborators[index];
    });

    const listInvitesRequests = repos.map((repo) =>
      this.githubApiService.invites.list(repo.name),
    );
    const invites = await Promise.all(listInvitesRequests);
    repos.forEach((repo, index) => {
      repo.invites = invites[index];
    });

    return repos;
  }

  async create(username) {
    // Create a new repo
    const repos = await this.githubApiService.repos.listPrInterviewRepos();
    const nextRepoId = getNextIncrementingRepoId(repos);
    const candidateRepoName = `${CANDITATE_PR_REVIEW_REPO_PREFIX}-${nextRepoId}`;

    const candidateRepo = await this.githubApiService.repos.create(
      candidateRepoName,
    );

    // HACK(KevCox): For whatever reason, I was seeing cases where we would create
    // a repo and, if we tried to operate on the repo immediately
    // after, we would get an error that the repo doesn't exist. Adding
    // a sleep here solved the problem. My best guess is there is some async
    // communication happening inside Github and it can take a small amount
    // of time for the new repo to 'propagate' internally.
    await sleep(1000);

    // Clone the template locally and push its branches to the repo
    await this.githubCliService.pushTemplateBranchesTo(candidateRepo.name);

    // Create a pull request on the interview repo
    await this.githubApiService.pullRequests.createInterviewPr(
      candidateRepo.name,
    );

    // Invite candidate username to repo
    const invitee = await this.githubApiService.collaborators.invite(
      candidateRepo.name,
      username,
    );
    candidateRepo.invites = [invitee];

    return candidateRepo;
  }

  async delete(repoName) {
    const collaborators = await this.githubApiService.collaborators.list(
      repoName,
    );
    for await (const collaborator of collaborators) {
      await this.githubApiService.collaborators.remove(
        repoName,
        collaborator.login,
      );
    }

    const archivedRepo = await this.githubApiService.repos.archive(repoName);
    return archivedRepo;
  }
}
