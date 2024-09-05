import { PageData, PredictionInfo, PredictionRequestMessage } from "../types/common";

chrome.runtime.onMessage.addListener(
    (message: PredictionRequestMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        // Check if the message is from a content script
        if (!sender.tab) {
            console.log('Message not from the content script.');
            return;
        }
        // Perform ML prediction logic using the latest Supervised Model
        const prediction = predictWebsiteNature(message.pageData);
        // Add any additional logic here if neededß
        // Save prediction result to local storage
        chrome.storage.local.set({ prediction }, () => {
            console.log('Prediction stored:', prediction);
            // Notify the popup to update with the new prediction
            chrome.runtime.sendMessage({ type: 'UPDATE_POPUP', prediction });
        });
        // Send a success response back to the content script for confirmation
        sendResponse({ success: true });
        // Return true to indicate that the response is asynchronous
        return true;
    }
);

function predictWebsiteNature(data: PageData): PredictionInfo {
    console.log("The current website data given by contentScript: ", data);
    // Add Server Engine logic here
    return {
        isMalicious: false,
        accuracy: 0.95,
        pValueAccuracy: 0.05,
        loss: 0.15
    }
}
