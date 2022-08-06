## Google Doc to clean HTML converter ##
This is a fork of [thejimbirch/GoogleDoc2Html](https://github.com/thejimbirch/GoogleDoc2Html)
* Applied the PRs of [oazabir/GoogleDoc2Html](https://github.com/oazabir/GoogleDoc2Html)
* Copied some code from [kerray/GoogleDoc2Html](https://github.com/kerray/GoogleDoc2Html)
* Fixed other formatting issues
* Deploy web app that returns the HTML as a response instead of sending email

### Usage
 1. Create a new Google Apps Script project on your Google Drive. 
 2. Copy and paste the code from here: [GoogleDocs2Html][1]
 4. Save the file and deploy it.
 5. Access `https://script.google.com/.../exec?url=(url of your document here)` to get the HTML output of the Google Doc.
   * images are saved on your GoogleDrive, and the download link will be embedded in img tags in the HTML.
   * add `&type=html` to view the page directly in the browser.
   * add `&type=time` to get the last-updated time of the document instead of the contents.

  [1]: https://raw.githubusercontent.com/na-trium-144/GoogleDoc2Html/master/code.js
