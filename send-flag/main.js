const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')

async function main() {
  try {
    const token = core.getInput("token", { required: true })
    const email = core.getInput("email", { required: true })
    const webhook_secret = core.getInput("webhook_secret", { required: true })
    const pullRequest = core.getInput("pull_request", { required: true })

    const client = github.getOctokit(token)

    core.info(`==> Sending the flag to ${email}`)

    await axios.post('https://hook.integromat.com/588l1t77xciu4jwa1u99bosqlctoitbn', {
      email: email
    }, {
      headers: {
        "Authorization": webhook_secret
      }
    })
    .then(async function (response) {
      await client.rest.pulls.createReview({
        ...github.context.repo,
        pull_number: pullRequest,
        event: 'COMMENT',
        body: response.data
      })
      core.info(`==> ${response.data}`);
    })
    .catch(async function (error) {
      await client.rest.pulls.createReview({
        ...github.context.repo,
        pull_number: pullRequest,
        event: 'REQUEST_CHANGES',
        body: `Error: ${error.response.data}.\nCheck if the email: '${email}' is correct`
      })
      core.setFailed(error.response.data);
    });
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
