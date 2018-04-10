// STATUS: Can toggle BM via icon; toggling icon off deletes entry for current URL (test tab switching)
// TODOS:  -- Sanitize urls to remove parameters when saving/retrieving -- Examine bug, scroll events not firing when changing tabs (have to refresh tab for scroll events to work - may have just been test steps issue) -- On new page, BM not toggling to active on first click
// BACKLOG: Add popup UI to view currently tracked bookmarks

const GREY_ICON_PATH = "assets/icons/bm_grey.png";
const BLUE_ICON_PATH = "assets/icons/bm_blue.png";
let currentPageData = {};
let bookmarkingActive;
let lastScrollPosition = 0;

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		var activeTab = tabs[0];
		// var message = {"message": "clicked_browser_action"};
		// chrome.tabs.sendMessage(activeTab.id, message, responseHandler);
		toggleBookmark(activeTab);
		}
	)
});

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
		if(message.event === "load"){
			let url = message.url
			chrome.storage.sync.get(url, function(item){
				// Null check
				if(!(Object.keys(item).length === 0 && item.constructor === Object)){
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
						const activeTab = tabs[0];
						currentPageData = item[url];
						bookmarkingActive = true;
						setIcon(activeTab.id, BLUE_ICON_PATH);
						const message = {"message": "bookmark_found", "bookmarkAt": currentPageData.scrollPosition};
						chrome.tabs.sendMessage(activeTab.id, message, responseHandler);
					});
				}
			});
		}
		
		if(message.event === "scroll" && bookmarkingActive){
			currenPageData = saveBookmark(message.url, message.scrollPosition);
			lastScrollPosition = message.scrollPosition;
		}
		console.log(message.event);	//DEBUG
	}
);

function responseHandler(response){
	//console.log(response);
}

setIcon = (tabId, iconPath) => {
		chrome.browserAction.setIcon({
        path: iconPath,
        tabId: tabId
    });
}

saveBookmark = (url, scrollPosition) => {
	let objectToSave = {};
	objectToSave[url] = {"scrollPosition": scrollPosition, "url": url};
	console.log(objectToSave);	//DEBUG
	chrome.storage.sync.set(objectToSave, function(){
		console.log(`Bookmark for ${url} at ${scrollPosition} saved!`);
	});
	return objectToSave;
}

removeBookmark = (url) => {
	chrome.storage.sync.remove(url, function(Items) {
		console.log(`Bookmark for ${url} removed`)
	});
}

toggleBookmark = (activeTab) => {
	console.log(currentPageData)	//DEBUG
	if(bookmarkingActive){
		console.log(currentPageData);
		if(currentPageData.url){
			removeBookmark(currentPageData.url);
		} 
		bookmarkingActive = false;
		setIcon(activeTab.id, GREY_ICON_PATH);
	} else{
		console.log('Bookmarking enabled');
		bookmarkingActive = true;
		setIcon(activeTab.id, BLUE_ICON_PATH);
	}
}

//chrome.storage.sync.clear(); //UNCOMMENT AND RUN TO CLEAR STORAGE