var currentScrollPosition; 

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.message === "clicked_browser_action") {
			let url = window.location.href; 
			console.log("Icon clicked!");
			sendResponse({"url": url});
		} else if(request.message === "bookmark_found"){
			console.log(request.bookmarkAt)
			scrollToBookmark(request.bookmarkAt);
		} else{
			console.log("Message received:" + request.message);
		}
	}
);

window.addEventListener("load", function(e){
	let url = window.location.href; 
	chrome.runtime.sendMessage({
		"event" : e.type,
		"url" : url
	})
});

function dispatchScrollPosition(e){
	let scrollPosition = document.body.scrollTop || document.documentElement.scrollTop;
	let url = window.location.href; 
	console.log(e.type);
	chrome.runtime.sendMessage({
		"event" : e.type,
		"url" : url,
		"scrollPosition": scrollPosition
		});
}

document.addEventListener("scroll", dispatchScrollPosition);


const scrollToBookmark = (bookmark) => {
	let scrollPosition = document.body.scrollTop || document.documentElement.scrollTop;
	if (bookmark != scrollPosition){
		document.body.scrollTop = bookmark;
		document.documentElement.scrollTop = bookmark;
	}
}

