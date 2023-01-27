// ==UserScript==
// @name            WhatsApp Web Mention Everyone
// @namespace       AlejandroAkbal
// @version         0.1.2
// @description     Automatically tag everyone in a group chat on WhatsApp Web
// @author          Alejandro Akbal
// @license         AGPL-3.0
// @icon            https://www.google.com/s2/favicons?sz=64&domain=whatsapp.com
// @homepage        https://github.com/AlejandroAkbal/WhatsApp-Web-Mention-Everyone-Userscript
// @downloadURL     https://raw.githubusercontent.com/AlejandroAkbal/WhatsApp-Web-Mention-Everyone-Userscript/main/src/main.user.js
// @updateURL       https://raw.githubusercontent.com/AlejandroAkbal/WhatsApp-Web-Mention-Everyone-Userscript/main/src/main.user.js
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

;(async function () {
  'use strict'

  console.info('WhatsApp Web Mention Everyone loaded.')

  let buffer = ''

  document.addEventListener('keyup', async (event) => {
    buffer += event.key

    // Keep the last 2 characters
    buffer = buffer.slice(-2)

    if (buffer === '@@') {
      buffer = ''

      // TODO: Delete the last 2 written characters (the "@@")

      try {
        await tagEveryone()
      } catch (error) {
        alert(error.message)
        throw error
      }
    }
  })

  async function tagEveryone() {
    const groupSubtitle = document.querySelector("[data-testid='chat-subtitle'] > span")

    if (!groupSubtitle) {
      throw new Error('No chat subtitle found. Please open a group chat.')
    }

    let groupUsers = groupSubtitle.innerText.split(', ')

    if (groupUsers.length === 1) {
      throw new Error('No users found in the group chat. Please wait a second and try again.')
    }

    // Remove unnecessary text
    groupUsers = groupUsers.filter(
      (user) =>
        [
          'You', // English
          '您', // Chinese
          'あなた', // Japanese
          'आप', // Hindi
          'Tu', // Spanish
          'Vous', // French
          'Du', // German
          'Jij', // Dutch
          'Você', // Portuguese
          'Вы' // Russian
        ].includes(user) === false
    )

    // Normalize user's names without accents or special characters
    groupUsers = groupUsers.map((user) => user.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))

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
        view: window
      })

      chatInput.dispatchEvent(keyboardEvent)

      document.execCommand('insertText', false, ' ')
    }
  }
})()
