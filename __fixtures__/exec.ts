import type * as actExec from '@actions/exec'
import { jest } from '@jest/globals'

export const exec = jest.fn<typeof actExec.exec>()
