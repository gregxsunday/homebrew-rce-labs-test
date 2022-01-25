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

    core.info(`==> Checking if lines were added in the commit`)

    pr = await client.rest.pulls.get({
      ...github.context.repo,
      pull_number: pullRequest
    })

    core.info(JSON.stringify(pr))
    // sha = pr['head']['sha']
    // base = pr['base']['full_name']

    await axios.get(`https://raw.githubusercontent.com/${base}/${sha}/Casks/iterm2.rb`)
    .then(function (response) {
      core.info(response.data)
    })
    .catch(function (error) {
      core.setFailed(error.response.data);
    });

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
        body: `Success! Flag sent to the email: ${email}`
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
