document.getElementById("btn").addEventListener("click", async () => {
    console.log("Button clicked");
    let tabs = await chrome.tabs.query({});
    console.log("Tabs fetched:", tabs);
    tabs.forEach(tab => {
        if (tab.url && tab.url.startsWith('https://pbs.twimg.com/')) {
            console.log("Processing tab.id:", tab.id);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: findAndDownloadImages
            }).then((result) => {
                console.log(`Script executed on tab ${tab.id}`, result);
            }).catch(err => {
                console.error(`Error executing script on tab ${tab.id}:`, err);
            });
        }
    });
});


function findAndDownloadImages() {
    console.log("Running findAndDownloadImages");

    const pageContent = document.body.innerHTML;
    const decodedContent = pageContent.replace(/&amp;/g, '&');
    //decodedContentの中身見るために使ってたconsole.log
    //console.log("Page content length:", decodedContent.length);
    //console.log("Page content snippet:", decodedContent.slice(0, 500));

    const regex = /https:\/\/pbs\.twimg\.com\/media\/[a-zA-Z0-9\-_]+\?format=(jpg|png|gif|webp|mp4)&name=[a-zA-Z0-9\-_]+/g;
    const matches = decodedContent.match(regex);
    console.log("Matches found:", matches);

    if (matches) {
        matches.forEach(url => {
            const format = url.match(/format=([a-zA-Z0-9]+)/)[1];
            const fileName = url.split('/').pop().split('?')[0] + '.' + format;
            console.log("Sending message to background script with URL:", url, "and filename:", fileName);
            chrome.runtime.sendMessage({ url: url, filename: fileName });
        });
    }
}

