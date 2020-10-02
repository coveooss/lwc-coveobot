/* eslint-disable @lwc/lwc/no-inner-html */
import BaseChatMessage from 'lightningsnapin/baseChatMessage';
import { track } from 'lwc';

const COVEO_PREFIX = 'COVEO|'
const MESSAGE_TYPES = { coveo: 'COVEO', text: 'PLAIN_TEXT', userQuery: 'search' };
const ACTIONS_TYPES = { search: 'search' };

/**
 * Displays a chat message using the inherited api messageContent and is styled based on the inherited api userType and messageContent api objects passed in from BaseChatMessage.
 */
export default class ChatMessageDefaultUI extends BaseChatMessage {
  messageType = MESSAGE_TYPES.text;
  @track displayResults = [];
  @track content = '';
  @track stringifiedMessage = '';

  connectedCallback() {
    if (!this.isAgent) {
      return;
    }

    if (this.decodedMessage.startsWith(COVEO_PREFIX)) {
      const messageSplit = this.decodedMessage.split('|');
      switch (messageSplit[1]) {
        case ACTIONS_TYPES.search:
          this.messageType = MESSAGE_TYPES.userQuery;
          this.content = messageSplit.slice(2).join(' ');
          break;

        default:
          break;
      }
    } else {
      this.messageType = MESSAGE_TYPES.text;
      this.content = this.decodedMessage;
    }
  }

  htmlDecode(input) {
    var e = document.createElement('textarea');
    e.innerHTML = input;
    // handle case of empty input
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }

  get decodedMessage() {
    return this.htmlDecode(this.messageContent.value);
  }

  get isUserQuery() {
    return this.messageType === MESSAGE_TYPES.userQuery;
  }

  get isAgent() {
    return this.userType === 'agent';
  }

  get isPlainText() {
    return this.messageType === MESSAGE_TYPES.text;
  }
}