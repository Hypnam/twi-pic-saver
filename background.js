chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background script:", message);
    if (message.url && message.filename) {
        console.log("Downloading:", message.url, "as", message.filename);
        chrome.downloads.download({
            url: message.url,
            filename: message.filename
        }, downloadId => {
            if (downloadId) {
                console.log(`Download started with ID: ${downloadId}`);
                chrome.downloads.onChanged.addListener(function onChanged(delta) {
                    if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
                        console.log(`Download completed with ID: ${downloadId}`);
                        chrome.tabs.remove(sender.tab.id, () => {
                            if (chrome.runtime.lastError) {
                                console.error(`Error closing tab ${sender.tab.id}:`, chrome.runtime.lastError);
                            } else {
                                console.log(`Tab ${sender.tab.id} closed successfully`);
                            }
                        });
                        chrome.downloads.onChanged.removeListener(onChanged);
                    }
                });
            } else {
                console.error("Failed to start download:", chrome.runtime.lastError);
            }
        });
    }
});
