// ==UserScript==
// @name         Jenkins Pipeline Failed Steps Only
// @namespace    https://github.com/somewhatabstract/cheekymonkey
// @version      1.0
// @description  Show only failed steps in Jenkins.
// @author       somewhatabstract
// @match        */job/*/flowGraphTable/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Don't bother doing work if we don't see the jenkins root element.
    if (!document.getElementById('jenkins')) return;

    // Don't bother doing work if we don't see the main panel element.
    // This element is used later to setup the mutation observer.
    // It's the lowest level element in the area we are concerned about that
    // doesn't get recreated as things update, making it reliable for observing
    // DOM mutations to the pipeline table.
    const mainPanel = document.getElementById('main-panel');
    if (!mainPanel) return;

    /**
     * State to track if we are hiding non-failed steps or not.
     *
     * This is defaulted to true, hiding all non-failed steps.
     */
    let hiding = true;

    /**
     * Hide all steps that do not display a failed status.
     */
    const hide = () => {
        hiding = true;
        document.querySelectorAll('svg[tooltip]:not([tooltip$="ailed"]):not([tooltip^="Build"])').forEach( node => {
            let parent = node.parentNode;
            while (parent && parent.nodeName.toLowerCase() !== "tr") {
                parent = parent.parentNode;
            }

            if (parent) {
                parent.style.display = "none";
            }
        })
    };

    /**
     * Show all steps, regardless of the status conveyed.
     */
    const show = () => {
        hiding = false;
        document.querySelectorAll('svg[tooltip]:not([tooltip$="ailed"]):not([tooltip^="Build"])').forEach( node => {
            let parent = node.parentNode;
            while (parent && parent.nodeName.toLowerCase() !== "tr") {
                parent = parent.parentNode;
            }

            if (parent) {
                parent.style.display = "";
            }
        })
    };

    /**
     * Get the overall status of the build.
     *
     * This returns an object defining various aspects of the status which
     * are then used to customize the display of the build status. The values
     * here were determined through some trial and error when looking at
     * active and completed builds. See where they are injected into the HTML
     * snippet to understand their use.
     */
    const getStatus = () => {
        // Flag indicating if the build is active or not.
        const inprogress = document.querySelectorAll('svg[tooltip="In progress"]').length > 0;
        // Flag indicating if the build has any failed steps.
        const hasFailures =  document.querySelectorAll('svg[tooltip="Failed"]').length > 0;

        if (inprogress) {
            return {
                // It appears green, but Jenkins' success class is icon-blue-anime
                color: hasFailures ? "red-anime" : "blue-anime",
                text: "Build in progress",
                sprite: hasFailures ? "last-failed" : "last-successful",
                status: "in-progress",
            };
        }

        if (hasFailures) {
            return {
                color: "red",
                text: "Build failed",
                sprite: "last-failed",
                status: "static",
            };
        }

        return {
                // It appears green, but Jenkins' success class is icon-blue-anime
            color: "blue",
            text: "Build succeeded",
            sprite: "last-successful",
            status: "static",
        };
    };

    /**
     * Update the show/hide button label based on the current display state.
     */
    const updateButtonLabel = (button) => {
        if (hiding) {
            button.value = "Show All Steps";
        } else {
            button.value = "Show Only Failed Steps";
        }
    };

    /**
     * Process the pipeline table.
     *
     * Jenkins recreates the table whenever the status of a step changes.
     * So, we run this function when we detect changes. This reapplies our
     * display status (hiding steps as needed), creates our show/hide button,
     * and adds the overall build status icon.
     */
    const processTable = () => {
        const {color: statusColor, text: statusText, sprite: statusSprite, status} = getStatus();

        // Apply the display state.
        if (hiding) {
            hide();
        } else {
            show();
        }

        const nodeGraph = document.getElementById('nodeGraph');
        const stepsHeader = Array
            .from(nodeGraph.querySelectorAll('th'))
            .find(el => el.textContent === 'Step');

        // Set up button.
        const button = document.createElement("input");
        button.type = "button";
        updateButtonLabel(button);
        button.style.margin = 6;
        button.onclick = () => {
            if (hiding) {
                show();
            } else {
                hide();
            }
            updateButtonLabel(button);
        };

        if (stepsHeader) {
            stepsHeader.appendChild(button);
        } else {
            nodeGraph.prepend(button);
        }

        // Add status svg.
        const statusImg = document.createElement("div");
        statusImg.classList.add("jenkins-table__cell--tight");
        statusImg.classList.add("jenkins-table__icon");
        statusImg.style.display = "inline-flex";
        statusImg.style.verticalAlign = "middle";
        statusImg.innerHTML = `<div class="jenkins-table__cell__button-wrapper"><span style="width: 24px; height: 24px; " class="build-status-icon__wrapper icon-${statusColor} "><span class="build-status-icon__outer"><svg viewBox="0 0 24 24" tooltip="${statusText}" focusable="false" class="svg-icon " title="${statusText}"><use href="/images/build-status/build-status-sprite.svg#build-status-${status}"></use></svg></span><svg viewBox="0 0 24 24" tooltip="${statusText}" focusable="false" class="svg-icon icon-${statusColor} " title="${statusText}"><use href="/static/c398dc13/images/build-status/build-status-sprite.svg#${statusSprite}"></use></svg></span></div>`
        if (stepsHeader) {
            stepsHeader.appendChild(statusImg);
        } else {
            nodeGraph.prepend(statusImg);
        }
    }

    // Set up a MutationObserver to detect changes in the table.
    const observer = new MutationObserver(processTable);
    observer.observe(mainPanel, {childList: true, subTree: true, attributes: true, attributeFilter: ["tooltip"]});

    // Kick off the first run.
    processTable();
})();
