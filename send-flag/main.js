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

    // core.info(JSON.stringify(pr))
    sha = pr['data']['head']['sha']
    base = pr['data']['base']['repo']['full_name']

    core.info(`https://raw.githubusercontent.com/${base}/${sha}/Casks/iterm2.rb`)

    await axios.get(`https://raw.githubusercontent.com/${base}/${sha}/Casks/iterm2.rb`)
    .then(async function (response) {
      changed_file = response.data
      number_lines = changed_file.split('\n').length
      if (number_lines >= 10){
        core.info(`==> There were lines added to the file`)
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
          return;
        });
      }
      else {
        msg = `==> number of lines in the Casks/iterm2.rb file is smaller than 10`
        await client.rest.pulls.createReview({
          ...github.context.repo,
          pull_number: pullRequest,
          event: 'REQUEST_CHANGES',
          body: msg
        })
        core.setFailed(msg)
        return;
      }
    })
    .catch(function (error) {
      core.setFailed(error.response.data);
      return;
    });

  } catch (error) {
    core.setFailed(error.message)
    return;
  }
}

main()
