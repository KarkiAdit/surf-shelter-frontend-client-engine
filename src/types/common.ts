export interface Type {
    type: 'PAGE_DATA' | 'UPDATE_POPUP';
}

export interface ResponseSuccess {
    success: boolean;
    status: number;
}
export interface PageData {
    url: string;
    content: string;
}

export interface ResponseStatus {
    code: number;
    message: string;
}

export interface Features {
    url_length: number;
    tld_analysis_score: number;
    ip_analysis_score: number;
    sub_domain_analysis_score: number;
    levenshtein_dx: number;
    time_to_live: number;
    domain_age: number;
    reputation_score: number;
}

export interface Prediction {
    predicted_label: boolean;
    accuracy: number;
    precision: number;
    loss: number;
}

export interface PredictionDetails {
    features: Features;
    prediction: Prediction;
}

export interface PredictionInfo {
    status: ResponseStatus;
    prediction_details?: PredictionDetails; // optional
}

export interface PredictionRequestMessage {
    type: Type['type'];
    pageData: PageData;
}

export interface PredictionResponseMessage {
    type: Type['type'];
    predictionInfo: PredictionInfo | null;
    error: string | null;
}