const pageMessage = {
    type: 'PAGE_DATA',
    pageData: {
        url: window.location.href,
        content: document.body.innerText
    }
 };
 
chrome.runtime.sendMessage(pageMessage, (response) => {
    if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
    } else {
        console.log("Message sent to background script:", response);
    }
});
 