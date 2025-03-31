function collectMatches() {
  const rows = document.querySelectorAll('[data-testid=matchEntryContainer]')
  let userId
  const matches = Array.from(rows).map(row => {
    const nameElement = row.querySelector('[data-testid=matchNameLink]')
    const relationshipElement = row.querySelector('.relationshipLabel')
    if (!nameElement) {
      return null
    }

    const name = nameElement.innerText
    const url = nameElement.href
    const id = url.split('/').pop()
    const relationship = relationshipElement ? relationshipElement.innerText : 'Unknown'

    if (!userId) {
      userId = url.split('/').at(-3)
    }

    return {
      id,
      name,
      url,
      relationship,
    }
  })

  return { userId, matches }
}

collectMatches()
