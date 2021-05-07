const SEARCH_PATH = '/rest/search/v2';
const SEARCH_METHOD = 'POST';
const QUERY_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

export default class SearchAPI {

  /**
   * Send a query to Coveo's Search API. Will return the results parsed in JSON, 
   * @param {SearchEndpoint} endpoint The endpoint to send requests against.
   * @param {Object} queryBody The body of the query to send.
   */
  static async executeQuery(endpoint, queryBody) {
    try {
      const response = await fetch(`${endpoint.clientUri}${SEARCH_PATH}`, {
        method: SEARCH_METHOD,
        headers: { ...QUERY_HEADERS, Authorization: `Bearer ${endpoint.token}` },
        body: JSON.stringify(queryBody)
      });
      const jsonResponse = await response.json();
      if (!response.ok) {
        return {
          status: response.status,
          body: jsonResponse
        }
      }
      return jsonResponse;
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }
}