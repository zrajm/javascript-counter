function Counter(opts) {
    this.imageName     = '';
    this.imageWidth    = 0;
    this.imageHeight   = 0;

    this.htmlId        = '';
    this.fetchDelay    = 5 * 60 * 1000;
    this.fetchUrl      = '';
    this.fetchCount    = 0;
    this.fetchValue    = 0;
    this.fetchCallback = '';
    this.fetch         = function() {
	this.fetchCount ++;
	//ajax(this.fetchUrl, 'returnStuff');
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

    // counter stuff
    this.count       = 0;
    this.countStep   = .01;
    this.countWidth  = 1;
    this.countDelay  = 100;
    this.countBeg    = 0;
    this.countEnd    = 0;
    /* return current counter, zero-padded to current counter length */
    this.countGet = function() {
	return zeroPad(this.count, this.countWidth);
    };

    /* <increment>, if provided will increase the counter. Decimals will cause
     * the odometer to rotate. */
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
	fetchUrl: "../cgi-bin/proxy.cgi?https://kredstat:4430/invs.yaws",
	fetchCallback: 'returnInvoice',
	countWidth: 7,
	countStep: .1,
	imageName:  'digits.jpg',
	imageHeight: 210,
	imageWidth:  158
    });


function returnInvoice(number) {
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
