import { PageData, PredictionInfo, PredictionRequestMessage, ResponseSuccess } from "../types/common";

chrome.runtime.onMessage.addListener(
    (message: PredictionRequestMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: ResponseSuccess) => void) => {
        if (!sender.tab) {
            console.log('This message did not come from the content script.');
            return;
        }
        // Set loading status in local storage to inform the popup
        chrome.storage.local.set({ isLoading: true });
        // Call predictWebsiteNature and handle the prediction asynchronously
        predictWebsiteNature(message.pageData).then(prediction => {
            // Save prediction result to local storage
            chrome.storage.local.set({ prediction, isLoading: false }, () => {
                console.log('Prediction stored:', prediction);
                // Notify the popup to update with the new prediction
                chrome.runtime.sendMessage({ type: 'UPDATE_POPUP', predictionInfo: prediction });
            });
            sendResponse({ success: true, status: 200 });
        }).catch(error => {
            console.error("Prediction failed:", error);
            // Set error status in local storage
            chrome.storage.local.set({ isLoading: false, prediction: null });
            sendResponse({ success: false, status: 500 });
        });
        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
 );

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

async function predictWebsiteNature(data: PageData): Promise<PredictionInfo> {
    const predictionUrl = `https://prediction-engine-470259027402.us-central1.run.app/prediction/predict`;
    const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url }),
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

