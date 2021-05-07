import { LightningElement, api, track } from 'lwc';
import getEndpoint from '@salesforce/apex/LWCEndpointController.getEndpoint';
import Analytics from "c/analytics";
import SearchEndpoint from "c/searchEndpoint";
import SearchAPI from 'c/searchApi';

const SEARCH_HUB = 'Chatbot';
const ACTION_CAUSE_BOT = 'Chatbot';
const ORIGIN_2 = 'Chatbot question';
const SESSIONSTORAGE_ENDPOINT_KEY = 'coveo_endpoint';
const DEFAULT_PLATFORM_ENDPOINT = 'https://platform.cloud.coveo.com';

export default class LwcChatbotQuery extends LightningElement {
  @api query;
  @track content = '';
  @track results = [];

  handleEndpointError(error) {
    this.token = '';
    console.error(error);
    return error;
  }

  async refreshToken() {
    window.sessionStorage.removeItem(SESSIONSTORAGE_ENDPOINT_KEY);
    await this.setupEndpoint();
  }

  /**
   * Setup a search endpoint. This means querying an Apex method to get endpoint data that includes a search token.
   */
  async setupEndpoint() {
    let dataToParse = window.sessionStorage.getItem(SESSIONSTORAGE_ENDPOINT_KEY);
    let token = '';
    let clientUri = '';
    let analyticsUri = '';
    try {
      if (!dataToParse) {
        dataToParse = await getEndpoint({ searchHub: SEARCH_HUB });
      }
      const endpointData = JSON.parse(dataToParse);
      token = endpointData.token;
      clientUri = endpointData.clientUri || DEFAULT_PLATFORM_ENDPOINT;
      analyticsUri = endpointData.clientUri || DEFAULT_PLATFORM_ENDPOINT;
      window.sessionStorage.setItem(SESSIONSTORAGE_ENDPOINT_KEY, JSON.stringify({
        token,
        clientUri,
        analyticsUri
      }));
      this.endpoint = new SearchEndpoint(token, clientUri, analyticsUri);
    } catch (error) {
      console.error(error);
    }
  }

  connectedCallback() {
    this.initAndQuery(true);
  }

  /**
   * Initialize the querying process.
   * @param {Boolean} retry Should the query be retried in case there was an error.
   */
  async initAndQuery(retry) {
    try {
      // Setup a search endpoint, includes requesting a search token.
      await this.setupEndpoint();
      // Send a query to Coveo's SearchAPI /rest/search.
      const searchAPIResponse = await SearchAPI.executeQuery(this.endpoint, { q: this.query });
      // Token may have expired, retry once after generating a new token.
      if (searchAPIResponse.status === 419 && retry) {
        this.refreshToken();
        this.initAndQuery(false);
        return;
      }
      // Store the lastQueryUid, this is useful to send analytics events.
      this.lastQueryUid = searchAPIResponse.searchUid;
      // Send a search event. This is async but no need to wait for it 
      // since we don't want to block the execution and display of results.
      this.sendSearchEvent(searchAPIResponse);
      this.results = searchAPIResponse.results;
    } catch (err) {
      // Handle API error here.
      console.error(err.message);
      this.content = '';
    }
  }

  /**
   * Send a search event to Coveo's Usage Analytics API.
   * @param {Object} searchAPIResponse The response from Coveo's Search API.
   */
  async sendSearchEvent(searchAPIResponse) {
    return Analytics.logSearchEvent(
      searchAPIResponse,
      {
        actionCause: ACTION_CAUSE_BOT,
        language: 'en',
        queryText: this.query,
        originContext: ACTION_CAUSE_BOT,
        originLevel1: SEARCH_HUB,
        originLevel2: ORIGIN_2,
        userAgent: ACTION_CAUSE_BOT,
        anonymous: this.endpoint.isGuestUser
      },
      this.endpoint
    );
  }

  resultClickHandler(event) {
    const rank = event.detail;
    if ((rank === undefined || !this.results[rank])) {
      return;
    }
    Analytics.logClickEvent(
      this.results[rank],
      {
        actionCause: ACTION_CAUSE_BOT,
        documentPosition: rank + 1,
        language: 'en',
        searchQueryUid: this.lastQueryUid,
        userAgent: ACTION_CAUSE_BOT,
        originContext: ACTION_CAUSE_BOT,
        originLevel1: SEARCH_HUB,
        originLevel2: 'Chatbot question',
        anonymous: this.endpoint.isGuestUser
      },
      this.endpoint
    )
  }

  get hasResults() {
    return this.results && this.results.length > 0;
  }

  get resultsToDisplay() {
    if (this.hasResults) {
      return this.results.map((result, idx) => ({ ...result, rank: idx })).slice(0, 3);
    }
    return [];
  }
}