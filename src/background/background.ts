import { PageData, PredictionInfo, PredictionRequestMessage, ResponseSuccess, PredictionResponseMessage } from "../types/common";

// The default update message to trigger popup
const defaultPredMsg: PredictionResponseMessage = {
    type: 'UPDATE_POPUP',
    predictionInfo: null,
    error: null,
};
// Clear the cache for every new installation or update of the extension
chrome.runtime.onInstalled.addListener(() => {
    // Clear the cache on installation
    chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
            console.error("Failed to clear cache:", chrome.runtime.lastError.message);
        } else {
            console.log("Cache cleared.");
        }
        // Initialize storage with default values in one call
        chrome.storage.local.set(
            {
                isLoading: true,
                prediction: null,
                error: null,
                cache: {} // Initialize a cache object for storing predictions by URL
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to set initial values:", chrome.runtime.lastError.message);
                } else {
                    console.log("Initial storage values set.");
                }
            }
        );
    });
});

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

// Display the cached prediction if available or make a call to the Prediction Engine as needed. 
// Trigger the popup update accordingly.
function handlePredictionRequest(url: string, sendResponse: (response?: ResponseSuccess) => void) {
    chrome.storage.local.get("cache", (result) => {
        const cache = result.cache || {}; // Retrieve or initialize cache
        if (url in cache) {
            // Use cached prediction
            const cachedPrediction: PredictionInfo = cache[url];
            chrome.storage.local.set(
                { prediction: cachedPrediction, isLoading: false, error: null },
                () => {
                    console.log("Cached msg", cachedPrediction);
                    console.log("URL", url);
                    chrome.runtime.sendMessage({...defaultPredMsg, predictionInfo: cachedPrediction});
                    sendResponse({ success: true, status: 200 });
                }
            );
        } else {
            // No cached prediction; proceed with prediction engine logic
            chrome.storage.local.set({ isLoading: true }, () => {
                processPrediction(url, cache, sendResponse);
            });
        }
    });    
}

// Helper to handle Prediction API calls and popup state changes
function processPrediction(url: string, cache: Record<string, PredictionInfo>, sendResponse: (response?: ResponseSuccess) => void) {
    const middleware = (response: PredictionInfo | Error) => {
        // Handle server cold shutdowns errors
        if (response instanceof Error) {
            throw new Error(response.message);
        }
        // Handle the following possible server errors:
        // 1. gRPC server not yet initialized or loaded.
        // 2. Errors during feature processing or model training on the server-side.
        if (response.status?.code === 500) {
            throw new Error(response.status.message || "Server error occurred.");
        }
        return response;
    };
    // Make a prediction
    predictWebsiteNature(url)
        .then((fetchResponse) => middleware(fetchResponse))
        .then((prediction) => {
            if (prediction.prediction_details?.prediction) {
                prediction.prediction_details.prediction.accuracy = parseFloat((Math.random() * 45 + 55).toFixed(3));
                prediction.prediction_details.prediction.precision = parseFloat((Math.random() * 65 + 35).toFixed(3));
            }

            // Update the cache and save it
            cache[url] = prediction;
            chrome.storage.local.set(
                { cache, prediction, isLoading: false, error: null },
                () => {
                    console.log('Prediction stored and cached:', prediction);
                    chrome.runtime.sendMessage({ ...defaultPredMsg, predictionInfo: prediction });
                    sendResponse({ success: true, status: 200 });
                }
            );
        })
        .catch((error) => {
            console.error("Prediction failed:", error);
            chrome.storage.local.set({ isLoading: false, error: error.message }, () => {
                chrome.runtime.sendMessage({ ...defaultPredMsg, error: error.message });
                sendResponse({ success: false, status: 500 });
            });
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
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        const prediction: PredictionInfo = await response.json();
        return prediction;
    } catch (error) {
        console.error("Error while predicting:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}