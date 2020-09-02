// from: https://stackoverflow.com/questions/6644654/parse-an-url-in-javascript
/**
 * @param string url
 * @return Location an object containing the parsed-out components of the URL
 * 		(e.g.: u.href, u.protocol, u.host, u.pathname, u.search, u.hash, u.origin, ...)
 */
String.prototype.parseUrl = function () {
	let a = document.createElement('a');
	a.href = this.toString();
	return a;
} /* parseUrl() */

/**
 * @param string name
 * @return boolean
 */
String.prototype.hasUrlParameter = function (name) {
	var re = new RegExp('(^|/)(' + name + ')(/+([^/]+))?(/|$)');
	return this.toString().match(re);
};

/* class */ function cdmApi () {
	this.elsBase = document.getElementsByTagName('base');
	this.sDebugKey = 'debug-adah-responsive';
}
cdmApi.prototype.originUrl = function originUrl(path) {
	let url = window.location.href;
	if (this.elsBase.length > 0) {
		url = this.elsBase[0].getAttribute('href');
	}
	let origin = url.parseUrl().origin;
	
	if (typeof(path) != 'undefined') {
		origin = origin.replace(/[\/]+$/, '') + '/' + path.replace(/^[\/]+/, '');
	}
	return origin;
}
cdmApi.prototype.debugging = function debugging (value) {
	let match = false;
	let dbg = sessionStorage.getItem(this.sDebugKey);
	
	if (typeof(value) == 'undefined') value=/.*/;
	else if (typeof(value) == 'string') value = new RegExp('(^|,)' + value + '(,|$)');

	match = (!(dbg==null) && (dbg == '*' || dbg===true || dbg.match(value)));
	return match;
}
cdmApi.prototype.getCollectionsFromHTML = function getCollectionsFromHTML () {
	let tableColls = document.getElementById('adah-collection-list');
	let tableRows = tableColls.getElementsByTagName('tr');
	let aColls = [];
	
	for (let i = 0; i<tableRows.length; i++) {
		let thColls = tableRows[i].getElementsByTagName('th');
		let sCurColl = null;
		for (let j = 0; j<thColls.length; j++) {
			sCurColl = thColls[j].innerText;

			let isExcluded = false;
			let tdTags = document.getElementById('adah-meta-collection-data-' + sCurColl + '-tag');
			let aTags = (tdTags !== null ? tdTags.innerText.split(/\s+/) : []);
							
			isExcluded = (aTags.length > 0);
							
			if (!isExcluded) {
				aColls.push(sCurColl);
			}
		}						
	}
	return aColls;
}
cdmApi.prototype.submitSimpleSearch = function submitSimpleSearch (coll) {
	console.log("Custom JS: search-button click");

	var aSearchPath = [];
	aSearchPath.push(this.originUrl());
	aSearchPath.push('digital');

	// collections
	var collCriteria = "";
	
	let searchCollectionValues = [];
	if (coll) {
		searchCollectionValues.push(coll);
	} else {
		searchCollectionValues = this.getCollectionsFromHTML();
	}
	
	if (searchCollectionValues.length > 0 && searchCollectionValues.length < 147) {
		collCriteria = 'collection/' + searchCollectionValues.join("!");
	}

	let searchtermvalues = [];
	searchtermvalues.push(document.getElementById("search-input").value);
	
	if (searchtermvalues.length > 0) {
		var searchvals = searchtermvalues.join("!");
		if ( searchvals.startsWith("!") ) {
			searchvals = searchvals.substr(1);
		}
		searchCriteria = 'searchterm/' + searchvals;
	}

	console.log("Search collections:", searchCollectionValues.length, searchCollectionValues);
	
	// collection/[SLUG]/search when we have ONE OR FEWER collections.
	if (searchCollectionValues.length <= 1) {
		aSearchPath.push(collCriteria);
		aSearchPath.push('search');

	// search/collection/[SLUG1]![SLUG2]... when we have TWO OR MORE collections.		
	} else {
		aSearchPath.push('search');
		aSearchPath.push(collCriteria);

	} /* if */

	aSearchPath.push(searchCriteria);
	//aSearchPath.push('field/' + fieldvalues.join("!"));
	//aSearchPath.push('mode/' + modevalues.join("!"));
	//aSearchPath.push('conn/' + connvalues.join("!"));

	let searchurl = aSearchPath.join('/');

	console.log("Search URL:", searchurl);

	if (!this.debugging('halt')) {
		window.parent.location.href = searchurl;
	} /* if */
}

function reqParam ( key ) {
	let asUrlQuery = window.location.search.substring(1).split("&");
	let hParam = {}; $.each( asUrlQuery, function (i, pair) { let kv = pair.split("="); hParam[kv[0]] = kv[1] } );
	
	return ( ( typeof(key)=='undefined' || key.length==0 ) ? hParam : hParam[key] );
}
