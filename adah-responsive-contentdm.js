/**
 * adah-responsive-contentdm.js: here's a big pile of customizations for ADAH's CONTENTdm site
 * some of them original, some of them pasted in or adapted from the OCLC Cookbook, and some
 * adapted from the Ohio Memory CONTENTdm repository.
 *
 * @version 2021.0723
 */

console.log("adah-responsive-contentdm.js", "2021.0723-0917");
 
/* video-stream-embed-1.2.js */

(function() {
'use strict';

  let currentInstance = null;

  function VimeoAPI(url) {
    return new Promise(function(resolve) {
      if (!url) {
        return resolve(false);
      }
      // create iframe for youtube
      let html = '<iframe src="' + url + '" class="embed-responsive-item" allowfullscreen></iframe>';
      resolve(html);
    });
  }

  function VimeoNonAPI(url) {
    return new Promise(function(resolve) {
      if (!url) {
        return resolve(false);
      }

      if (!url.match(/player/)) {
           url = url.replace('https://vimeo.com', 'https://player.vimeo.com/video');
      }

      // create iframe for youtube
      let html = '<iframe src="' + url + '" class="embed-responsive-item" allowfullscreen></iframe>';
      resolve(html);
    });
  }

  function YoutubeAPI(url) {
    return new Promise(function(resolve) {
      if (!url) {
        return resolve(false);
      }
      url = url.replace('watch?v=', 'embed/');
      // create iframe for youtube
      let html = '<iframe type="text/html" src="' + url + '" class="embed-responsive-item" allowfullscreen=""></iframe>';
      resolve(html);
    });
  }

  function KalturaAPI(url) {
    return new Promise(function(resolve) {
      if (!url) {
        return resolve(false);
      }
      // create iframe for kaltura
      let html = '<div class="videoWrapper"><iframe src="' + url + '" class="embed-responsive-item" allowfullscreen ></iframe></div>';
      resolve(html);
    });
  }

  function YoutuAPI(url) {
    if (!url) {
      return resolve(false);
    }
    url = url.replace('youtu.be/', 'youtube.com/watch?v=');
    return YoutubeAPI(url);
  }

  const APIS = {
    'player.vimeo.com': VimeoAPI,
    'vimeo.com': VimeoNonAPI,
    'youtu.be': YoutuAPI,
    'www.youtube.com': YoutubeAPI,
    'cdnapisec.kaltura.com': KalturaAPI
  };

  function loadFrame(link) {
    return Promise.resolve(link).then(function(link) {
      let url = new URL(link);
      // find proper api from api list
      const loader = APIS[url.hostname];
      return loader && loader(link);
    }).catch(console.warn);
  }

  function CustomVideoView(container) {
    if (!container) {
      return false;
    }
    const anchor = container.querySelector('a');
    if (!anchor || !/player.vimeo.com|vimeo.com|youtube.com|youtu.be|cdnapisec.kaltura.com/i.test(anchor.href)) {
      return false;
    }

    let links = [anchor.href];
    // parse metadata
    const rows = document.querySelectorAll('tr[class*=metadatarow]');
    Array.from(rows).forEach(function(row) {
      // find a description field
      if (row.firstChild.textContent === 'Description') {
        links = links.concat(row.lastChild.textContent.split(','));
      }
    });

    // create container for iFrames
    const frameContainer = document.createElement('div');
    frameContainer.classList.add('embed-responsive', 'embed-responsive-16by9');

    const mount = function() {
      const reqs = links.map(function(link) {
        return loadFrame(link);
      });

      Promise.all(reqs).then(function(reps) {
        // hide original viewer
        container.className += ' hide';
        document.querySelector('div.preview').style.display = 'block';
        // add each frames to one root
        reps.forEach(function(embeddedHTML) {
          embeddedHTML && (frameContainer.innerHTML += embeddedHTML);
        });
        // insert it
        container.parentNode.insertBefore(frameContainer, container);
      });
    };

    const unmount = function() {
      frameContainer.parentNode && frameContainer.parentNode.removeChild(frameContainer);
    };

    mount();

    return {unmount: unmount};

  }

  let globalScope = true;
  let collectionScope = [
    'p15700coll2'
  ];

  document.addEventListener('cdm-item-page:ready', function(e) {
    const collection = e.detail.collectionId;
    if (globalScope || collectionScope.includes(collection)) {
      // unmount or remove current video player from DOM if it is exists
      currentInstance && currentInstance.unmount();
      // creates a new instance if it is url item and it is from vimeo.com
      currentInstance = CustomVideoView(document.querySelector('div[class*=itemUrl]'));
    }
  });

  document.addEventListener('cdm-item-page:update', function(e) {
    const collection = e.detail.collectionId;
    if (globalScope || collectionScope.includes(collection)) {
      currentInstance && currentInstance.unmount();
      // updates an instance if it is url item and it is from vimeo.com
      currentInstance = CustomVideoView(document.querySelector('div[class*=itemUrl]'));
    }
  });

  document.addEventListener('cdm-item-page:leave', function(e) {
    const collection = e.detail.collectionId;
    if (globalScope || collectionScope.includes(collection)) {
      // unmount or remove current video player from DOM if it is exists
      currentInstance && currentInstance.unmount();
    }
  });

})();

/* version history

1.2 - 2019 October 2 - corrected errant apostrophe typo with VimeoNonAPI
1.1 - 2019 August 9 - add non-embeddable Vimeo URLs; add global/collection toggle
1.0 - 2018 June - initial implementation

*/

/* ia-book-reader-embed-1_2.js */
(function() {
  'use strict';

  let currentInstance = null;

  function IABookReader(url) {
    return new Promise(function(resolve) {
      if (!url) {
        return resolve(false);
      }
      // create iframe for ia book reader
      let html = '<div class="videoWrapper"><iframe src="' + url + '?ui=embed#page/n1/mode/2up" width="100%" height="600px"></iframe></div>';
      resolve(html);
    });
  }

  var APIS = {
    'www.archive.org': IABookReader,
	'archive.org': IABookReader
  };

  function loadFrame(link) {
    return Promise.resolve(link).then(function(link) {
      const url = new URL(link);
      // find proper api from api list
      const loader = APIS[url.hostname];
      return loader && loader(link);
    }).catch(console.warn);
  }

  function CustomVideoView(container) {
    if (!container) {
      return false;
    }
    const anchor = container.querySelector('a');
    if (!anchor || !/archive.org/i.test(anchor.href)) {
      return false;
    }

    let links = [anchor.href];
    // parse metadata
    const rows = document.querySelectorAll('tr[class*=metadatarow]');
    Array.from(rows).forEach(function(row) {
      // find a description field
      if (row.firstChild.textContent === 'Description') {
        links = links.concat(row.lastChild.textContent.split(','));
      }
    });

    // create container for iFrames
    const frameContainer = document.createElement('div');
    frameContainer.style.width = '100%';

    const mount = function() {
      const reqs = links.map(function(link) {
        return loadFrame(link);
      });

      Promise.all(reqs).then(function(reps) {
        // hide original viewer
        container.className += ' hide';
        // add each frames to one root
        reps.forEach(function(embeddedHTML) {
          embeddedHTML && (frameContainer.innerHTML += embeddedHTML);
        });
        // insert it
        container.parentNode.insertBefore(frameContainer, container);
      });

    };

    const unmount = function() {
      frameContainer.parentNode && frameContainer.parentNode.removeChild(frameContainer);
    };

    mount();

    return {unmount: unmount};

  }

  // set to true for global scripts or false for collection-constrained scripts
  let globalScope = true;

  // list all collection aliases that should trigger this script
  let collectionScope = [
    'p15700coll2'
  ];

  document.addEventListener('cdm-item-page:ready', function(e) {
    if (globalScope || collectionScope.includes(e.detail.collectionId)) {
      // unmount or remove current video player from DOM if it is exists
      currentInstance && currentInstance.unmount();
      // creates a new instance if it is url item and it is from vimeo.com
      currentInstance = CustomVideoView(document.querySelector('div[class*=itemUrl]'));
    }
  });

  document.addEventListener('cdm-item-page:update', function(e) {
    if (globalScope || collectionScope.includes(e.detail.collectionId)) {
      currentInstance && currentInstance.unmount();
      // updates an instance if it is url item and it is from vimeo.com
      currentInstance = CustomVideoView(document.querySelector('div[class*=itemUrl]'));
    }
  });

  document.addEventListener('cdm-item-page:leave', function(e) {
    if (globalScope || collectionScope.includes(e.detail.collectionId)) {
      // unmount or remove current video player from DOM if it is exists
      currentInstance && currentInstance.unmount();
    }
  });

})();

/* version history

1.2 - 2020 Jan 15 - reworked width to fit entire preview panel
1.1 - 2019 Aug - updated with global vs. collection toggle options
1.0 - 2018 June - initial implementation

*/

/* Collection-level scripts */

var adahCDMPageMenu = null;

(function() {
	
	function adahCDMAddClassToBody(className) {
		let els = document.getElementsByTagName('body');
		for (let i=0; i<els.length; i++) {
			if ( els[i].className.length > 0 ) {
				els[i].className += ' ';
			}
			els[i].className += className;
		}
	}
	
	function adahCDMGetGlobalProperties(e) {
		let adahCollectionData = document.getElementById('adah-meta-collection-data');
		if ( adahCollectionData ) {
			adahCollectionData.innerHTML = '';
		} else {
			let bodyElements = document.getElementsByTagName('body');
			for (i = 0; i<bodyElements.length; i++) {
				var oTable = document.createElement('table');
				
				bodyElements[i].appendChild(oTable);
				oTable.setAttribute('id', 'adah-meta-collection-data');
				oTable.setAttribute('style', 'display: none');				
			}
		}

		ScriptLoader('/customizations/global/pages/assets/js/cdm-api.js', function () {
			cdm = new cdmApi();
			jsonurl = cdm.originUrl('/customizations/global/pages/assets/json/config.json');
			let xhConfigJson = new XMLHttpRequest;
			xhConfigJson.overrideMimeType("application/json");
			xhConfigJson.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					//console.log("Got config.json");
					let adahCollectionData = document.getElementById('adah-meta-collection-data');

					if ( adahCollectionData ) {
						let jsonResponse = JSON.parse(this.responseText);
						let specColls = jsonResponse["special-collections"];
						
						adahCollectionData.innerHTML = '';
						if ( specColls ) {
							for (let coll in specColls) {
								if (specColls.hasOwnProperty(coll)) {
									let tr = document.createElement('tr');
									let th = document.createElement('th');
									let textNode = document.createTextNode(coll);
									
									th.appendChild(textNode);
									tr.appendChild(th);
									
									for (let prop in specColls[coll]) {
										let td = document.createElement('td');
										let textNode = document.createTextNode(specColls[coll][prop]);
										
										td.setAttribute('id', 'adah-meta-collection-data-' + coll + "-" + prop);
										td.setAttribute('class', 'adah-meta-collection-data-' + prop);
										td.appendChild(textNode);
										tr.appendChild(td);
									}
									
									tr.setAttribute('id', 'adah-meta-collection-data-' + coll);

									adahCollectionData.appendChild(tr);
								}
							}
							
							//const collection = e.detail.collectionId;
							//if (typeof(collection) != 'undefined' && collection.length > 0 && collection.split("|").length == 1) {
							//	console.log("STYLES: In a SINGLE COLLECTION");
							//	let tag = null;
							//	let tagEl = document.getElementById('adah-meta-collection-data-' + collection + '-tag');
							//	if (tagEl) {
							//		tag = tagEl.innerText;
							//	}
							//	if (tag == 'mosaic') {
							//		console.log("STYLES: In a MOSAIC COLLECTION");
							//		let loadedCustomCss = false;
							//		let linkEls = document.getElementsByTagName('link');
							//		for (let i = 0; i < linkEls.length; i++) {
							//			if (linkEls[i].getAttribute('rel') == 'stylesheet') {
							//				if (linkEls[i].getAttribute('data-collection-css') == 'true') {
							//					console.log(collection, "LINKEM STYLES: ", linkEls[i], 'adah-meta-collection-data-' + collection + '-tag', tag);
							//					loadedCustomCss = true;
							//				}
							//			}
							//		} /* for */
							//		
							//		if (!loadedCustomCss) {
							//			let customCssHref = '/customizations/collection/' + collection + '/' + collection + 'Styles.css';
							//			console.log("STYLES: WE NEED TO LOAD ER UP:", customCssHref );
							//			let elLink = document.createElement('link');
							//			elLink.setAttribute('data-collection-css', 'true');
							//			elLink.setAttribute('rel', 'stylesheet');
							//			elLink.setAttribute('href', customCssHref);

							//			let elRoot = document.getElementById('root');
							//			elRoot.parentNode.insertBefore(elLink, elRoot);
							//		} /* if */
							//	}
							//}
						}
					}
				
					adahCDMGetCollectionsList(e);
				
				} else if (this.readyState == 4 && this.status >= 400) {
					// ...
				}
			};
			xhConfigJson.open("GET", jsonurl, true);
			xhConfigJson.send();			
		});
	}

	function adahCDMGetCollectionsList(e) {
		let adahCollectionData = document.getElementById('adah-collection-list');
		if ( adahCollectionData ) {
			adahCollectionData.innerHTML = '';
		} else {
			let bodyElements = document.getElementsByTagName('body');
			for (i = 0; i<bodyElements.length; i++) {
				var oTable = document.createElement('table');
				
				oTable = document.createElement('table');
				bodyElements[i].appendChild(oTable);
				oTable.setAttribute('id', 'adah-collection-list');
				oTable.setAttribute('style', 'display: none');
				
			}
		}

		ScriptLoader('/customizations/global/pages/assets/js/cdm-api.js', function () {

			let cdm = new cdmApi();
			let jsonurl=cdm.originUrl("/digital/bl/dmwebservices/index.php?q=dmGetCollectionList/json");
			let xhGetCollectionList = new XMLHttpRequest;
			
			xhGetCollectionList.overrideMimeType("application/json");
			xhGetCollectionList.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {

					let adahCollectionData = document.getElementById('adah-collection-list');
					if ( adahCollectionData ) {

						let jsonResponse = JSON.parse(this.responseText);
						let colls = jsonResponse;
						for (let i = 0; i < colls.length; i++) {
							let coll = colls[i].alias.replace(/^[^A-Za-z0-9]+/, '');
							
							let tr = document.createElement('tr');
							let th = document.createElement('th');
							let textNode = document.createTextNode(coll);
							
							th.appendChild(textNode);
							tr.appendChild(th);
							
							for (let prop in colls[i]) {
								if (colls[i].hasOwnProperty(prop)) {
									let td = document.createElement('td');
									let textNode = document.createTextNode(colls[i][prop]);
									
									td.setAttribute('id', 'adah-collection-list-' + coll + "-" + prop);
									td.setAttribute('class', 'adah-collection-list-' + prop);
									td.appendChild(textNode);
									tr.appendChild(td);
								}
							}
							
							tr.setAttribute('id', 'adah-collection-list-' + coll);

							adahCollectionData.appendChild(tr);
							
						}
					}
					
				}
			}
			xhGetCollectionList.open("GET", jsonurl, true);
			xhGetCollectionList.send();
			
		});
	}
	
	function adahCDMPageMenuLoader(e) {

		adahCDMGetGlobalProperties(e);
		
		if (adahCDMPageMenu==null) {
			let head = document.getElementsByClassName('Header-header');
			let menu = document.getElementsByClassName('Header-headerMenuLinks', head);
			for (var i = 0; i < menu.length; i++) {
				adahCDMPageMenu = {'*': menu[i].innerHTML};
			} /* for */			
		} /* if */
		
		var scope=(typeof(e.detail.collectionId)=='undefined'?'*':e.detail.collectionId);
		if (typeof(adahCDMPageMenu[scope])=='undefined') {
			let jsonurl = '';
			jsonurl = [ window.location.origin, 'customizations', 'collection', scope, 'pages', 'links.html' ].join("/");
			
			let xhttp = new XMLHttpRequest;
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					adahCDMPageMenu[this.responseURL] = this.responseText;
					adahCDMAddClassToBody('cdm-custom-menu');
				} else if (this.readyState == 4 && this.status >= 400) {
					adahCDMPageMenu[this.responseURL] = '';
				}
				
				var theHtml = adahCDMPageMenu['*'];
				if (typeof(adahCDMPageMenu[this.responseURL]) != 'undefined') {
					if (adahCDMPageMenu[this.responseURL].length > 0) {
						theHtml = adahCDMPageMenu[this.responseURL];
					}
				}
				
				let head = document.getElementsByClassName('Header-header');
				let menu = document.getElementsByClassName('Header-headerMenuLinks', head);
				if (menu) {
					for (var i = 0; i < menu.length; i++) {
						if (menu[i].innerHTML != theHtml) {
							menu[i].innerHTML = theHtml;
						}
					}
				}
				
				let foot = document.getElementsByClassName('cdm-footer');
				menu = document.getElementsByClassName('FooterNavigationLinks-footerLinksHolder', foot);
				if (menu) {
					for (var i = 0; i < menu.length; i++) {
						if (menu[i].innerHTML != theHtml) {
							menu[i].innerHTML = theHtml;
						}
					}
				}

			};
			xhttp.open("GET", jsonurl, true);
			xhttp.send();			
		}
	} /* adahCDMPageMenuLoader(e) */
	
	function adahCDMAdvancedSearchPageCollectionFilters(collectionId, expandList) {
		let nameToLabel = {};
		
		let span = document.getElementById('collections-h1-collection-id');
		console.log("Advanced Search: state=", span.className);
		
		if ((span.className == 'default-selected' || span.className == 'default-selecting' || span.className == "") && collectionId.length > 0) {
			console.log("Advanced Search: Default to:", collectionId, expandList);
			
			span.className = 'default-scanning';

			let filterList = document.getElementsByClassName('SearchCollectionFilter-container');
			
			let checked=0;
			
			for (var i = 0; i < filterList.length; i++) {

				let filterListItems = filterList[i].getElementsByTagName('input');
				for (var j = 0; j < filterListItems.length; j++) {
					nameToLabel[filterListItems[j].name] = filterListItems[j].parentNode.innerText;
					
					let checkMe = false;
					if (filterListItems[j].name == "selectAll") {
						if (filterListItems[j].checked) {
							filterListItems[j].click();
						} /* if */
					} else {
						if (filterListItems[j].name == collectionId) {
							checkMe = true;
						} /* if */
					} /* if */
					
					if (filterListItems[j].name != "selectAll" && filterListItems[j].checked != checkMe) {
						filterListItems[j].click();
					} /* if */

					checked = checked + (checkMe ? 1 : 0);
				} /* for */
				
				if (checked==0 && expandList) {
					adahCDMAdvancedSearchPageButton_DoTo(function (btn, j) {
						btn.click();
					});
				} else if (checked > 0) {
					let span = document.getElementById('collections-h1-collection-id');
					span.className = 'default-selecting';
					span.innerText = ': ' + nameToLabel[collectionId];					
				} /* if */
				
				// save the changes made to selections.
				adahCDMAdvancedSearchPageButton_DoTo(function (btn, j) { btn.click(); }, '[data-id="updateBtn"]');
			} /* for */

			span = document.getElementById('collections-h1-collection-id');
			span.className = 'default-selected';
			
			if (checked>0 && !expandList) {
				adahCDMAdvancedSearchPageButton_DoTo(function (btn, j) {
					let attrExp = btn.getAttribute('data-expando');
					if (typeof(attrExp) != 'string' || attrExp.length==0) {
						btn.setAttribute('data-expando', 'to-click');
					} /* if */
				});						
			}

		} /* if */

	} /* adahCDMAdvancedSearchPageCollectionFilters() */
	
	var adahCDMAdvancedSearchPagePoll;
	var tockCount;
	
	function adahCDMAdvancedSearchPageMaybeFilterChecklist (collectionId) {
		tockCount = 0;
		
		adahCDMAdvancedSearchPagePoll = setInterval(function () {
			tockCount++;
			if (tockCount > 20) {
				clearInterval(adahCDMAdvancedSearchPagePoll);
				tockCount = 0;
			} /* if */
			
			let containers = document.getElementsByClassName('SearchCollectionFilter-container');
			console.log("tock", tockCount, containers);
			if (containers.length > 0) {
				var i=0;

				for (i=0; i < containers.length; i++) {
					if (typeof(containers[i].id) != "string" || containers[i].id != ("adah-cdm-filtered-"+i)) {
						containers[i].id = ("adah-cdm-filtered-"+i);
					} /* if */
				} /* for */
				
				if (i > 0) {
					adahCDMAdvancedSearchPageCheckboxes_Monitor();
					adahCDMAdvancedSearchPageCollectionFilters(collectionId, false);
					clearInterval(adahCDMAdvancedSearchPagePoll);
					tockCount = 0;
					
					let toClick = document.querySelectorAll('[data-expando="to-click"]');
					if (toClick.length > 0) {
						for (let i=0; i<toClick.length; i++) {
							let btn = toClick[i];
							btn.setAttribute('data-expando', 'clicked');
							setTimeout(function () { btn.click(); }, 100 /*ms*/);
						} /* for */
					} /* if */
				} /* if */
			} /* if */
		}, 10 /*ms*/);
	} /* adahCDMAdvancedSearchPageMaybeFilterChecklist () */
	
	function adahCDMAdvancedSearchPageButton_DoTo (callback, identifier) {
		let ident = (typeof(identifier)!='undefined' ? identifier : ".btn-see-more-less" );
		if (typeof(callback)=="function") {
			let filterList = document.getElementsByClassName('SearchCollectionFilter-container');
			for (var i = 0; i < filterList.length; i++) {
				let seeMoreLessButtons = filterList[i].querySelectorAll(ident);
				for (var j = 0; j < seeMoreLessButtons.length; j++) {
					callback(seeMoreLessButtons[j], j);
				} /* for */
			} /* for */
		}
	}

	function adahCDMAdvancedSearchPageCheckboxes_Monitor () {
		let containers = document.getElementsByClassName('SearchCollectionFilter-container');
		for (let i = 0; i < containers.length; i++) {
			let inputs = containers[i].querySelectorAll('input[type="checkbox"]');
			for (let j = 0; j < inputs.length; j++) {
				if (inputs[j].className!='adah-cdm-monitored') {
					inputs[j].className='adah-cdm-monitored'
					inputs[j].addEventListener('click', function (e) {
						let span = document.getElementById('collections-h1-collection-id');
						let state = span.className;

						if (state == 'default-selected') {
							span.innerText = ':';
							span.className = 'manually-selected';
						}

						console.log("CLICK(", e.target.name, "), state:", state, span.className);

					});
				}
			} /* for */
		} /* for */
	} /* function adahCDMAdvancedSearchPageCheckboxes_Monitor() */
	
	function adahCDMAdvancedSearchPage (e) {
		let jsonurl = '';
		jsonurl = window.location;

		if (typeof(e.detail.collectionId) != "undefined") {
			let collectionId = e.detail.collectionId;
			
			let h1_Containers = document.querySelectorAll('.AdvancedSearch-content');
			for (let i = 0; i < h1_Containers.length; i++) {
				let h1s = h1_Containers[i].querySelectorAll('h1');
				for (j = 0; j < h1s.length; j++) {
					let h1 = h1s[j];
					if (h1.innerText.trim().toUpperCase() == 'COLLECTIONS') {
						var newSpan = document.createElement('span');
						var newContent = document.createTextNode(":");
						
						newSpan.setAttribute("id", "collections-h1-collection-id");
						newSpan.appendChild(newContent);
						
						h1.appendChild(newSpan);
					} /* if */
					
					console.log("h1", h1.innerHTML);
				} /* for */
			} /* for */
			
			adahCDMAdvancedSearchPageCheckboxes_Monitor();
			
			adahCDMAdvancedSearchPageButton_DoTo(function (btn, j) {
				btn.id = 'btn-see-more-less-' + j;
				btn.addEventListener('click', function (e) { e.preventDefault(); adahCDMAdvancedSearchPageMaybeFilterChecklist(collectionId); });
			});
			
			adahCDMAdvancedSearchPageCollectionFilters(collectionId, true);
		} /* if */

	} /* adahCDMAdvancedSearchPage() */
	
	let retrieveMenuObjects = [
		'cdm-home-page',
		'cdm-search-page',
		'cdm-advanced-search-page',
		'cdm-collection-page',
		'cdm-collection-landing-page',
		'cdm-collection-search-page',
		'cdm-item-page',
		'cdm-custom-page',
		'cdm-about-page',
		'cdm-notfound-page'
	];
	let retrieveMenuEvents = [
		'ready',
		'update'
	];
		
	for (var i = 0; i < retrieveMenuObjects.length; i++) {
		for (var j = 0; j < retrieveMenuEvents.length; j++) {
			// custom menus
			let retrieveMenuEvent = retrieveMenuObjects[i] + ':' + retrieveMenuEvents[j];
			document.addEventListener(retrieveMenuEvent, adahCDMPageMenuLoader);
			
			// mark body with CSS class
			document.addEventListener(retrieveMenuEvent, function(e) {
				const collection = e.detail.collectionId;
				adahCDMAddClassToBody('cdm-' + collection);				
			});
			
			// advanced search page
			document.addEventListener(retrieveMenuEvent, function(e) { setupAdvancedModal(e.detail.collectionId, e.target.URL);	});

		} /* for */
	} /* for */
	
	document.addEventListener('cdm-advanced-search-page:ready', adahCDMAdvancedSearchPage)
	document.addEventListener('cdm-advanced-search-page:update', adahCDMAdvancedSearchPage)
	
	document.addEventListener('cdm-app:ready', function (e) { /*NOOP*/ });

	// advanced search window
	function setupAdvancedModal(coll, urlstring) {
		let ref = urlstring.hasUrlParameter('id');
		if (!ref) {
			sessionStorage.removeItem('lastSearchUrl');
			sessionStorage.setItem('lastSearchUrl', urlstring);
		} else {
			console.log("Viewing a record: ", ref);
		} /* if */
		
		ScriptLoader('https://cdnjs.cloudflare.com/ajax/libs/tingle/0.13.2/tingle.js', function(){
			//console.log("link: ", document.getElementsByClassName("SimpleSearch-headerAdvancedSearchButtonLink")[0]);
			
			var urlpath = urlstring.replace(/^.*?digital\//, '');
			if (document.getElementsByClassName("advanced-modal").length > 0) { 
				document.getElementsByClassName("advanced-modal")[0].parentNode.removeChild( document.getElementsByClassName("advanced-modal")[0] ); 
			}
			var advSearchContent = new tingle.modal( {cssClass: ['advanced-modal'] });
		    var advLink = document.querySelector('.SimpleSearch-headerAdvancedSearchButtonLink');
		    advLink.addEventListener('click', function(){
		        advSearchContent.open(); 
		    });
			
			// http://digital.archives.alabama.gov/customizations/global/pages/assets/html/advanced-search-form.html
		    advSearchContent.setContent('<iframe id="advSearchFrame" src="/customizations/global/pages/assets/html/advanced-search-form.html?' + coll + '&' + urlpath + '" width="100%" height="540px" scrolling="yes" frameBorder="0" style="border:none;"></iframe>'); 

			document.getElementsByClassName("SimpleSearch-headerAdvancedSearchButtonLink")[0].addEventListener("click", function(e){
				e.stopPropagation();
				e.preventDefault();
			});
			document.getElementById('advanced-search-button').addEventListener("click", function(e) {
				e.stopPropagation();
				e.preventDefault();
				
				advSearchContent.open();
			});
		});

		ScriptLoader('/customizations/global/pages/assets/js/cdm-api.js', function(){

			document.getElementById('search-input').addEventListener("keydown", function(e) {
				if (e.keyCode == 13) {
					let cdm = new cdmApi();
					if (!cdm.debugging('simplesearch')) {
						e.stopPropagation();
						e.preventDefault();
						
						cdm.submitSimpleSearch(coll);
					}
				}
			});
			
			document.getElementById('search-button').addEventListener("click", function(e) {
				if (!cdm.debugging('simplesearch')) {
					e.stopPropagation();
					e.preventDefault();

					cdm.submitSimpleSearch(coll);
				}
			});
		
		});
		
	}

})();

/* -=-=-=-= clickable-preview-pane.js =-=-=-=-*/

(function () {
	'use strict';
	
	document.addEventListener('cdm-item-page:ready', function(e) {
		console.log("clickable-preview-pane.js", "Adding preview click event.");
		let panes = document.getElementsByClassName("preview");
		for (let i = 0; i < panes.length; i++) {
			let el = panes[i];
			let btns = el.getElementsByClassName("ItemImage-expandButton");
			if (btns.length == 0) {
				let btns = el.getElementsByClassName("ItemPDF-expandButton");
			}
			if (btns.length > 0) {
				el.addEventListener("click", function(e){
					e.preventDefault();
					for (let j = 0; j < btns.length; j++) {
						btns[j].click();
					}
				});
			}
		}
	});
})();

/* -=-=-=-= button-pdf-print-1.0.js =-=-=-=- */

let button_pdf_print = (function() {
    'use strict';
    console.log("button-pdf-print", "2021.0723", "modified - only on non-PDF");
    
    // helper function to extract archival download link of current item
    function buildPDFDownloadLink(collection, item) {
      return fetch('/digital/api/collections/' + collection + '/items/' + item + '/false')
        .then(function(response) {
          // return API info about item as JSON
          return response.json();
        })
        .then(function(json) {
          // if print PDF exists get download URL
          console.log("button-pdf-print", "print PDF:", json.hasPrintPDF, "contentType:", json.contentType);
          if (json.hasPrintPDF) {
            if (json.contentType != "application/pdf") {
              let printLink = json.downloadParentUri;
              console.log("button-pdf-print", 'preview uses parent uri:', json.downloadParentUri);
              return printLink;
            }
            else {
              console.log("button-pdf-print", "preview uses own, NOT parent URI", json.contentType);
              let printLink = false;
              return printLink;
            }
          } else {
            let printLink = false;
            return printLink;
          }
        })
        .catch(function(error) {
          console.log('No print PDF link found: ' + error);
        })
    }

    let downloadPDFButton = {
      insert: function(printLink) {
        let button = document.createElement('div');
        button.className = 'btn-group btn-group-default print-pdf-button';

        let buttonAnchor = document.createElement('a');
        buttonAnchor.title = "Download Full PDF";
        buttonAnchor.href = printLink;
        buttonAnchor.className = 'cdm-btn btn btn-primary';
        buttonAnchor.target = '_self';

        let buttonIcon = document.createElement('span');
        buttonIcon.className = 'fa fa-file-pdf-o fa-2x';

        buttonAnchor.appendChild(buttonIcon);
        button.appendChild(buttonAnchor);

        Array.from(document.querySelectorAll('.ItemOptions-itemOptions>.btn-toolbar'))
          .forEach(el => {
//            el.appendChild(button.cloneNode(true)); // insert button far right
            el.prepend(button.cloneNode(true)); // insert button far left
          });
      },
      remove: function() {
        Array.from(document.querySelectorAll('.print-pdf-button'))
          .forEach(el => {
            if (el && el.parentElement) {
              el.parentElement.removeChild(el);
            }
          });
      }
    }

    // locates download link and replaces the target URL
    function removeExistingPDFDownload() {
      Array.from(document.querySelectorAll('li > a[data-metrics-event-label*="download:All"]'))
        .forEach(el => {
          if (el && el.parentNode) {
            el.parentNode.remove();
          }
        });
    }

  //helper function to sequence fetch promises
  function insertPrintPDFDownload(collection, item) {
    buildPDFDownloadLink(collection, item)
      .then(function(response) {
        if (response) {
          downloadPDFButton.insert(response);
          removeExistingPDFDownload();
        }
      });
  }

  let globalScope = true; // set to true for global scripts or false for collection-constrained scripts
  let collectionScope = [ // list all collection aliases that should trigger this script
  ];


  document.addEventListener('cdm-item-page:ready', function(e) {
    let collection = e.detail.collectionId;
    console.log("button-pdf-print-1.0.js", "cdm-item-page:ready", "insertPrintPDFDownload");
    if (globalScope || collectionScope.includes(collection)) {
      insertPrintPDFDownload(collection, e.detail.itemId);
    }
  });

  document.addEventListener('cdm-item-page:update', function(e) {
    let collection = e.detail.collectionId;
    console.log("button-pdf-print-1.0.js", "cdm-item-page:update", "downloadPDFButton.remove(); insertPrintPDFDownload");
    if (globalScope || collectionScope.includes(collection)) {
      downloadPDFButton.remove();
      insertPrintPDFDownload(collection, e.detail.itemId);
    }
  });

  document.addEventListener('cdm-item-page:leave', function(e) {
    let collection = e.detail.collectionId;
    console.log("button-pdf-print-1.0.js", "cdm-item-page:leave", "downloadPDFButton.remove()");
    if (globalScope || collectionScope.includes(collection)) {
      downloadPDFButton.remove();
    }
  });

});

button_pdf_print();

/* version history

1.0 - 2019 July - initial implementation

*/

/* -=-=-=-= pdf-objects-multipage-1_1.js =-=-=-=- */

let pdf_objects_multipage = (function() {
  'use strict';

  function getFullPDFLink(collection, item) {
    /**
     * Get the full PDF URL if there is one.
     * @param  {string} collection Alias of current collection.
     * @param  {string} item ID # of current item.
     * @return {object}         url: full PDF URL; page: current PDF page
     */

    return fetch('/digital/api/collections/' + collection + '/items/' + item + '/false')
    .then(function(response) {
      // return API info about item as JSON
      return response.json();
    })
    .then(function(json) {
      let detailsFullPDF = {};
      console.log('has full pdf: ' + json.hasPrintPDF);
      if (json.hasPrintPDF == true) {
      // if full PDF exists, get the URL
        detailsFullPDF.url = json.downloadParentUri;
        if (item === json.parentId) {
          //the current item is the parent item
          detailsFullPDF.page = 0;
        } else {
          const itemNumber = Number(item);
          //convert string to number for downstream equivalence
          let pagePosition = json.parent.children.map(el => el.id).indexOf(itemNumber);
          pagePosition++;
          //add one to align value to pdf.js #page= parameter
          detailsFullPDF.page = pagePosition;
        }
        return detailsFullPDF;
        //return is an object
      } else {
        return false;
      }
    })
    .catch(function(error) {
      console.log('No full PDF link found: ' + error);
    })
  }

  function lightboxCleanup() {
    let lightbox = document.getElementById('full-pdf-viewer');
    lightbox.parentNode.removeChild(lightbox);
  }

  function buildLightbox(link,page) {
    /**
     * Get the full PDF URL if there is one.
     * @param  {string} link The URL of the full PDF.
     * @param  {string} page The specific page of the PDF currently viewed.
     */

    const previousLightbox = document.getElementById('full-pdf-viewer');
    if (previousLightbox) {
      //cleanup any previous instances of lightbox
      previousLightbox.parentNode.removeChild(previousLightbox);
    }
    const newLightbox = document.createElement('div');
      newLightbox.className = 'Lightbox-lightbox';
      newLightbox.id = 'full-pdf-viewer';
    const itemContainer = document.createElement('div');
      itemContainer.id = 'full-pdf-container';
      itemContainer.className = 'ItemModalViewer-container';
    const pdfContainer = document.createElement('div');
      pdfContainer.className = 'PDFViewer-pdfFrame';
    const iframePDF = document.createElement('iframe');
      let fullPDFLink = link;
      let currentPage = Number(page);
      if (currentPage === 0) {
      //if parent is being viewed, render page 1 in pdf.js
        fullPDFLink += '#page=1';
      } else if (currentPage > 0) {
        fullPDFLink += '#page=' + page;
      }
      iframePDF.src = '/digital/pdf.js/web/viewer.html?file=' + fullPDFLink;
    const closeButtonContainer = document.createElement('div');
      closeButtonContainer.className = 'btn-group';
    const closeButton = document.createElement('button');
    const closeIcon = document.createElement('i');
      closeIcon.classList.add('fa','fa-times-circle');
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', function(){lightboxCleanup();});
    closeButtonContainer.appendChild(closeButton);

    pdfContainer.appendChild(iframePDF);
    itemContainer.appendChild(pdfContainer);
    itemContainer.appendChild(closeButtonContainer);
    newLightbox.appendChild(itemContainer);

    document.querySelector('[data-id="itemViewPageFound"]').prepend(newLightbox);
  }

  function changeButtonBehavior(detailsPDF)  {
    let button = document.querySelector('button.ItemPDF-expandButton');
    button.addEventListener('click', function(e){
      e.stopPropagation();
      buildLightbox(detailsPDF.url,detailsPDF.page);
    });
  }

  function replaceLightbox(collection, item) {
  //helper function to sequence fetch promises
    getFullPDFLink(collection, item)
    .then(function(response) {
      if (response) {
        changeButtonBehavior(response);
      }
    });
  }

  let globalScope = true;
  let collectionScope = [
    ''
  ];

  document.addEventListener('cdm-item-page:ready', function(e) {
    const collection = e.detail.collectionId;
    if (globalScope || collectionScope.includes(collection)) {
      replaceLightbox(collection, e.detail.itemId);
    }
  });

  document.addEventListener('cdm-item-page:update', function(e) {
    const collection = e.detail.collectionId;
    if (globalScope || collectionScope.includes(collection)) {
      replaceLightbox(collection, e.detail.itemId);
    }
  });

  document.addEventListener('cdm-item-page:leave', function(e) {
    const collection = e.detail.collectionId;
    if (globalScope || collectionScope.includes(collection)) {
      //nothing to clean up at page exit
    }
  });

});

//pdf_objects_multipage();

/* version history

1.1 - 2020 Sep 29 - a few bug fixes; added code comments
1.0 - 2020 Sep 28 - initial implementation

*/

(function() {
  'use strict';

	let crossReferenceScanObjects = [
		'cdm-item-page',
	];
	let crossReferenceScanEvents = [
		'ready',
		'update'
	];
		
	for (var i = 0; i < crossReferenceScanObjects.length; i++) {
		for (var j = 0; j < crossReferenceScanEvents.length; j++) {
			// custom menus
			let crossReferenceScanEvent = crossReferenceScanObjects[i] + ':' + crossReferenceScanEvents[j];
			document.addEventListener(crossReferenceScanEvent, adahInsertCrossReferencedImageLink);

		} /* for */
	} /* for */

function adahInsertCrossReferencedImageLink () {
	let el = getCrossReferencedImageLink();
	if ( el ) {
		console.log("in adahInsertCrossReferencedImageLink", "got cross-referenced image:", el);
		let preview = document.getElementsByClassName('preview');
		for (let i = 0; i<preview.length; i++) {
			let children = preview[i].getElementsByTagName('img');
			if ( children.length == 0 ) {
				console.log("in adahInsertCrossReferencedImageLink", "append child:", el);
				preview[i].appendChild(el);
			}
		}
	}
	
}

function getCrossReferencedImageLink ( imgSlug ) {
	let elLinkedImg = null;
	let elImg = getCrossReferenceLinkImage(imgSlug);

	if ( elImg ) {
		elLinkedImg = document.createElement('a');
		elLinkedImg.appendChild(elImg);
		if ( elImg.getAttribute('data-link') ) {
			elLinkedImg.href = elImg.getAttribute('data-link');
		}
	}
	return elLinkedImg;
	
}

function getCrossReferenceLinkImage ( imgSlug ) {

	let elDescriptionTable = document.getElementById('singleItemDescription');
	
	let elImg = null;

	if ( ! imgSlug ) { 
		imgSlug = 'default.jpg?highlightTerms=';
	}
	
	if ( elDescriptionTable ) {
		let elKeyValuePair = elDescriptionTable.getElementsByClassName('field-descri');
		if ( elKeyValuePair.length > 0 ) {
			let elValue = elKeyValuePair[0].getElementsByClassName('field-value');
			if ( elValue.length > 0 ) {
				let elValueLink = elValue[0].getElementsByTagName('a');
				if ( elValueLink.length > 0 ) {
					elImg = document.createElement('img');
					
					let sHref = elValueLink[0].href;
					sHref = sHref.replace(/(\/digital\/)collection\/([^/]+\/)id\/([^/]+)(\/.*)?$/, "$1api/singleitem/image/$2$3");
					
					elImg.src = ( sHref + "/" + imgSlug );
					elImg.alt = elValue[0].innerText;
					elImg.setAttribute( 'data-link',  elValueLink[0].href  );
				}
			}
		}
	}
	
	return elImg;
}

})();

function ScriptLoader(url, callback){
	console.log("ScriptLoader:", url, callback);
	let tags = [].slice.call(document.getElementsByTagName('script')).filter(function (el) {
		let include = false;
		if (el.className.length > 0) {
			let aClasses = el.className.split(/\s+/);
			include = (aClasses.indexOf("scriptLoader") >= 0);
		}
		return include;
	}).filter(el => (el.src == url));

	if (tags.length == 0) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.className = "scriptLoader";
		if (script.readyState){ //IE
			script.onreadystatechange = function() {
				if (script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
		} else { //Others
			//console.log("script.onload", callback);
			script.onload = function(){
				callback();
			};
		}
		script.src = url;
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	else {
		callback();
	} /* if */
}

String.prototype.hasUrlParameter = function (name) {
	var re = new RegExp('(^|/)(' + name + ')(/+([^/]+))?(/|$)');
	return this.toString().match(re);
};
