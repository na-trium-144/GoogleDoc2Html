function ConvertGoogleSheetToCleanHtml() {
  //trashSavedImages();
  var doc = SpreadsheetApp.openByUrl(docUrl);
  var html = "";
  for(var sheet of doc.getSheets()){

    // This represents ALL the data
    var range = sheet.getDataRange();
    var values = range.getValues();

    var p0 = "border-collapse: collapse; ";
    html += `<table style="${p0}"><tbody>\n`;

    // This logs the spreadsheet in CSV format with a trailing comma
    for (var i = 0; i < values.length; i++) {
      //var height = sheet.getRowHeight(i+1);
      var p1 = ""; //`height: ${height}px; `;
      html += `<tr style="${p1}">`;
      for (var j = 0; j < values[i].length; j++) {
        var p2 = "border: 1px solid; padding: 5px; ";
        var width = sheet.getColumnWidth(j+1);
        p2 += `width: ${width}px; `;
        html += `<td style="${p2}">${values[i][j]}</td>\n`;
      }
      html += "</tr>\n"
    }
    html += "</tbody></table>"
  }
  return html;
}

