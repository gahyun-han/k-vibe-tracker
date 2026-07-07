export function getTourApiKey() {
  return process.env.TOUR_API_KEY;
}

export function getAiWorkerUrl() {
  return process.env.AI_WORKER_URL;
}

export function isAiWorkerAnalysisEnabled() {
  return process.env.ENABLE_AI_WORKER_ANALYSIS === 'true';
}
