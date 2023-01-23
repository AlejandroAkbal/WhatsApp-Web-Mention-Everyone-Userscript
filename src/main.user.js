// ==UserScript==
// @name            WhatsApp Web Tag Everyone
// @namespace       AlejandroAkbal
// @version         0.1
// @description     Automatically tag everyone in a group chat on WhatsApp Web
// @author          Alejandro Akbal
// @license         AGPL-3.0
// @icon            https://www.google.com/s2/favicons?sz=64&domain=whatsapp.com
// @homepage        https://github.com/AlejandroAkbal/WhatsApp-Web-Tag-Everyone-Userscript
// @downloadURL     https://raw.githubusercontent.com/AlejandroAkbal/WhatsApp-Web-Tag-Everyone-Userscript/main/src/main.user.js
// @updateURL       https://raw.githubusercontent.com/AlejandroAkbal/WhatsApp-Web-Tag-Everyone-Userscript/main/src/main.user.js
// @match           https://web.whatsapp.com/*
// @grant           none
// @run-at          document-idle
// ==/UserScript==


/** @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wait for an element matching the given selector to appear in the DOM
 * @param {string} selector - The CSS selector to match
 * @param {Object} [options={}] - Additional options
 * @param {number} [options.timeout=10000] - The number of milliseconds to wait before timing out
 * @param {boolean} [options.subtree=true] - Whether to observe the entire subtree or just the target node
 * @param {boolean} [options.childList=true] - Whether to observe added and removed nodes
 * @returns {Promise<Element>} - A promise that resolves with the matched element
 */
async function waitForElement(selector, options = {}) {
    const {
        timeout = 10000,
        subtree = true,
        childList = true
    } = options;

    return new Promise((resolve, reject) => {
        let element;
        let timeoutId;

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.matches && node.matches(selector)) {
                        element = node;

                        observer.disconnect();

                        clearTimeout(timeoutId);

                        resolve(node);
                        return;
                    }
                }
            }
        });

        observer.observe(document.documentElement, {subtree, childList});

        timeoutId = setTimeout(() => {

            observer.disconnect();

            if (element) {
                resolve(element);

            } else {
                reject(new Error(`Element not found: ${selector}`));
            }

        }, timeout);
    });
}


;(async function () {
    'use strict'

    console.info('WhatsApp Web Tag Everyone loaded.')

    let buffer = "";

    document.addEventListener("keyup", event => {
        buffer += event.key;

        // Keep the last 2 characters
        buffer = buffer.slice(-2)

        console.log(buffer)

        if (buffer === "@@") {
            buffer = "";

            // TODO: Delete the last 2 written characters (the "@@")

            tagEveryone();
        }
    });

    async function tagEveryone() {
        const groupSubtitle = document.querySelector("[data-testid='chat-subtitle'] > span")

        if (!groupSubtitle) {
            throw new Error('No chat subtitle found, please open a group chat.')
        }

        let groupUsers = groupSubtitle.innerText.split(', ')

        // Remove unnecessary text
        groupUsers = groupUsers.filter(user => user !== 'You')

        // Normalize user's names without accents or special characters
        groupUsers = groupUsers.map(user => user.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))

        const chatInput = document.querySelector("[data-testid='conversation-compose-box-input'] > p")

        if (!chatInput) {
            throw new Error('No chat input found. Please type a letter in the chat input.')
        }

        for (const user of groupUsers) {
            document.execCommand('insertText', false, `@${user}`)

            // await waitForElement("[data-testid='contact-mention-list-item']")
            await sleep(300)

            // Send "tab" key to autocomplete the user
            const keyboardEvent = new KeyboardEvent('keydown', {
                key: 'Tab',
                code: 'Tab',
                keyCode: 9,
                which: 9,
                bubbles: true,
                cancelable: true,
                view: window,
            })

            chatInput.dispatchEvent(keyboardEvent)

            document.execCommand('insertText', false, ' ')
        }
    }

})()
