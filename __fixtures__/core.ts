import type * as actCore from '@actions/core'
import { jest } from '@jest/globals'

export const debug = jest.fn<typeof actCore.debug>()
export const error = jest.fn<typeof actCore.error>()
export const info = jest.fn<typeof actCore.info>()
export const getInput = jest.fn<typeof actCore.getInput>()
export const setOutput = jest.fn<typeof actCore.setOutput>()
export const setFailed = jest.fn<typeof actCore.setFailed>()
export const warning = jest.fn<typeof actCore.warning>()
