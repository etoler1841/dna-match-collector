async function loadUI() {
  const MAX_MATCHES = 100
  const MAX_PAGES = 10

  const collectBtn = document.getElementById('collectMatches') ?? false

  if (!collectBtn) {
    return
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const tab = tabs[0]
  const url = new URL(tab.url || tab.pendingUrl)

  if (!url.href.includes('ancestry.com/discoveryui-matches/list/')) {
    return
  }

  collectBtn.style.display = 'block'

  collectBtn.addEventListener('click', async () => {
    if (!tab) {
      return
    }

    let allMatches = []

    // Always start on page 1
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: perPage => {
        const url = new URL(window.location.href)
        url.searchParams.set('itemsPerPage', perPage.toString())
        url.searchParams.set('currentPage', '1')
        window.location.href = url.toString()
      },
      args: [MAX_MATCHES],
    })

    for (let currentPage = 1; currentPage <= MAX_PAGES; currentPage++) {
      console.log(`Navigating to page ${currentPage}`) // Debugging log
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async (perPage, page) => {
          const waitForListItems = async () => {
            return new Promise(resolve => {
              const checkForRows = () => {
                const rows = document.querySelectorAll('[data-testid=matchEntryContainer], .match-row')
                if (rows.length > 0) {
                  const matches = Array.from(rows)
                    .map(row => {
                      const nameElement = row.querySelector('[data-testid=matchNameLink], .name a')
                      const relationshipElement = row.querySelector('.relationshipLabel, .relationship')
                      if (!nameElement) {
                        return null
                      }

                      const name = nameElement.innerText.trim()
                      const url = nameElement.href
                      const id = url.split('/').pop()
                      const relationship = relationshipElement ? relationshipElement.innerText.trim() : 'Unknown'

                      return {
                        id,
                        name,
                        url,
                        relationship,
                      }
                    })
                    .filter(Boolean)
                  resolve(matches)
                }
              }

              const observer = new MutationObserver(() => {
                checkForRows()
              })

              observer.observe(document.body, { childList: true, subtree: true })

              // Fallback to ensure resolution
              setTimeout(() => {
                observer.disconnect()
                resolve([])
              }, 10000)

              checkForRows()
            })
          }

          const url = new URL(window.location.href)
          url.searchParams.set('itemsPerPage', perPage.toString())
          url.searchParams.set('currentPage', page.toString())
          window.location.href = url.toString()

          const matches = await waitForListItems()
          return { matches }
        },
        args: [MAX_MATCHES, currentPage],
      })

      if (results[0]?.result?.matches?.length > 0) {
        console.log(`Collected ${results[0].result.matches.length} matches from page ${currentPage}`) // Debugging log
        allMatches = allMatches.concat(results[0].result.matches)
      } else {
        console.error(`No matches found on page ${currentPage}`)
        break
      }
    }

    if (allMatches.length > 0) {
      console.log(`Collected a total of ${allMatches.length} matches.`) // Debugging log
      await downloadCSV({ matches: allMatches })
    } else {
      console.error('No matches were collected.')
    }
  })

  async function downloadCSV(data) {
    const headers = ['ID', 'Name', 'Relationship', 'Link'].join(',')
    const rows = data.matches.map(row => [row.id, row.name, row.relationship, row.url].join(',')).join('\n')
    const csvContent = headers + '\n' + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    await chrome.downloads.download({
      url,
      filename: `dna-matches.csv`,
      saveAs: true,
    })
  }
}

window.addEventListener('load', loadUI)
