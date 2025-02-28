// ==UserScript==
// @name         Cypress Cloud User Count
// @namespace    https://github.com/somewhatabstract/cheekymonkey
// @version      1.0
// @description  Show user count on Users admin page
// @author       somewhatabstract
// @match        https://cloud.cypress.io/organizations/*/users
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cypress.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const updateHeader = () => {
        const usersHeader = document.querySelector('.page-header--title');

        if (!usersHeader) {
            setTimeout(updateHeader, 500);
            return;
        }

        const totalUsers = document.querySelectorAll('.user-info').length;
        const pendingUsers = document.querySelectorAll('.invited-text').length;

        const summaryEl = document.createElement("div");
        const activeEl = document.createElement("div");
        activeEl.innerHTML = `${totalUsers - pendingUsers}&nbsp;active`;
        summaryEl.append(activeEl);
        const pendingEl = document.createElement("div");
        pendingEl.innerHTML = `${pendingUsers}&nbsp;pending`;
        summaryEl.append(pendingEl);

        usersHeader.append(summaryEl);
    };

    updateHeader();
})();