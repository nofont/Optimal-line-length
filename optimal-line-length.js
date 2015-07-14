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

  console.log(el.zeroWidthElems.length);
 
  // we will keep track of which line number we are on
  var lineCount = 0;
  var charachterCountNoSpaces = 0;
  var charachterCountSpaces = 0;
  var spaceCount = 0;
 
  // declare variables for calculating element position
  var maxTop = 0, curTop = 0;
 
  // find the last zeroWidth element
  for(var i = 0; i < el.zeroWidthElems.length; i++) {

    if(lineCount >= 10) {
      return;
    }

  	// get the offset relative to the parent element
    if(i == el.zeroWidthElems.length - 1) {
        //this is the last element, it is automatically the end of the line
        lineCount++;
        callback.call(el, el.zeroWidthElems[i], lineCount);
    } else {
        //check 1 character ahead
        //this will ensure we don't count characters that are on the next line
        curTop = el.zeroWidthElems[i+1].offsetTop;
    }

    //because the number of zero width characters is the same as the number of words,
    //stringArray[i] will give us the word that is to the left of the current zero-width character
    if(stringArray[i]) {
    	charachterCountNoSpaces = charachterCountNoSpaces + stringArray[i].length;
    	spaceCount++;
    }
 	
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
  	 	
  	 	charachterCountSpaces = charachterCountNoSpaces + spaceCount;

  	 	// console.log('Line '+lineCount+' w/o spaces: '+ charachterCountNoSpaces);
  	 	// console.log('Line '+lineCount+' w '+spaceCount+' spaces: '+charachterCountSpaces);
  	 	if ( (charachterCountSpaces < 80) && (charachterCountSpaces > 50) ) {
  	 		el.zeroWidthElems[i].innerHTML = '<span class="counter">'+charachterCountSpaces+'</span>';
  	 	} else {
  	 		el.zeroWidthElems[i].innerHTML = '<span class="counter error">'+charachterCountSpaces+'</span>';
  	 	}
  	 	
   	
  	    // do something now that we have found the end of a line
  	    callback.call(el, el.zeroWidthElems[i], lineCount);
  	    charachterCountSpaces = 0;
    	 	charachterCountNoSpaces = 0;
    	 	spaceCount = 0;
  	}
  } // END FOR 
 
  // return the number of lines in the text node
  return lineCount;
}

var processEndOfLine = function (endOfLine, lineNumber) {
	// do something to each line
	endOfLine.className += ' end-of-line';
};

var myTextWrapper = document.getElementById('myTextWrapper');

stringArray = myTextWrapper.innerHTML.split(/\s+/);

var lineCount = forEachTextLine(myTextWrapper, processEndOfLine, stringArray);

// resorting to some jQuery
$(window).on('resize', function(){
	// undo anything that might have been done in a previous call to processEndOfLine()
  $('.counter').remove();
	$('.end-of-line').removeClass('end-of-line');
 	// repeat processEndOfLine() now that the wrapping might have changed
	lineCount = forEachTextLine(myTextWrapper, processEndOfLine, stringArray);
});
