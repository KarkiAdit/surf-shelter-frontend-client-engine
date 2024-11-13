export interface Type {
    type: 'PAGE_DATA' | 'PREDICT' | 'UPDATE_POPUP';
}

export interface ResponseSuccess {
    success: boolean;
    status: number;
}
export interface PageData {
    url: string;
    content: string;
}

export interface PredictionInfo {
    isMalicious: boolean;
    accuracy: number;
    pValueAccuracy: number;
    loss: number;
}

export interface PredictionRequestMessage {
    type: Type['type'];
    pageData: PageData;
}

export interface PredictionResponseMessage {
    type: Type['type'];
    predictionInfo: PredictionInfo;
}