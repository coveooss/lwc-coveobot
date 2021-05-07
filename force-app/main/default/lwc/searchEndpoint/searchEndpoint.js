const ANALYTICS_PATH = '/rest/ua/v15/analytics';

export default class SearchEndpoint {
  constructor(token, clientUri, analyticsUri) {
    this.token = token;
    this.clientUri = clientUri;
    this.analyticsUri = analyticsUri + ANALYTICS_PATH;
  }
}