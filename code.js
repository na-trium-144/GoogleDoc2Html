var docUrl;
var properties = PropertiesService.getScriptProperties();
function doGet(e) {
  const req = e.parameter;
  docUrl = req.url;
  if(req.type === "time"){
    const lastUpdated = getLastUpdated().toJSON();
    return ContentService.createTextOutput(lastUpdated);
  }else if(req.type === "html"){
    var html = ConvertGoogleDocToCleanHtml();
    return HtmlService.createHtmlOutput(html);
  }else{
    var html = ConvertGoogleDocToCleanHtml();
    return ContentService.createTextOutput(html);
  }
}

function test(){
  docUrl = "https://docs.google.com/document/d/1B7ZEh4xrX3dsFSq3LF9yhrTdoQ9tsqexn1IfCWtd0Rc/edit?usp=sharing"; //replace this with your own document
  Logger.log(getLastUpdated().toJSON());
  var html = ConvertGoogleDocToCleanHtml();
  Logger.log(html);
}

function getLastUpdated(){
  const docId = DocumentApp.openByUrl(docUrl).getId();
  return DriveApp.getFileById(docId).getLastUpdated();
}

function ConvertGoogleDocToCleanHtml() {
  //var body = DocumentApp.getActiveDocument().getBody();
  trashSavedImages();
  var doc = DocumentApp.openByUrl(docUrl);
  var body = doc.getBody();
  var numChildren = body.getNumChildren();
  var output = [];
  var listCounters = {};

  // Walk through all the child elements of the body.
  for (var i = 0; i < numChildren; i++) {
    var child = body.getChild(i);
    output.push(processItem(child, listCounters));
  }

  var html = output.join('\r');
  //emailHtml(html, images);
  //createDocumentForHtml(html, images);
  return html;
}

function dumpAttributes(atts) {
  // Log the paragraph attributes.
  for (var att in atts) {
    Logger.log(att + ":" + atts[att]);
  }
}

function processItem(item, listCounters) {
  var output = [];
  var prefix = "", suffix = "";
  var style = "";

  var hasPositionedImages = false;
	if (item.getPositionedImages) {
		positionedImages = item.getPositionedImages();
		hasPositionedImages = true;
	}

	var itemType = item.getType();

  if (itemType == DocumentApp.ElementType.PARAGRAPH) {
		//https://developers.google.com/apps-script/reference/document/paragraph

		if (item.getNumChildren() == 0) {
			return "<br />";
		}

    var p = "";

    if (item.getIndentStart() != null) {
      p += "margin-left:" + item.getIndentStart() + "; ";
    }
    if (item.getIndentFirstLine() != null) {
      p += "text-indent:" + (item.getIndentFirstLine() - item.getIndentStart()) + "; ";
    }
    if (item.getIndentEnd() != null) {
      p += "margin-right:" + item.getIndentEnd() + "; ";
    }

    if(item.getLineSpacing() != null){
      p += "line-height: " + item.getLineSpacing() + "; ";
    }
    if(item.getSpacingBefore() != null){
      p += "margin-top: " + item.getSpacingBefore() + "; ";
    }else{
      p += "margin-top: 0; ";
    }
    if(item.getSpacingAfter() != null){
      p += "margin-bottom: " + item.getSpacingAfter() + "; ";
    }else{
      p += "margin-bottom: 0; ";
    }

		//Text Alignment
		switch (item.getAlignment()) {
			// Add a # for each heading level. No break, so we accumulate the right number.
			//case DocumentApp.HorizontalAlignment.LEFT:
			//  p += "text-align: left;"; break;
		case DocumentApp.HorizontalAlignment.CENTER:
			p += "text-align: center;";
			break;
		case DocumentApp.HorizontalAlignment.RIGHT:
			p += "text-align: right;";
			break;
		case DocumentApp.HorizontalAlignment.JUSTIFY:
			p += "text-align: justify;";
			break;
		default:
			p += "";
		}

		//TODO: getLineSpacing(line-height), getSpacingBefore(margin-top), getSpacingAfter(margin-bottom),

		//TODO: 
		//INDENT_END	    Enum	The end indentation setting in points, for paragraph elements.
		//INDENT_FIRST_LINE	Enum	The first line indentation setting in points, for paragraph elements.
		//INDENT_START	    Enum	The start indentation setting in points, for paragraph elements.

		if (p !== "") {
			style = ' style="' + p + '"';
		}

		//TODO: add DocumentApp.ParagraphHeading.TITLE, DocumentApp.ParagraphHeading.SUBTITLE

		//Heading or only paragraph
    switch (item.getHeading()) {
        // Add a # for each heading level. No break, so we accumulate the right number.
      case DocumentApp.ParagraphHeading.HEADING6: 
        prefix = "<h6" + style + ">", suffix = "</h6>"; break;
      case DocumentApp.ParagraphHeading.HEADING5: 
        prefix = "<h5" + style + ">", suffix = "</h5>"; break;
      case DocumentApp.ParagraphHeading.HEADING4:
        prefix = "<h4" + style + ">", suffix = "</h4>"; break;
      case DocumentApp.ParagraphHeading.HEADING3:
        prefix = "<h3" + style + ">", suffix = "</h3>"; break;
      case DocumentApp.ParagraphHeading.HEADING2:
        prefix = "<h2" + style + ">", suffix = "</h2>"; break;
      case DocumentApp.ParagraphHeading.HEADING1:
        prefix = "<h1" + style + ">", suffix = "</h1>"; break;
      default: 
        prefix = "<p" + style + ">", suffix = "</p>";
    }

    var attr = item.getAttributes();
  } else if (itemType === DocumentApp.ElementType.INLINE_IMAGE) {
    processImage(item, output);
  } else if (itemType === DocumentApp.ElementType.INLINE_DRAWING) {
		//TODO
		Logger.log("INLINE_DRAWING: " + JSON.stringify(item));
  } else if (itemType === DocumentApp.ElementType.LIST_ITEM) {
    var listItem = item;
    var gt = listItem.getGlyphType();
    var key = listItem.getListId() + '.' + listItem.getNestingLevel();
    var counter = listCounters[key] || 0;

    var p = "";

    if(item.getLineSpacing() != null){
      p += "line-height: " + item.getLineSpacing() + "; ";
    }
    if(item.getSpacingBefore() != null){
      p += "margin-top: " + item.getSpacingBefore() + "; ";
    }else{
      p += "margin-top: 0; ";
    }
    if(item.getSpacingAfter() != null){
      p += "margin-bottom: " + item.getSpacingAfter() + "; ";
    }else{
      p += "margin-bottom: 0; ";
    }

    if (p !== "") {
			style = ' style="' + p + '"';
		}

    // First list item
    if ( counter == 0 ) {
      // Bullet list (<ul>):
      if (gt === DocumentApp.GlyphType.BULLET
          || gt === DocumentApp.GlyphType.HOLLOW_BULLET
          || gt === DocumentApp.GlyphType.SQUARE_BULLET) {
        prefix = "<ul><li" + style + ">", suffix = "</li>";

      } else {
        // Ordered list (<ol>):
        prefix = "<ol><li" + style + ">", suffix = "</li>";
      }
    }
    else {
      prefix = "<li" + style + ">";
      suffix = "</li>";
    }

    var nextSibling = listItem.getNextSibling();
    var nestingLevel = listItem.getNestingLevel();
    while(nestingLevel >= 0 && 
      (item.isAtDocumentEnd() || (
        nextSibling && (
          nextSibling.getType() != DocumentApp.ElementType.LIST_ITEM ||
          nextSibling.getNestingLevel() < nestingLevel
      )))) {
      if (gt === DocumentApp.GlyphType.BULLET
          || gt === DocumentApp.GlyphType.HOLLOW_BULLET
          || gt === DocumentApp.GlyphType.SQUARE_BULLET) {
        suffix += "</ul>";
      }
      else {
        // Ordered list (<ol>):
        suffix += "</ol>";
      }
      listCounters[listItem.getListId() + '.' + nestingLevel] = 0;
      nestingLevel--;
    }
    if(nestingLevel == listItem.getNestingLevel()){
      counter++;
      listCounters[key] = counter;
    }

  } else if (itemType === DocumentApp.ElementType.TABLE) {
		var row = item.getRow(0)
		var numCells = row.getNumCells();
		var tableWidth = 0;

		for (var i = 0; i < numCells; i++) {
      if(item.getColumnWidth(i) != null){
			  tableWidth += item.getColumnWidth(i);
      }else{
        tableWidth = 0; //use default width
        break;
      }
      //Logger.log(item.getColumnWidth(i))
		}
		//Logger.log("TABLE tableWidth: " + tableWidth);

    if(tableWidth == 0){
      //todo: tableWidth = width of the document;
    }

		//https://stackoverflow.com/questions/339923/set-cellpadding-and-cellspacing-in-css
		var p = "border-collapse: collapse; ";
    if(tableWidth != 0){
      p += "width: " + tableWidth + "; ";
    }

    if (p !== "") {
			style = ' style="' + p + '"';
		}
		prefix = '<table' + style + '>\r', suffix = "</table>";
		//Logger.log("TABLE: " + JSON.stringify(item));
	} else if (itemType === DocumentApp.ElementType.TABLE_ROW) {

		var minimumHeight = item.getMinimumHeight();
		//Logger.log("TABLE_ROW getMinimumHeight: " + minimumHeight);

    var p = "";
    if(minimumHeight != null){
      p += "height: " + minimumHeight + "; ";
    }

    if (p !== "") {
			style = ' style="' + p + '"';
		}
		prefix = "<tr" + style + ">\r", suffix = "</tr>";
		//Logger.log("TABLE_ROW: " + JSON.stringify(item));
	} else if (itemType === DocumentApp.ElementType.TABLE_CELL) {
		/*
		BACKGROUND_COLOR	Enum	The background color of an element (Paragraph, Table, etc) or document.
		BORDER_COLOR	Enum	The border color, for table elements.
		BORDER_WIDTH	Enum	The border width in points, for table elements.
		PADDING_BOTTOM	Enum	The bottom padding setting in points, for table cell elements.
		PADDING_LEFT	Enum	The left padding setting in points, for table cell elements.
		PADDING_RIGHT	Enum	The right padding setting in points, for table cell elements.
		PADDING_TOP	    Enum	The top padding setting in points, for table cell elements.
		VERTICAL_ALIGNMENT	Enum	The vertical alignment setting, for table cell elements.
		WIDTH	        Enum	The width setting, for table cell and image elements.
		*/

		//https://wiki.selfhtml.org/wiki/HTML/Tabellen/Zellen_verbinden
		var colSpan = item.getColSpan();
		//Logger.log("TABLE_CELL getColSpan: " + colSpan);
		// colspan="3"

		var rowSpan = item.getRowSpan();
		//Logger.log("TABLE_CELL getRowSpan: " + rowSpan);
		// rowspan ="3"

    var span = "";
    if(colSpan != 1){
      span += " colspan=" + colSpan;
    }
    if(rowSpan != 1){
      span += " rowspan=" + rowSpan;
    }
    if(colSpan == 0 || rowSpan == 0){
      return "";
      // this cell is disabled
    }
    
		//TODO: WIDTH must be recalculated in percent
		var atts = item.getAttributes();


		var p = "border: 1px solid black; padding: 5px; ";
    if (atts.WIDTH != null){
      p += "width: " + atts.WIDTH + "; ";
    }

    if (p !== "") {
			style = ' style="' + p + '"';
		}

		prefix = '<td' + style + span + '>', suffix = "</td>\r";
		//Logger.log("TABLE_CELL: " + JSON.stringify(item));
	} else if (itemType === DocumentApp.ElementType.FOOTNOTE) {
		//TODO
		var note = item.getFootnoteContents();
		var counter = footnotes.length + 1;
		output.push("<sup><a name='link" + counter + "' href='#footnote" + counter + "'>[" + counter + "]</a></sup>");
		var newFootnote = "<aside class='footnote' epub:type='footnote' id='footnote" + counter + "'><a name='footnote" + counter + "' epub:type='noteref'>[" + counter + "]</a>";
		var numChildren = note.getNumChildren();
		for (var i = 0; i < numChildren; i++) {
			var child = note.getChild(i);
			newFootnote += processItem(child, listCounters, images, imagesOptions, footnotes);
		}
		newFootnote += "<a href='#link" + counter + "' id='#link" + counter + "'>↩</a></aside>"
		footnotes.push(newFootnote);
		Logger.log("FOOTNOTE: " + JSON.stringify(item));
	} else if (itemType === DocumentApp.ElementType.HORIZONTAL_RULE) {
		output.push("<hr />");
		//Logger.log("HORIZONTAL_RULE: " + JSON.stringify(item));
	} else if (itemType === DocumentApp.ElementType.UNSUPPORTED) {
		Logger.log("UNSUPPORTED: " + JSON.stringify(item));
	}


  output.push(prefix);

  if (hasPositionedImages === true) {
		//todo
    //processPositionedImages(positionedImages, images, output, imagesOptions);
    Logger.log("hasPositionedImages");
	}

  if (item.getType() == DocumentApp.ElementType.TEXT) {
    processText(item, output);
  }
  else {


    if (item.getNumChildren) {
      var numChildren = item.getNumChildren();

      // Walk through all the child elements of the doc.
      for (var i = 0; i < numChildren; i++) {
        var child = item.getChild(i);
        output.push(processItem(child, listCounters));
      }
    }

  }

  output.push(suffix);
  return output.join('');
}


function processText(item, output) {
  var text = item.getText();
  var indices = item.getTextAttributeIndices();

  for (var i=0; i < indices.length; i ++) {
    var partAtts = item.getAttributes(indices[i]);
    var startPos = indices[i];
    var endPos = i+1 < indices.length ? indices[i+1]: text.length;
    var partText = text.substring(startPos, endPos);
    var mylink = item.getLinkUrl(startPos);

    partText = partText.replace(new RegExp("(\r)", 'g'), "<br />\r");
    //Logger.log(partText);

    var style = "";

    //TODO if only ITALIC use: <blockquote></blockquote>

		//TODO: change html tags to css (i, strong, u)

    if (partAtts.LINK_URL) {
      output.push('<a href="' + mylink + '">');
    }
		//css font-style:italic;
    if (partAtts.ITALIC) {
      output.push('<i>');
    }
    //css font-weight: bold;
    if (partAtts.BOLD) {
      output.push('<strong>');
    }
    //css text-decoration: underline
    if (partAtts.UNDERLINE) {
      output.push('<u>');
    }

    // font family, color and size changes disabled
		/*if (partAtts.FONT_FAMILY) {
			style = style + 'font-family: ' + partAtts.FONT_FAMILY + '; ';
		}
		if (partAtts.FONT_SIZE) {
			var pt = partAtts.FONT_SIZE;
			var em = pixelToEm(pointsToPixel(pt));
			style = style + 'font-size: ' + pt + 'pt;  font-size: ' + em + 'em; ';
		}
		if (partAtts.FOREGROUND_COLOR) {
			style = style + 'color: ' + partAtts.FOREGROUND_COLOR + '; '; //partAtts.FOREGROUND_COLOR
		}
		if (partAtts.BACKGROUND_COLOR) {
			style = style + 'background-color: ' + partAtts.BACKGROUND_COLOR + '; ';
		}*/
		if (partAtts.STRIKETHROUGH) {
			style = style + 'text-decoration: line-through; ';
		}

		var a = item.getTextAlignment(startPos);
		if (a !== DocumentApp.TextAlignment.NORMAL && a !== null) {
			if (a === DocumentApp.TextAlignment.SUBSCRIPT) {
				style = style + 'vertical-align : sub; font-size : 60%; ';
			} else if (a === DocumentApp.TextAlignment.SUPERSCRIPT) {
				style = style + 'vertical-align : super; font-size : 60%; ';
			}
		}

    tabs = 0;
    while (partText !== "" && partText[0] === "\t"){
      partText = partText.slice(1);
      tabs++;
    }
    if (tabs !== 0){
      style += 'margin-left: ' + (tabs * 36) + "; ";
    }

    if (style !== "") {
      style = ' style="' + style + '"';
    }

    // If someone has written [xxx] and made this whole text some special font, like superscript
    // then treat it as a reference and make it superscript.
    // Unfortunately in Google Docs, there's no way to detect superscript
    if (partText.indexOf('[')==0 && partText[partText.length-1] == ']') {
      output.push('<sup' + style + '>' + partText + '</sup>');
    }
    else if (partText.trim().indexOf('http://') == 0) {
      output.push('<a' + style + ' href="' + partText + '" rel="nofollow">' + partText + '</a>');
    }
    else if (partText.trim().indexOf('https://') == 0) {
      output.push('<a' + style + ' href="' + partText + '" rel="nofollow">' + partText + '</a>');
    }
    else {
      output.push('<span' + style + '>' + partText + '</span>');
    }

    if (partAtts.ITALIC) {
      output.push('</i>');
    }
    if (partAtts.BOLD) {
      output.push('</strong>');
    }
    if (partAtts.UNDERLINE) {
      output.push('</u>');
    }
    if (partAtts.LINK_URL) {
      output.push('</a>');
    }
  }
}

function processImage(item, output)
{
  var blob = item.getBlob().copyBlob();
  var contentType = blob.getContentType();
  var extension = "";
  if (/\/png$/.test(contentType)) {
    extension = ".png";
  } else if (/\/gif$/.test(contentType)) {
    extension = ".gif";
  } else if (/\/jpe?g$/.test(contentType)) {
    extension = ".jpg";
  } else {
    throw "Unsupported image type: "+contentType;
  }
  blob.setName("Doc2HTML_Image" + extension);
  var file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const imageUrl = file.getDownloadUrl();
  const width = item.getWidth();
  const height = item.getHeight();
  output.push(`<img src="${imageUrl}" width=${width} height=${height}/>`);
  var ids = properties.getProperty(docUrl);
  if(ids == null){
    ids = file.getId();
  }else{
    ids += "," + file.getId();
  }
  properties.setProperty(docUrl, ids);
}

function trashSavedImages(){
  let fileIds = properties.getProperty(docUrl);
  if(fileIds != null){
    for(const id of fileIds.split(",")){
      let file = DriveApp.getFileById(id);
      file.setTrashed(true);
    }
    properties.deleteProperty(docUrl);
  }
}
