import { LightningElement, api, track } from 'lwc';

export default class LwcCoveoResult extends LightningElement {
  @api result;
  @api rank;
  @track resultType;
  excerptHighlights = '';
  coveoLoaded = false;

  connectedCallback() {
    this.content = this.result.title;
    if (this.isYoutube) {
      this.content = 'https://www.youtube.com/embed/' + this.result.raw.ytvideoid;
    }
  }

  handleClick(event) {
    this.dispatchEvent(new CustomEvent('resultclick', { detail: this.rank }));
  }

  get isYoutube() {
    return this.result && this.result.raw && this.result.raw.filetype === 'YouTubeVideo';
  }

  get isAnswer() {
    return this.result && this.result.raw && this.result.raw.objecttype === 'QuestionAnswer';
  }

  get isAnythingElse() {
    return !this.isYoutube && !this.isAnswer;
  }
}