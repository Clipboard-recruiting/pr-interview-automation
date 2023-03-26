import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import {
  ACCESS_TOKEN,
  ORG_NAME,
  TEMPLATE_PR_BRANCH,
  TEMPLATE_MAIN_BRANCH,
  CANDITATE_PR_REVIEW_REPO_PREFIX,
} from '../constants';

export interface Repo {
  id: string;
  name: string;
  archived: boolean;
  html_url: string;
  private: boolean;
  invites?: Collaborator[];
  collaborators?: Collaborator[];
}

interface Collaborator {
  id: string;
  login: string;
  role_name?: string;
}

/************ Utils ************/
function formatRepo(githubRepo): Repo {
  const { id, name, html_url, archived } = githubRepo;
  return {
    id,
    name,
    // Can't follow the normal destructuring patten here because
    // 'private' is a reserved keyword & throws a ts compilation error
    private: githubRepo.private,
    html_url,
    archived,
  };
}

function formatCollaborator(githubCollaborator): Collaborator {
  const { id, login, role_name } = githubCollaborator;
  return {
    id,
    login,
    role_name,
  };
}

function formatInvite(githubInvite): Collaborator {
  return formatCollaborator(githubInvite.invitee);
}

function isCandidatePrReviewRepo(repo) {
  const hasCandidatePrReviewNaming = repo.name.includes(
    CANDITATE_PR_REVIEW_REPO_PREFIX,
  );
  const isTemplate =
    repo.name.includes('template') || repo.name.includes('base');

  return hasCandidatePrReviewNaming && !isTemplate;
}

@Injectable()
export class GithubApiService {
  octokit = new Octokit({
    auth: ACCESS_TOKEN,
  });

  repos = {
    octokit: this.octokit,
    async create(repoName): Promise<Repo> {
      const response = await this.octokit.rest.repos.createInOrg({
        org: ORG_NAME,
        name: repoName,
        private: true,
      });

      return formatRepo(response.data);
    },
    async archive(repoName) {
      const response = await this.octokit.rest.repos.update({
        owner: ORG_NAME,
        repo: repoName,
        archived: true,
      });

      return formatRepo(response.data);
    },
    async listPrInterviewRepos() {
      const response = await this.octokit.rest.repos.listForOrg({
        org: ORG_NAME,
        sort: 'created_at',
        direction: 'desc',
        per_page: 30,
      });
      const repos = response.data;
      const candidatePrReviewRepos = repos.filter((repo) =>
        isCandidatePrReviewRepo(repo),
      );
      return candidatePrReviewRepos.map((repo) => formatRepo(repo));
    },
  };

  pullRequests = {
    octokit: this.octokit,
    async createInterviewPr(repoName) {
      const response = await this.octokit.rest.pulls.create({
        owner: ORG_NAME,
        repo: repoName,
        title: 'Add worker rate and block',
        head: TEMPLATE_PR_BRANCH,
        base: TEMPLATE_MAIN_BRANCH,
        body: `Adds a "rating" column to the "ShiftAssignment" table, allowing workers to be rated by the facility they work at.\nAdds a new "BlockedWorker" table to keep track of workers who have been blocked from working at a particular facility.\nUpdates controllers / services to support new rating & block features.`
      });
      return response.data;
    },
  };

  collaborators = {
    octokit: this.octokit,
    async invite(repoName, collaboratorUsername) {
      const response = await this.octokit.rest.repos.addCollaborator({
        owner: ORG_NAME,
        repo: repoName,
        username: collaboratorUsername,
      });

      const invitee = response.data.invitee;
      return formatCollaborator(invitee);
    },
    async remove(repoName, collaboratorUsername) {
      await this.octokit.rest.repos.removeCollaborator({
        owner: ORG_NAME,
        repo: repoName,
        username: collaboratorUsername,
      });
    },
    async list(repoName) {
      const response = await this.octokit.rest.repos.listCollaborators({
        owner: ORG_NAME,
        repo: repoName,
        affiliation: 'outside',
      });

      return response.data.map((collaborator) =>
        formatCollaborator(collaborator),
      );
    },
  };

  invites = {
    octokit: this.octokit,
    async list(repoName) {
      const response = await this.octokit.rest.repos.listInvitations({
        owner: ORG_NAME,
        repo: repoName,
      });

      const invites = response.data;
      return invites.map((invite) => formatInvite(invite));
    },
  };
}
