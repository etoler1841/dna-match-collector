# DNA Match Collector

DNA Match Collector is a Chrome extension used to download your DNA relatives from Ancestry.com. Your closest 1000 relatives are compiled into a `.csv` file for convenient viewing, searching, and filtering.

## Download

Visit [the latest release page](https://github.com/etoler1841/dna-match-collector/releases/latest) and download the source code as a `.zip` file. Unzip the downloaded file and make note of where the extension folder is on your hard drive &mdash; you'll need it to install the extension in the next step.

## Installation

**Note:** This extension is compatible only with Google Chrome.

1. Open Chrome and navigate to [chrome://extensions](chrome://extensions).
2. In the top-right corner, use the toggler to enable **Developer mode**.
3. In the toolbar that appears, click the **Load unpacked** button.
4. Navigate to this directory (`dna-match-collector`) and click **Select Folder**.
5. Make sure the newly installed extension is enabled via the toggler in the bottom-right corner.

The extension should now be available for use.

## Usage

Once the extension has been installed, navigate to [your DNA Matches list](https://ancestry.com/discoveryui-matches/list) on Ancestry.com. While on any page of your matches, open the extension (it may be hidden inside the extensions menu) and click **Collect Matches**. The extension will begin automatically navigating through your first 1000 DNA matches.

Once the extension has finished compiling your matches, you'll be prompted to download a `.csv` file. The default name of this file is based on your unique DNA ID assigned by Ancestry.com; it does not reference any personal information about you, but it can be useful for building a link directly to your match page with that person.
