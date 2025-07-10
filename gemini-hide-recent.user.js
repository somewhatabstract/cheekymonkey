// ==UserScript==
// @name         Hide Gemini Conversations
// @namespace    http://tampermonkey.net
// @version      1.0
// @description  Hides the Recent Conversations list in Gemini
// @author       somewhatabstract
// @match        https://gemini.google.com/app
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const buttonId = "jy_hide_gemini_button";
  let displayValue;
  let hiding = false;

  const getConversations = () => {
    const conversations = document.getElementsByClassName(
      "conversations-container"
    );
    if (!conversations?.length) return undefined;
    return conversations[0];
  };

  const getConversationsContainer = () => {
    const elements = document.getElementsByTagName("conversations-list");
    if (!elements?.length) return;
    return elements[0];
  };

  const getConversationsHeader = () => {
    const container = getConversationsContainer();
    if (!container) return;
    const headers = container.getElementsByClassName("title-container");
    if (!headers?.length) return;
    return headers[0];
  };

  function getButton() {
    const button = document.getElementById(buttonId);
    if (button != null) return button;

    const container = getConversationsHeader();
    if (!container) return null;

    const newButton = document.createElement("input");
    newButton.id = buttonId;
    newButton.type = "button";
    newButton.style.margin = 6;
    newButton.value = "-";
    newButton.onclick = () => {
      if (hiding) {
        showList();
      } else {
        hideList();
      }
    };
    container.children[0].style.display = "inline-block";
    container.appendChild(newButton);
    return newButton;
  }

  function updateButton() {
    const button = getButton();
    if (button == null) return false;

    button.value = hiding ? "Show" : "Hide";
    return true;
  }

  function hideList() {
    const el = getConversations();
    if (el) {
      displayValue = el.style.display;
      el.style.display = "none";
      hiding = true;
      updateButton();
    }
  }

  function showList() {
    const el = getConversations();
    if (el) {
      el.style.display = displayValue;
      hiding = false;
      updateButton();
    }
  }

  function init() {
    const updated = updateButton();
    if (!updated) {
      setTimeout(init, 250);
    }
  }

  init();
})();
