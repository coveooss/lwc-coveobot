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

  /**
   * Get the visitorId from localStorage.
   */
  static getVisitorId() {
    return window.localStorage.getItem(VISITOR_ID_KEY);
  }

  /**
   * Store a value in localStorage for the visitorId.
   * @param {String} visitorId The visitorId to store in localStorage
   */
  static setVisitorId(visitorId) {
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  /**
   * Log a search event to the Coveo Usage Analytics API. It is built from the response of a search call {searchAPIResponse}.
   * If you do not want to manually control the visitorId, leave it empty, it will be handled automatically.
   * @param {Object} searchAPIResponse The response from the Coveo's Search API /rest/search call.
   * @param {Object} additionalBody Additional data to send along with the call in the body.
   * @param {SearchEndpoint} endpoint The endpoint to target with the API call. (Mainly used to get the token from.)
   * @param {String} visitorId A visitorId to set. Leave blank if you do not want manual control on the visitorId.
   */
  static async logSearchEvent(searchAPIResponse, additionalBody, endpoint, visitorId) {
    const requestBody = {
      numberOfResults: searchAPIResponse.totalCount || 0,
      responseTime: searchAPIResponse.duration || 0,
      searchQueryUid: searchAPIResponse.searchUid,
      queryPipeline: searchAPIResponse.pipeline,
      ...additionalBody
    }

    const visitorString = Analytics.buildVisitorIdString(visitorId);

    try {
      const response = await fetch(`${API_ENDPOINT}${SEARCH_PATH}${visitorString}`, {
        method: API_METHOD,
        headers: { 
          ...API_HEADERS, 
          Authorization: `Bearer ${endpoint.token}` 
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const jsonResponse = await response.json();
      Analytics.setVisitorId(jsonResponse.visitorId);
      return jsonResponse;
    } catch (error) {
      console.error(`Error sending search event: ${error.message}`);
      return {};
    }
  }

  /**
   * Log a click event to the Coveo Usage Analytics API. It is built from a result coming from a search call.
   * If you do not want to manually control the visitorId, leave it empty, it will be handled automatically.
   * @param {Object} result A specific result coming from the response from Coveo's Search API /rest/search call.
   * @param {Object} additionalBody Additional data to send along with the call in the body.
   * @param {SearchEndpoint} endpoint The endpoint to target with the API call. (Mainly used to get the token from.)
   * @param {String} visitorId A visitorId to set. Leave blank if you do not want manual control on the visitorId.
   */
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

    const visitorString = Analytics.buildVisitorIdString(visitorId);

    try {
      const response = await fetch(`${API_ENDPOINT}${CLICK_PATH}${visitorString}`, {
        method: API_METHOD,
        headers: { 
          ...API_HEADERS, 
          Authorization: `Bearer ${endpoint.token}` 
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const jsonResponse = await response.json();
      Analytics.setVisitorId(jsonResponse.visitorId);
      return jsonResponse;
    } catch (err) {
      console.error(err.message);
      return {};
    }
  }

  /**
   * Log a custom event to the Coveo Usage Analytics API.
   * If you do not want to manually control the visitorId, leave it empty, it will be handled automatically.
   * @param {CustomEventData} customData Additional data to send along with the call in the body.
   * @param {SearchEndpoint} endpoint The endpoint to target with the API call. (Mainly used to get the token from.)
   * @param {String} visitorId A visitorId to set. Leave blank if you do not want manual control on the visitorId.
   */
  static async logCustomEvent(customData, endpoint, visitorId) {
    const requestBody = {
      ...customData
    };

    const visitorString = Analytics.buildVisitorIdString(visitorId);

    try {
      const response = await fetch(`${API_ENDPOINT}${CUSTOM_PATH}${visitorString}`, {
        method: API_METHOD,
        headers: {
          ...API_HEADERS,
          Authorization: `Bearer ${endpoint.token}`
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const jsonResponse = await response.json();
      Analytics.setVisitorId(jsonResponse.visitorId);
      return jsonResponse;
    } catch (err) {
      console.error(err.message);
      return {};
    }
  }

  static buildVisitorIdString(visitorId) {
    const visitorIdValue = visitorId || Analytics.getVisitorId() || null;
    return (visitorIdValue) ? `?visitor=${visitorIdValue}` : '';
  }
}

/**
 * Class to represent the required values for a Custom Event.
 */
export class CustomEventData {
  constructor(eventType, eventValue, language) {
    this.eventType = eventType;
    this.eventValue = eventValue;
    this.language = language;
  }
}