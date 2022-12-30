import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000

export const CLI_USERNAME = process.env.GITHUB_USERNAME;
export const ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

export const ORG_NAME = 'Clipboard-recruiting';

export const PR_REVIEW_TEMPLATE_REPO = 'candidate-pr-review-base';
export const TEMPLATE_REPO_URL =
  'github.com/Clipboard-recruiting/candidate-pr-review-base.git';
export const TEMPLATE_MAIN_BRANCH = 'main';
export const TEMPLATE_PR_BRANCH = 'add-rating-block';

export const CANDITATE_PR_REVIEW_REPO_PREFIX = 'candidate-pr-review';

export const GIT_CLONE_URL = `https://${CLI_USERNAME}:${ACCESS_TOKEN}@github.com/${ORG_NAME}/${PR_REVIEW_TEMPLATE_REPO}.git`;
export const GIT_PUSH_URL_BASE = `https://${CLI_USERNAME}:${ACCESS_TOKEN}@github.com/${ORG_NAME}/`;

export const TEMP_DIR = 'temp';
