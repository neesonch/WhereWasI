// STATUS: Icon greyed out unless bookmark found. Next step: add conditional logic to enable/disable tracking and change icon accordingly
// TODOS: Debounce scrolling to resolve error? Unload approach not workable (scrolling seems to be working now that reference to function is passed in instead of deifing the function inline) -- Sanitize urls to remove parameters when saving/retrieving -- Examine bug, scroll events not firing when changing tabs (have to refresh tab for scroll events to work - may have just been test steps issue) -- Enable/disable bookmark tracking on click of icon
// BACKLOG: Add popup UI to view currently tracked bookmarks

const GREY_ICON_PATH = "assets/icons/bm_grey.png";
const BLUE_ICON_PATH = "assets/icons/bm_blue.png";

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		var activeTab = tabs[0];
		var message = {"message": "clicked_browser_action"};
		chrome.tabs.sendMessage(activeTab.id, message, responseHandler);
		console.log(message);
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
						const pageData = item[url];
						const message = {"message": "bookmark_found", "bookmarkAt": pageData.scrollPosition};
						chrome.tabs.sendMessage(activeTab.id, message, responseHandler);
						const iconPath = pageData.bookmarkEnabled ? BLUE_ICON_PATH : GREY_ICON_PATH;
						setIcon(activeTab.id, iconPath);
					});
				}
			});
		}
		
		if(message.event === "scroll"){
			saveBookmark(message.url, message.scrollPosition);
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
	objectToSave[url] = {"scrollPosition": scrollPosition, "bookmarkEnabled": true};
	console.log(objectToSave);	//DEBUG
	chrome.storage.sync.set(objectToSave, function(){
		console.log("Bookmark for " + url + " at " + scrollPosition + " saved!");
	});
}

//chrome.storage.sync.clear(); //UNCOMMENT AND RUN TO CLEAR STORAGE