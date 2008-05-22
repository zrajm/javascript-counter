// writes Text to web page (element <span class="layer">...</span>)
var ie4 = (document.all)    ? true : false;
var ns4 = (document.layers) ? true : false;
var ns6 = (document.getElementById && !document.all) ? true : false;
function writeLayer(layer,text) {
    if (ie4) {
	document.all[layer].innerHTML = text;
    }
    if (ns4) {
	document[layer].document.write(text);
	document[layer].document.close();
    }
    if (ns6) {
	over = document.getElementById([layer]);
	range = document.createRange();
	range.setStartBefore(over);
	domfrag = range.createContextualFragment(text);
	while (over.hasChildNodes()) {
	    over.removeChild(over.lastChild);
	}
	over.appendChild(domfrag);
    }
}

/* eof */
