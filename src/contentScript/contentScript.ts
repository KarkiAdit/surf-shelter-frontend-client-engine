const pageMessage = {
    type: 'PAGE_DATA',
    pageData: {
        url: window.location.href,
        content: document.body.innerText
    }
}

chrome.runtime.sendMessage(pageMessage);
