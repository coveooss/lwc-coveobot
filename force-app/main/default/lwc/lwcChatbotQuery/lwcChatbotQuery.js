import { LightningElement, api, track, wire } from 'lwc';
import getEndpoint from '@salesforce/apex/LWCEndpointController.getEndpoint';
import Analytics from "c/analytics";
import SearchEndpoint from "c/searchEndpoint";
import SearchAPI from 'c/searchApi';

const SEARCH_HUB = 'Searchhub';
const ACTION_CAUSE_BOT = 'Chatbot';
const LOCAL_STORAGE_TOKEN_KEY = 'coveo_token';
const DEFAULT_PLATFORM_ENDPOINT = 'https://platform.cloud.coveo.com';

export default class LwcChatbotQuery extends LightningElement {
  @api query;
  @track content;
  @track results;
  @track searchResults = [];

  handleEndpointError(error) {
    this.token = '';
    console.error(error);
    return error;
  }

  async createEndpoint() {
    const localStorageToken = window.localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (localStorageToken && localStorageToken !== 'undefined') {
      this.endpoint = new SearchEndpoint(localStorageToken, DEFAULT_PLATFORM_ENDPOINT, DEFAULT_PLATFORM_ENDPOINT);
    } else {
      const endpointData = await getEndpoint({ searchHub: SEARCH_HUB });
      const data = JSON.parse(endpointData);
      window.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, data.token);
      this.endpoint = new SearchEndpoint(data.token, data.platformUri, data.analyticUri);
    }
  }

  connectedCallback() {
    this.createEndpoint()
      .then(() => SearchAPI.executeQuery(this.endpoint, { q: this.query }))
      .then(response => {
        this.lastQueryUid = response.searchUid;
        Analytics.logSearchEvent(
          response,
          {
            actionCause: ACTION_CAUSE_BOT,
            language: 'en',
            queryText: this.query,
            originContext: ACTION_CAUSE_BOT,
            originLevel1: SEARCH_HUB,
            originLevel2: 'Chatbot question',
            userAgent: ACTION_CAUSE_BOT,
            anonymous: this.endpoint.isGuestUser
          },
          this.endpoint
        );
        this.results = response.results;
      })
      .catch(error => this.content = error);
  }

  resultClickHandler(event) {
    const rank = event.detail;
    if (!(rank && this.results[rank])) { return; }
    Analytics.logClickEvent(
      theResult,
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