async function loadUI() {
  const MAX_MATCHES = 100

  const collectBtn = document.getElementById('collectMatches') ?? false
  const loadBtn = document.getElementById('loadMatches') ?? false

  if (!collectBtn || !loadBtn) {
    return
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const tab = tabs[0]
  const url = new URL(tab.url || tab.pendingUrl)
  const perPage = parseInt(url.searchParams.get('itemsPerPage') || '20')

  if (!url.href.includes('ancestry.com/discoveryui-matches/list/')) {
    return
  }

  if (perPage < MAX_MATCHES) {
    loadBtn.style.display = 'block'
  } else {
    collectBtn.style.display = 'block'
  }

  loadBtn.addEventListener('click', async () => {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: perPage => {
        const url = new URL(window.location.href)
        url.searchParams.set('itemsPerPage', perPage.toString())
        window.location.href = url.toString()
      },
      args: [MAX_MATCHES],
    })
    window.close()
  })

  collectBtn.addEventListener('click', async () => {
    if (!tab) {
      return
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    })

    downloadCSV(results[0].result)
  })

  async function downloadCSV(data) {
    const headers = ['ID', 'Name', 'Relationship', 'Link'].join(',')
    const rows = data.matches.map(row => [row.id, row.name, row.relationship, row.url].join(',')).join('\n')
    const csvContent = headers + '\n' + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    chrome.downloads.download({
      url,
      filename: `dna-matches-${data.userId}.csv`,
      saveAs: true,
    })
  }
}

window.addEventListener('load', loadUI)
