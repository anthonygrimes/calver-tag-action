import * as core from '@actions/core'
import { exec } from '@actions/exec'
import {
  formatTag,
  getCurrentDateFormatted,
  incrementTagMicroValue,
  isTagInExpectedFormat,
  isTagInLaterYearOrMonth,
  isTagInSameYearAndMonth
} from './utils/utils.js'

async function executeGitTag(tagValue: string) {
  core.info(`Attempting to tag with tag value ${tagValue}`)
  const exitCode = await exec('git', ['tag', tagValue], {
    ignoreReturnCode: true
  })

  if (exitCode !== 0) {
    throw new Error(
      `There was an error whilst applying the git tag ${tagValue}`
    )
  }
}

async function executeGitPushWithTag(tag: string) {
  core.info('Attempting to push')
  const exitCode = await exec('git', ['push', '-f', 'origin', tag], {
    ignoreReturnCode: true
  })

  if (exitCode !== 0) {
    throw new Error(`There was an error whilst pushing`)
  }
}

export async function run(): Promise<void> {
  try {
    let latestTag = ''

    const command =
      "git for-each-ref --sort=-committerdate --format '%(refname:short)' refs/tags | head -n1"
    await exec('bash', ['-c', command], {
      listeners: {
        stdout: (data: Buffer) => {
          latestTag += data.toString()
        }
      },
      ignoreReturnCode: true
    })

    const formattedLatestTag = formatTag(latestTag)

    let updatedTag = ''

    if (formattedLatestTag === '') {
      core.info('No tags found. Generating new tag.')
      updatedTag = getCurrentDateFormatted(0)
    } else if (!isTagInExpectedFormat(formattedLatestTag)) {
      core.info('No validly formatted tags found. Generating new tag.')
      updatedTag = getCurrentDateFormatted(0)
    } else if (isTagInLaterYearOrMonth(formattedLatestTag)) {
      core.warning(
        `Latest tag "${formattedLatestTag}" appears to be in later year or month. Doing nothing.`
      )
    } else if (isTagInSameYearAndMonth(formattedLatestTag)) {
      core.info(
        `Latest tag "${formattedLatestTag}" is in current date range. Incrementing micro only.`
      )
      updatedTag = incrementTagMicroValue(formattedLatestTag)
    } else {
      updatedTag = getCurrentDateFormatted(0)
    }

    if (updatedTag !== '') {
      await executeGitTag(updatedTag)
      await executeGitPushWithTag(updatedTag)

      core.setOutput('version', updatedTag)
      core.info(`Successfully pushed new tag ${updatedTag}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
