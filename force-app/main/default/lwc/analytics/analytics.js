const API_ENDPOINT = 'https://platform.cloud.coveo.com/rest/ua/v15/analytics';
const API_METHOD = 'POST';
const SEARCH_PATH = '/search';
const CLICK_PATH = '/click';
const CUSTOM_PATH = '/custom';
const API_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};
const VISITOR_ID_KEY = 'coveo_visitorId';

export default class Analytics {

  static getVisitorId() {
    return window.localStorage.getItem(VISITOR_ID_KEY);
  }

  static setVisitorId(visitorId) {
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  static async logSearchEvent(searchAPIResponse, additionalBody, endpoint, visitorId) {
    const requestBody = {
      numberOfResults: searchAPIResponse.totalCount || 0,
      responseTime: searchAPIResponse.duration || 0,
      searchQueryUid: searchAPIResponse.searchUid,
      queryPipeline: searchAPIResponse.pipeline,
      ...additionalBody
    }

    visitorId = visitorId || Analytics.getVisitorId() || null;
    const visitorString = (visitorId) ? `?visitor=${visitorId}` : '';

    return fetch(`${API_ENDPOINT}${SEARCH_PATH}${visitorString}`, {
      method: API_METHOD,
      headers: { ...API_HEADERS, Authorization: `Bearer ${endpoint.token}` },
      body: JSON.stringify(requestBody)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          return response;
        }
      })
      .then(response => response.json())
      .then(jsonResponse => {
        Analytics.setVisitorId(jsonResponse.visitorId);
        return jsonResponse;
      });
  }

  static async logClickEvent(result, additionalBody, endpoint, visitorId) {
    const requestBody = {
      documentUri: result.uri,
      documentUriHash: result.raw.urihash,
      sourceName: result.raw.source,
      documentTitle: result.title,
      documentUrl: result.uri,
      contentIDKey: '@permanentid',
      contentIDValue: result.raw.permanentid,
      ...additionalBody
    }

    visitorId = visitorId || Analytics.getVisitorId() || null;
    const visitorString = (visitorId) ? `?visitor=${visitorId}` : '';

    return fetch(`${API_ENDPOINT}${CLICK_PATH}${visitorString}`, {
      method: API_METHOD,
      headers: { ...API_HEADERS, Authorization: `Bearer ${endpoint.token}` },
      body: JSON.stringify(requestBody)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          return response;
        }
      })
      .then(response => response.json())
      .then(jsonResponse => {
        Analytics.setVisitorId(jsonResponse.visitorId);
        return jsonResponse;
      });
  }
}