import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as exec from '../__fixtures__/exec.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/exec', () => exec)

const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-02-07T12:00:00Z'))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  // happy paths

  it('when no tags exist in project, generate as today', async () => {
    // given
    exec.exec.mockImplementation(async (command, _args, options) => {
      if (command === 'bash') {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from(''))
        }
        if (options?.listeners?.stderr) {
          options.listeners.stderr(Buffer.from(''))
        }
        // simulates a real fatal exit code
        return 128
      }

      return 0
    })

    // when
    await run()

    // then
    expect(exec.exec).toHaveBeenNthCalledWith(
      1,
      'bash',
      [
        '-c',
        `git for-each-ref --sort=-committerdate --format '%(refname:short)' refs/tags | head -n1`
      ],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      2,
      'git',
      ['tag', '2025.2.0'],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      3,
      'git',
      ['push', '-f', 'origin', '2025.2.0'],
      expect.any(Object)
    )

    expect(core.setOutput).toHaveBeenCalledWith('version', '2025.2.0')
  })

  it('when no tags exists in YYYY.MM.MICRO format, generate as today', async () => {
    // given
    exec.exec.mockImplementation(async (command, _args, options) => {
      if (command === 'bash') {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from('v1.0.0'))
        }
        if (options?.listeners?.stderr) {
          options.listeners.stderr(Buffer.from(''))
        }
        return 0
      }

      return 0
    })

    // when
    await run()

    // then
    expect(exec.exec).toHaveBeenNthCalledWith(
      1,
      'bash',
      [
        '-c',
        `git for-each-ref --sort=-committerdate --format '%(refname:short)' refs/tags | head -n1`
      ],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      2,
      'git',
      ['tag', '2025.2.0'],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      3,
      'git',
      ['push', '-f', 'origin', '2025.2.0'],
      expect.any(Object)
    )

    expect(core.setOutput).toHaveBeenCalledWith('version', '2025.2.0')
  })

  it('when tags exists in YYYY.MM.MICRO format for earlier date, generate as today', async () => {
    // given
    exec.exec.mockImplementation(async (command, _args, options) => {
      if (command === 'bash') {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from('2024.9.999'))
        }
        if (options?.listeners?.stderr) {
          options.listeners.stderr(Buffer.from(''))
        }
        return 0
      }

      return 0
    })

    // when
    await run()

    // then
    expect(exec.exec).toHaveBeenNthCalledWith(
      1,
      'bash',
      [
        '-c',
        `git for-each-ref --sort=-committerdate --format '%(refname:short)' refs/tags | head -n1`
      ],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      2,
      'git',
      ['tag', '2025.2.0'],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      3,
      'git',
      ['push', '-f', 'origin', '2025.2.0'],
      expect.any(Object)
    )

    expect(core.setOutput).toHaveBeenCalledWith('version', '2025.2.0')
  })

  it('when tags exists in YYYY.MM.MICRO format for same day, increment MICRO', async () => {
    // given
    exec.exec.mockImplementation(async (command, _args, options) => {
      if (command === 'bash') {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from('2025.2.0'))
        }
        if (options?.listeners?.stderr) {
          options.listeners.stderr(Buffer.from(''))
        }
        return 0
      }

      return 0
    })

    // when
    await run()

    // then
    expect(exec.exec).toHaveBeenNthCalledWith(
      1,
      'bash',
      [
        '-c',
        `git for-each-ref --sort=-committerdate --format '%(refname:short)' refs/tags | head -n1`
      ],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      2,
      'git',
      ['tag', '2025.2.1'],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      3,
      'git',
      ['push', '-f', 'origin', '2025.2.1'],
      expect.any(Object)
    )

    expect(core.setOutput).toHaveBeenCalledWith('version', '2025.2.1')
  })

  it.each([{ latestTag: '2026.1.0' }, { latestTag: '2025.12.0' }])(
    'when tags exists in YYYY.MM.MICRO format for later year or month, do nothing',
    async ({ latestTag }) => {
      // given
      exec.exec.mockImplementation(async (command, _args, options) => {
        if (command === 'bash') {
          if (options?.listeners?.stdout) {
            options.listeners.stdout(Buffer.from(latestTag))
          }
          if (options?.listeners?.stderr) {
            options.listeners.stderr(Buffer.from(''))
          }
          return 0
        }

        return 0
      })

      // when
      await run()

      // then
      expect(exec.exec).toHaveBeenNthCalledWith(
        1,
        'bash',
        [
          '-c',
          `git for-each-ref --sort=-committerdate --format '%(refname:short)' refs/tags | head -n1`
        ],
        expect.any(Object)
      )

      expect(exec.exec).toHaveBeenCalledTimes(1)

      expect(core.setOutput).not.toHaveBeenCalled()
    }
  )

  // unhappy paths

  it('on error in git tagging process', async () => {
    // given
    exec.exec.mockImplementation(async (command, args, options) => {
      if (command === 'bash') {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from('2025.2.0'))
        }
        if (options?.listeners?.stderr) {
          options.listeners.stderr(Buffer.from(''))
        }
        return 0
      }

      if (args?.includes('tag')) {
        // simulates a real fatal exit code
        return 128
      }

      return 0
    })

    // when
    await run()

    // then
    expect(exec.exec).toHaveBeenNthCalledWith(
      1,
      'bash',
      [
        '-c',
        `git for-each-ref --sort=-committerdate --format '%(refname:short)' refs/tags | head -n1`
      ],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      2,
      'git',
      ['tag', '2025.2.1'],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenCalledTimes(2)

    expect(core.setOutput).not.toHaveBeenCalled()

    expect(core.setFailed).toHaveBeenCalled()
  })

  it('on error in git push process', async () => {
    // given
    exec.exec.mockImplementation(async (command, args, options) => {
      if (command === 'bash') {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from('2025.2.0'))
        }
        if (options?.listeners?.stderr) {
          options.listeners.stderr(Buffer.from(''))
        }
        return 0
      }

      if (args?.includes('push')) {
        // simulates a real fatal exit code
        return 128
      }

      return 0
    })

    // when
    await run()

    // then
    expect(exec.exec).toHaveBeenNthCalledWith(
      1,
      'bash',
      [
        '-c',
        `git for-each-ref --sort=-committerdate --format '%(refname:short)' refs/tags | head -n1`
      ],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      2,
      'git',
      ['tag', '2025.2.1'],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenNthCalledWith(
      3,
      'git',
      ['push', '-f', 'origin', '2025.2.1'],
      expect.any(Object)
    )

    expect(exec.exec).toHaveBeenCalledTimes(3)

    expect(core.setOutput).not.toHaveBeenCalled()

    expect(core.setFailed).toHaveBeenCalled()
  })
})
