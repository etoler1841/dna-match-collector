function collectMatches() {
  const rows = document.querySelectorAll('[data-testid=matchEntryContainer], .match-row') // Added fallback selector
  let userId
  const matches = Array.from(rows)
    .map(row => {
      const nameElement = row.querySelector('[data-testid=matchNameLink], .name a') // Added fallback selector
      const relationshipElement = row.querySelector('.relationshipLabel, .relationship') // Added fallback selector
      if (!nameElement) {
        return null
      }

      const name = nameElement.innerText.trim()
      const url = nameElement.href
      const id = url.split('/').pop()
      const relationship = relationshipElement ? relationshipElement.innerText.trim() : 'Unknown'

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
    .filter(Boolean) // Filter out null values

  return { userId, matches }
}

collectMatches()
