
// "Counter" object definition
function Counter(opts) {
    this.imageName     = ''; // image containing digits 0-9 + 0
    this.imageWidth    = 0;  // image width
    this.imageHeight   = 0;  // height of one digit in image

    this.htmlId        = ''; // stylesheet id name of HTML element
    this.fetchDelay    = 5 * 60 * 1000; // in milliseconds
    this.fetchUrl      = ''; // url from where to fetch counter value
    this.fetchCount    = 0;  // number of times fetched (DEBUG)
    this.fetchValue    = 0;  // latest fetched value
    this.fetchCallback = ''; // function to set fetchValue
    this.fetch         = function() {
	this.fetchCount ++;
	ajax(this.fetchUrl, this.fetchCallback);
    }
    this.fetchUpdate = function(number) {
	if (number > this.fetchValue) {
	    this.fetchValue = number;
	    this.countBeg   = this.countEnd;
	    this.countEnd   = this.fetchValue;
	    if (this.countBeg == 0) {
		this.countBeg = this.countEnd - 20;
	    }
	    if (this.count == 0) {
		this.count = this.countBeg;
	    }
	    this.countStep  = (this.countEnd - this.countBeg) / (this.fetchDelay / this.countDelay);
	}
    }

    /* counter stuff */
    /* settings initialised by user */
    this.countWidth  = 1;   // number of digits in counter
    this.countDelay  = 100; // how often to redraw counter
    /* settings continuously updated */
    this.count       = 0;   // counter's current value
    this.countStep   = .01; // how fast to increment counter
    this.countBeg    = 0;   // to count from
    this.countEnd    = 0;   // to count to (counter will never go beyond this)

    /* Update and draw the counter. If increment is specified (it usually isn't)
     * then <increment> is added to the counter instead of <this.countStep>
     * before the counter is redrawn. */
    this.countInc = function(increment) {
	if (arguments.length == 0) {
	    increment = this.countStep;
	}
	if (this.count >= this.countEnd || this.count == 0) {
	    increment = 0;
	}
	if (!!increment) {
	    this.count += increment;
	}
	var whole    = parseInt(this.count);
	var fraction = this.count - whole;
	var prev     = zeroPad(whole,   this.countWidth); /* previous number */
	var next     = zeroPad(whole+1, this.countWidth); /* next number */
	var htmlString = "";
	for (i = 0; i < next.length; i ++) {                /* for each digit */
	    var nextDigit = parseInt(next.charAt(i)) || 10; /* interval 1-10 */
	    var nextPos = -(nextDigit * this.imageHeight); 
	    if (prev.charAt(i) != next.charAt(i) && fraction != 0) {
		/* changed digit */
		var prevDigit = parseInt(prev.charAt(i));   /* interval 0-9 */
		var prevPos   = -(prevDigit * this.imageHeight);
		nextPos = (nextPos - prevPos) * fraction + prevPos;
	    }
	    htmlString  +=
		'<img ' +
		/* FIXME: Should use 'id="x.."' (commented out below) etc. here (and
		 * drop below 'style=top: ...px') so that animation could be
		 * produced by only modifying the stylesheet */
		//'id="x' + (i+1) + '" ' +
		'style="top: ' + nextPos + 'px;" ' +
		'src="' + this.imageName + '" ' +
		'width="' + this.imageWidth + '" ' +
		'height="' + (this.imageHeight*11) + '" ' +
		'/>';
	}
	writeLayer(this.htmlId, htmlString);
    };

    // parse arguments
    for (var key in opts) {
	this[key] = opts[key];
    }
}


// pads string with leading zeroes so it becomes "len" chars long
function zeroPad(string, len) {
    string += '';
    while (string.length < len) {
	string = '0' + string;
    }
    return string;
}




/******************************************************************************
 * Ajax XMLHttpRequest-thingy.
 *
 * Taken from: http://www.openhosting.co.uk/articles/webdev/6004/
 * /Zrajm C Akfohg [2005-05-18]
 *
 */

var req;
function ajax(url, callback) {
    if (window.XMLHttpRequest) {
	// native XMLHttpRequest object
	req = new XMLHttpRequest();
	req.onreadystatechange = function() { ajaxDone(callback); };
	req.open("GET", url, true);
	req.send(null);
    } else if (window.ActiveXObject) {
	// IE/Windows ActiveX version
	req = new ActiveXObject("Microsoft.XMLHTTP");
	if (req) {
	    req.onreadystatechange = function() { ajaxDone(callback); };
	    req.open("GET", url, true);
	    req.send();
	}
    }
}

function ajaxDone(callback) {
   if (req.readyState == 4) {
       // only if req is "loaded"
       if (req.status == 200 || req.status == 304) {
	   // only if "OK"
	   eval(callback+'(req.responseText)');
       } else {
	   // on error
	   eval(callback+'("Request Error: "+req.statusText)');
       }
   }
}

/******************************************************************************/





/* init invoices counter object */
var invoices = new Counter({
	htmlId: 'counter',
	fetchUrl: "../cgi-bin/proxy.cgi?https://kredstat:4430/goal_2008.yaws",
	fetchCallback: 'setReturnedValue',
	countWidth: 6,
	countStep: .1,
	imageName:  'digits.jpg',
	imageHeight: 210,
	imageWidth:  158
    });


function setReturnedValue(number) {
    invoices.fetchUpdate(parseInt(number));
}

function init() {
    invoices.fetch();

    // fetch new values from server
    setInterval(function() {
	    invoices.fetch();
	}, invoices.fetchDelay);


    // update counter
    setInterval(function() {
	    invoices.countInc();
	}, invoices.countDelay);
}

window.onload = init;

/* eof */
