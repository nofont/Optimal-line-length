function addZeroWidthElems(el){
  // we expect that el has only one child, a text node: el.firstChild.nodeType === 3
  // split the textNode into an array of words, then remove it from the DOM
  var words = el.firstChild.nodeValue.trim().split(/\s+/);
  el.removeChild(el.firstChild);
 
  // when the zero-width marker elements are created, we will store them on the
  // parent element for easy retrieval
  el.zeroWidthElems = new Array();
 
  // declare a variable for creating new text nodes
  var newTextNode;
 
  // loop through the words array, returning each word to the DOM as a textNode
  // followed by marker element.
  for(var i = 0; i < words.length; i++) {

    // return each word into the element, with a space if necessary
    newTextNode = document.createTextNode( ( i ? ' ' : '' ) + words[i] );
    el.appendChild(newTextNode);
 
    // create a zero-width element and store it for later access
    el.zeroWidthElems.push( document.createElement('span') );
    el.zeroWidthElems[i].className = 'zeroWidth';
    el.appendChild(el.zeroWidthElems[i]);
  }
}



function forEachTextLine(el, callback, stringArray) {
 

  // call the above function to insert zero-width elements (if they haven't been already)
  if(!el.hasOwnProperty('zeroWidthElems')) {
    addZeroWidthElems(el);
  }
 
  // we will keep track of which line number we are on
  var lineCount = 0;
  var charachterCountNoSpaces = 0;
  var charachterCountSpaces = 0;
  var spaceCount = 0;

 var lineCount = 0;
 
  // declare variables for calculating element position
  var maxTop = 0, curTop = 0;
 
  // find the last zeroWidth element
while (lineCount < 10) {
  
  for(var i = 0; i < el.zeroWidthElems.length; i++) {

  	// get the offset relative to the parent element
    curTop = el.zeroWidthElems[i].offsetTop;

  	charachterCountNoSpaces = charachterCountNoSpaces + stringArray[i].length;
  	spaceCount++;
 	// console.log('Ord '+i+': '+stringArray[i]+' '+stringArray[i].length);

    

 	
    // the first element inspected is automatically the max
    if(i === 0) {
      	maxTop = curTop;
    }
 
	// if the vertical position is different, the text has wrapped
	if(curTop != maxTop) {
	 
	    // update the maximum
	    maxTop = curTop;
	 
	    // update the line count
	    lineCount++;

	    console.log(lineCount);
	 	
	 	/*
	 	Example line 1 and 2:
	 	Lorem ipsum dolor sit amet, consectetuer
	 	adipiscing elit, sed diam nonummy nibh

		For some reason the counter includes the first word on the second line into the charachter count of line 1.
	 	Ord 0: Lorem 5
		Ord 1: ipsum 5
		Ord 2: dolor 5
		Ord 3: sit 3
		Ord 4: amet, 5
		Ord 5: consectetuer 12
		Ord 6: adipiscing 10
		Line 1 w/o spaces: 35
		Line 1 w 7 spaces: 42

		This needs to be taken into account and therefore we, below, need:

		charachterCountNoSpaces = charachterCountNoSpaces - stringArray[i].length;

		*/

	 	charachterCountNoSpaces = charachterCountNoSpaces - stringArray[i].length;

	 	charachterCountSpaces = charachterCountNoSpaces + spaceCount;

	 	// console.log('Line '+lineCount+' w/o spaces: '+ charachterCountNoSpaces);
	 	// console.log('Line '+lineCount+' w '+spaceCount+' spaces: '+charachterCountSpaces);
	 	if ( (charachterCountSpaces < 80) && (charachterCountSpaces > 45) ) {
	 		el.zeroWidthElems[i - 1].innerHTML = '<span class="counter">'+charachterCountSpaces+'</span>';
	 	} else {
	 		el.zeroWidthElems[i - 1].innerHTML = '<span class="counter error">'+charachterCountSpaces+'</span>';
	 	}
	 	
 	
	    // do something now that we have found the end of a line
	    callback.call(el, el.zeroWidthElems[i - 1], lineCount);
	    charachterCountSpaces = 0;
	 	charachterCountNoSpaces = 0;
	 	spaceCount = 0;
	}
	    // if this is the last element, it is automatically the end of a line
	else if(i == el.zeroWidthElems.length - 1) {
	    lineCount++;
	    callback.call(el, el.zeroWidthElems[i], lineCount);
	    }

  } // END FOR 

} // END WHILE
 
  // return the number of lines in the text node
  return lineCount;
}


// Splits string to array at separator
function splitString(stringToSplit, separator) {
  var arrayOfStrings = stringToSplit.split(separator);
  return arrayOfStrings;
}



var processEndOfLine = function (endOfLine, lineNumber) {
	// do something to each line
	endOfLine.className += ' end-of-line';
};


 
var myTextWrapper = document.getElementById('myTextWrapper');

stringArray = splitString(myTextWrapper.innerHTML, ' ');

var lineCount = forEachTextLine(myTextWrapper, processEndOfLine, stringArray);
 
// resorting to some jQuery
$(window).on('resize', function(){
	// undo anything that might have been done in a previous call to processEndOfLine()
	$('.end-of-line').removeClass('end-of-line');
 	// repeat processEndOfLine() now that the wrapping might have changed
	lineCount = forEachTextLine(myTextWrapper, processEndOfLine, stringArray);
});