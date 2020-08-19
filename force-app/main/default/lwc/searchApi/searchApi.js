const SEARCH_PATH = '/rest/search/v2';
const SEARCH_METHOD = 'POST';
const QUERY_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

export default class SearchAPI {

  static async executeQuery(endpoint, queryBody) {
    const response = await fetch(`${endpoint.platformUri}${SEARCH_PATH}`, {
      method: SEARCH_METHOD,
      headers: { ...QUERY_HEADERS, Authorization: `Bearer ${endpoint.token}` },
      body: JSON.stringify(queryBody)
    });
    if (!response.ok) {
      const responseError = await response.json();
      throw new Error(`HTTP error! status: ${response.status} : response => ${JSON.stringify(responseError)}`);
    } else {
      const results = await response.json();
      return results;
    }
  }
}