export function formatTag(tag: string): string {
  return tag.replace(/\n+$/, '')
}

export function getCurrentDateFormatted(patchValue: number): string {
  const date = new Date()

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1

  return `${year}.${month}.${patchValue}`
}

export function isTagInExpectedFormat(tag: string): boolean {
  const regex = /^\d{4}\.(?:1[0-2]|[1-9])\.(0|[1-9]\d*)$/
  return regex.test(tag)
}

export function isTagInLaterYearOrMonth(tag: string): boolean {
  const date = new Date()
  const currentYear = date.getUTCFullYear()
  const currentMonth = date.getUTCMonth() + 1

  const parts = tag.split('.')
  const [tagYear, tagMonth] = parts

  const tagYearNum = Number(tagYear)
  const tagMonthNum = Number(tagMonth)

  return (
    tagYearNum > currentYear ||
    (tagYearNum === currentYear && tagMonthNum > currentMonth)
  )
}

export function isTagInSameYearAndMonth(tag: string): boolean {
  const date = new Date()
  const currentYear = date.getUTCFullYear().toString()
  const currentMonth = (date.getUTCMonth() + 1).toString()

  const parts = tag.split('.')
  const [tagYear, tagMonth] = parts

  return tagYear === currentYear && tagMonth === currentMonth
}

export function incrementTagMicroValue(tag: string): string {
  const parts = tag.split('.')
  const [tagYear, tagMonth, tagMicro] = parts

  const incrementedMicro = Number(tagMicro) + 1

  return `${tagYear}.${tagMonth}.${incrementedMicro}`
}
