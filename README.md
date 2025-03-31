### Step 1: Set Up the Extension Structure

Create a folder for your extension and add the following files:

1. `manifest.json`
2. `background.js`
3. `content.js`
4. `popup.html`
5. `popup.js`
6. `styles.css`

### Step 2: Create the Manifest File

The `manifest.json` file defines the extension's metadata and permissions.

```json
{
  "manifest_version": 3,
  "name": "DNA Match Collector",
  "version": "1.0",
  "permissions": [
    "activeTab",
    "scripting",
    "downloads"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

### Step 3: Create the Popup HTML

The `popup.html` file provides a user interface for the extension.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>DNA Match Collector</title>
</head>
<body>
    <h1>DNA Match Collector</h1>
    <button id="collectMatches">Collect Matches</button>
    <button id="downloadCSV">Download CSV</button>
    <button id="compareCSV">Compare CSV</button>
    <div id="status"></div>
    <script src="popup.js"></script>
</body>
</html>
```

### Step 4: Create the Content Script

The `content.js` file will run on the webpage and collect DNA match details.

```javascript
const dnaMatches = [];

function collectMatches() {
    // Example: Assuming matches are in a table with class 'dna-match'
    const rows = document.querySelectorAll('.dna-match');
    rows.forEach(row => {
        const matchDetails = {
            name: row.querySelector('.name').innerText,
            matchId: row.querySelector('.match-id').innerText,
            details: row.querySelector('.details').innerText
        };
        dnaMatches.push(matchDetails);
    });
}

function navigatePages() {
    // Logic to navigate through pages and collect matches
    const nextPageButton = document.querySelector('.next-page');
    if (nextPageButton) {
        nextPageButton.click();
        setTimeout(() => {
            collectMatches();
            navigatePages();
        }, 2000); // Adjust timeout as necessary
    }
}

collectMatches();
navigatePages();
```

### Step 5: Create the Background Script

The `background.js` file handles downloading CSV files.

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadCSV") {
        const csvContent = request.data.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: 'dna_matches.csv',
            saveAs: true
        });
    }
});
```

### Step 6: Create the Popup Script

The `popup.js` file handles user interactions in the popup.

```javascript
document.getElementById('collectMatches').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        });
    });
});

document.getElementById('downloadCSV').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "downloadCSV", data: dnaMatches });
    });
});

// Implement compareCSV functionality as needed
```

### Step 7: Style the Popup

Add some basic styles in `styles.css`.

```css
body {
    font-family: Arial, sans-serif;
    width: 200px;
}

button {
    margin: 5px 0;
    padding: 10px;
    width: 100%;
}
```

### Step 8: Load the Extension

1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the folder containing your extension files.

### Step 9: Test the Extension

1. Navigate to a webpage with DNA matches.
2. Click the extension icon and use the buttons to collect matches, download CSV, and compare CSV files.

### Additional Features

- Implement the CSV comparison functionality.
- Add error handling and user feedback.
- Optimize the navigation logic for different page structures.

### Note

This is a basic implementation. Depending on the actual structure of the webpage you are targeting, you may need to adjust the selectors and logic in the content script. Additionally, ensure that you comply with the website's terms of service when scraping data.