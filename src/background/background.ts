import { PageData, PredictionInfo, PredictionRequestMessage, ResponseSuccess } from "../types/common";

// Listen for messages from the contentScript
chrome.runtime.onMessage.addListener(
    (message: PredictionRequestMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: ResponseSuccess) => void) => {
        if (!sender.tab) {
            console.log('This message did not come from the content script.');
            return;
        }
        const pageData: PageData = message.pageData;
        handlePredictionRequest(pageData.url, sendResponse);
        return true; // To indicate that the response will be sent asynchronously
    }
);

// Listen for tab changes and fetch predictions for the active tab's URL
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log("Tab Activated:", activeInfo)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
        handlePredictionRequest(tab.url, () => {});
    }
});


// Make calls to Prediction Engine if necessary and trigger popup
function handlePredictionRequest(url: string, sendResponse: (response?: ResponseSuccess) => void) {
    // Check if there’s already a cached prediction for this URL
    chrome.storage.local.get(url, (result) => {
        if (result[url]) {
            // Use the cached prediction
            const cachedPrediction = result[url];
            chrome.storage.local.set({ prediction: cachedPrediction, isLoading: false }, () => {
                chrome.runtime.sendMessage({ type: 'UPDATE_POPUP', predictionInfo: cachedPrediction });
            });
            sendResponse({ success: true, status: 200 });
        } else {
            // No cached prediction; proceed with making Prediction Engine call
            chrome.storage.local.set({ isLoading: true });
            predictWebsiteNature(url).then(prediction => {
                // Cache the prediction result using the URL as the key
                chrome.storage.local.set({ [url]: prediction, prediction, isLoading: false }, () => {
                    console.log('Prediction stored and cached:', prediction);
                    // Notify the popup to update with the new prediction
                    chrome.runtime.sendMessage({ type: 'UPDATE_POPUP', predictionInfo: prediction });
                });
                sendResponse({ success: true, status: 200 });
            }).catch(error => {
                console.error("Prediction failed:", error);
                chrome.storage.local.set({ isLoading: false, prediction: null });
                sendResponse({ success: false, status: 500 });
            });
        }
    });
}

async function fetchWithRetry(url: string, options: RequestInit, retries: number = 3, delay: number = 2000): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            console.error(`Attempt ${i + 1} failed with status ${response.status}`);
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

async function predictWebsiteNature(url: string): Promise<PredictionInfo> {
    const predictionUrl = `https://prediction-engine-470259027402.us-central1.run.app/prediction/predict`;
    const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
    };

    try {
        const response = await fetchWithRetry(predictionUrl, options, 3, 3000);
        const prediction: PredictionInfo = await response.json();
        return prediction;
    } catch (error) {
        console.error("Error calling the prediction engine API:", error);
        return {
            isMalicious: false,
            accuracy: -1.0,
            pValueAccuracy: -1.0,
            loss: -1.0,
        };
    }
}
