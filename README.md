## Google Doc to clean HTML converter ##
This is a fork of [thejimbirch/GoogleDoc2Html](https://github.com/thejimbirch/GoogleDoc2Html)
* Added inline link support from [ezramechaber/GoogleDoc2Html](https://github.com/ezramechaber/GoogleDoc2Html/tree/link-support)
* Sends no email

### Usage
 1. Create a new Google Apps Script project on your Google Drive.
    * Or, Open your Google Doc and go to Tools menu, select Script Editor. You
    should see a new window open with a nice code editor. 
 2. Copy and paste the code from here: [GoogleDocs2Html][1]
 3. Create new file and write like this:
 ```
 function myFunction() {
  var doc = DocumentApp.openByUrl("https://docs.google.com/document/d/***/edit");
  // or,  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var html = ConvertGoogleDocToCleanHtml(body);
  Logger.log(html);
}
```
 4. Save the file and run the script.
 6. You will get the HTML output of the Google Doc.

  [1]: https://raw.githubusercontent.com/na-trium-144/GoogleDoc2Html/master/code.js
