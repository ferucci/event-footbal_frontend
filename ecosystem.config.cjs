const dotenv = require("dotenv")
const path = require("node:path")
dotenv.config({ path: path.join(__dirname, ".env.deploy") })

const {
  DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_REF, DEPLOY_REPO, APP_PORT
} = process.env;

module.exports = {
  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: DEPLOY_REPO,
      path: DEPLOY_PATH,
      'post-deploy': 'npm ci && npm run build',
    },
  },
}
