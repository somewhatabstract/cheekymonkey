// ==UserScript==
// @name         Cypress Cloud User Count
// @namespace    https://github.com/somewhatabstract/cheekymonkey
// @version      1.2
// @description  Show user count on Users admin page
// @author       somewhatabstract
// @match        https://cloud.cypress.io/organizations/*/users
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cypress.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let summaryEl = null;
    const updateHeader = () => {
        const usersHeader = document.querySelector('.page-header--title');
        if (!window.location.pathname.endsWith('/users') || !usersHeader) {
            summaryEl = null;
            return;
        }

        const totalUsers = document.querySelectorAll('.user-info').length;
        const pendingUsers = document.querySelectorAll('.invited-text').length;

        summaryEl = summaryEl ?? document.createElement("div");
        const activeEl = document.createElement("div");
        activeEl.innerHTML = `${totalUsers - pendingUsers}&nbsp;active`;
        const pendingEl = document.createElement("div");
        pendingEl.innerHTML = `${pendingUsers}&nbsp;pending`;

        summaryEl.innerHTML = "";
        summaryEl.append(activeEl);
        summaryEl.append(pendingEl);

        usersHeader.style.alignItems = "center";
        usersHeader.append(summaryEl);
    };

    setInterval(() => updateHeader(), 250);
})();