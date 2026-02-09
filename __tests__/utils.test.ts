import { jest } from '@jest/globals'

const {
  getCurrentDateFormatted,
  isTagInExpectedFormat,
  isTagInLaterYearOrMonth,
  incrementTagMicroValue,
  isTagInSameYearAndMonth,
  formatTag
} = await import('../src/utils/utils.js')

describe('utils.ts', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-02-07T12:00:00Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it.each([
    { tag: '2025.2.0', formattedTag: '2025.2.0' },
    { tag: '2025.2.0\n', formattedTag: '2025.2.0' }
  ])('when formatTag is called', ({ tag, formattedTag }) => {
    expect(formatTag(tag)).toBe(formattedTag)
  })

  it('when getCurrentDateFormatted is called', async () => {
    // given
    const patchValue = 0

    // when
    const formattedDate = getCurrentDateFormatted(patchValue)

    // then
    expect(formattedDate).toBe('2025.2.0')
  })

  it.each([
    { tag: '0000.1.0', expected: true },
    { tag: '1000.1.1', expected: true },
    { tag: '1111.1.1111', expected: true },
    { tag: '9999.12.9999', expected: true },
    { tag: '2026.13.0', expected: false },
    { tag: '2026.09.0', expected: false },
    { tag: '2026.0.0', expected: false },
    { tag: '2026.9.09', expected: false },
    { tag: '0.1.0', expected: false },
    { tag: 'v0.1.0', expected: false },
    { tag: 'latest', expected: false },
    { tag: '1.0.0-rc', expected: false }
  ])('when isTagInExpectedFormat is called', ({ tag, expected }) => {
    expect(isTagInExpectedFormat(tag)).toBe(expected)
  })

  it.each([
    { tag: '2025.2.0', expected: false },
    { tag: '2025.2.999', expected: false },
    { tag: '2024.2.0', expected: false },
    { tag: '2024.2.999', expected: false },
    { tag: '2025.1.0', expected: false },
    { tag: '2025.1.999', expected: false },
    { tag: '2026.3.0', expected: true },
    { tag: '2026.2.0', expected: true },
    { tag: '2025.3.0', expected: true }
  ])('when isTagInLaterYearOrMonth is called', ({ tag, expected }) => {
    expect(isTagInLaterYearOrMonth(tag)).toBe(expected)
  })

  it.each([
    { tag: '2025.2.0', expected: true },
    { tag: '2025.2.999', expected: true },
    { tag: '2025.3.0', expected: false },
    { tag: '2025.3.999', expected: false },
    { tag: '2026.2.0', expected: false },
    { tag: '2026.2.999', expected: false }
  ])('when isTagInSameYearAndMonth is called', ({ tag, expected }) => {
    expect(isTagInSameYearAndMonth(tag)).toBe(expected)
  })

  it.each([
    { tag: '2025.2.0', incrementedTag: '2025.2.1' },
    { tag: '2025.2.999', incrementedTag: '2025.2.1000' }
  ])('when incrementTagMicroValue is called', ({ tag, incrementedTag }) => {
    expect(incrementTagMicroValue(tag)).toBe(incrementedTag)
  })
})
