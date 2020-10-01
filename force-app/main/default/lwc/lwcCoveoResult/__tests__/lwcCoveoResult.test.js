/* eslint-disable @lwc/lwc/no-inner-html */
import { createElement } from 'lwc';
import LwcCoveoResult from 'c/lwcCoveoResult';

describe('c-lwc-coveo-result', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays nothing if there is no result but does not crash', () => {
        const element = createElement('c-lwc-coveo-result', {
            is: LwcCoveoResult
        });
        document.body.appendChild(element);

        const div = element.shadowRoot.querySelector('div');
        expect(div).toBe(null);
    });
});