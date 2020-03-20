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

    const links = [anchor.href];
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
	
	function adahCDMPageMenuLoader(e) {
		
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
			jsonurl = window.location.origin + '/customizations/collection/'+scope+'/pages/links.html';
			console.log("check for menu", jsonurl);
			
			var xhttp = new XMLHttpRequest;
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					adahCDMPageMenu[this.responseURL] = this.responseText;
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

			};
			xhttp.open("GET", jsonurl, true);
			xhttp.send();			
		}
	} /* adahCDMPageMenuLoader(e) */
	
	function adahCDMAdvancedSearchPageCollectionFilters(collectionId, expandList) {
		if (collectionId.length > 0) {
			console.log("Advanced Search: Default to:", collectionId, expandList);
			
			let filterList = document.getElementsByClassName('SearchCollectionFilter-container');
			
			let checked=0;
			
			for (var i = 0; i < filterList.length; i++) {

				let filterListItems = filterList[i].getElementsByTagName('input');
				for (var j = 0; j < filterListItems.length; j++) {
					
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
					
					/*console.log(filterListItems[j], checkMe);*/
					if (filterListItems[j].name != "selectAll" && filterListItems[j].checked != checkMe) {
						filterListItems[j].click();
					} /* if */

					checked = checked + (checkMe ? 1 : 0);
				} /* for */
				
				if (checked==0 && expandList) {
					adahCDMAdvancedSearchPageButton_DoTo(function (btn, j) {
						btn.click();
					});
				} /* if */
				
				adahCDMAdvancedSearchPageButton_DoTo(function (btn, j) { console.log(j, btn); }, '[data-id="updateBtn"]');
			} /* for */
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
					adahCDMAdvancedSearchPageCollectionFilters(collectionId, false);
					clearInterval(adahCDMAdvancedSearchPagePoll);
					tockCount = 0;
				} /* if */
			} /* if */
		}, 10 /*ms*/);
	} /* adahCDMAdvancedSearchPageMaybeFilterChecklist () */
	
	function adahCDMAdvancedSearchPageButton_DoTo (callback) {
		if (typeof(callback)=="function") {
			let filterList = document.getElementsByClassName('SearchCollectionFilter-container');
			for (var i = 0; i < filterList.length; i++) {
				let seeMoreLessButtons = filterList[i].getElementsByClassName('btn-see-more-less');
				for (var j = 0; j < seeMoreLessButtons.length; j++) {
					callback(seeMoreLessButtons[j], j);
				} /* for */
			} /* for */
		}
	}
	
	function adahCDMAdvancedSearchPage (e) {
		let jsonurl = '';
		jsonurl = window.location
		console.log("advanced search: collection=", e.detail.collectionId, e.props, e, jsonurl);

		if (typeof(e.detail.collectionId) != "undefined") {
			let collectionId = e.detail.collectionId;

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
			let retrieveMenuEvent = retrieveMenuObjects[i] + ':' + retrieveMenuEvents[j];
			document.addEventListener(retrieveMenuEvent, adahCDMPageMenuLoader);
		} /* for */
	} /* for */
	
	document.addEventListener('cdm-advanced-search-page:ready', adahCDMAdvancedSearchPage)
	document.addEventListener('cdm-advanced-search-page:update', adahCDMAdvancedSearchPage)
	
	document.addEventListener('cdm-app:ready', function (e) { console.log("CDM APP:", e); });
	
})();
