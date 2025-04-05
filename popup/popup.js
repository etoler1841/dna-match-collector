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

    let userId
    let currentPage = 1
    const allMatches = []
    while (currentPage <= MAX_PAGES) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: page => {
          return new Promise(resolve => {
            window.addEventListener('load', () => resolve())
            console.log(`Navigating to page ${page}`) // Debugging log

            const url = new URL(window.location.href)
            url.searchParams.set('itemsPerPage', '100')
            url.searchParams.set('currentPage', page.toString())
            window.location.href = url.toString()
          })
        },
        args: [currentPage],
      })

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          const waitForListItems = async () => {
            return new Promise(async (resolve, reject) => {
              const timeout = setTimeout(() => {
                reject()
              }, 10000)

              let rows
              while (true) {
                rows = document.querySelectorAll('[data-testid=matchEntryContainer]')
                if (rows.length > 0) {
                  break
                }

                await new Promise(resolve => setTimeout(resolve, 500))
              }

              const relationshipEls = document.querySelectorAll('[data-testid=matchEntryContainer] .relationshipLabel')
              while (true) {
                const relationships = Array.from(relationshipEls)
                  .map(el => el.innerText.trim())
                  .filter(Boolean)
                if (relationships.length >= rows.length) {
                  break
                }

                await new Promise(resolve => setTimeout(resolve, 500))
              }

              clearTimeout(timeout)

              let userId
              const matches = Array.from(rows)
                .map(row => {
                  const nameElement = row.querySelector('[data-testid=matchNameLink]')
                  const relationshipElement = row.querySelector('.relationshipLabel')
                  if (!nameElement) {
                    return null
                  }

                  const name = nameElement.innerText.trim()
                  const url = nameElement.getAttribute('href')
                  const id = url.split('/').pop()
                  const relationship = relationshipElement ? relationshipElement.innerText.trim() : 'Unknown'

                  if (!userId) {
                    userId = url.split('/').at(-3)
                  }

                  return {
                    id,
                    name,
                    relationship,
                  }
                })
                .filter(Boolean)

              resolve({ userId, matches })
            })
          }

          return waitForListItems()
        },
        args: [MAX_MATCHES, currentPage],
      })

      if (results[0]?.result?.matches?.length > 0) {
        if (!userId) {
          userId = results[0].result.userId
        }

        console.log(`Collected ${results[0].result.matches.length} matches from page ${currentPage}`) // Debugging log
        allMatches.push(...results[0].result.matches)
      } else {
        console.error(`No matches found on page ${currentPage}`)
        break
      }

      currentPage++
    }

    if (allMatches.length > 0) {
      console.log(`Collected a total of ${allMatches.length} matches.`) // Debugging log
      await downloadCSV({ userId, matches: allMatches })
    } else {
      console.error('No matches were collected.')
    }
  })

  async function downloadCSV(data) {
    const headers = ['ID', 'Name', 'Relationship'].join(',')
    const rows = data.matches.map(row => [row.id, row.name, row.relationship].join(',')).join('\n')
    const csvContent = headers + '\n' + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    await chrome.downloads.download({
      url,
      filename: `dna-matches_${data.userId}.csv`,
      saveAs: true,
    })
  }
}

window.addEventListener('load', loadUI)
