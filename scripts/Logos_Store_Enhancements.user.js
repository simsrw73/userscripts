// ==UserScript==
// @name         Logos Store Enhancements
// @namespace    https://github.com/simsrw73/userscripts
// @version      0.2
// @description  Get extended information about resources
// @author       Randy W. Sims
// @updateURL    https://github.com/simsrw73/userscripts/raw/master/scripts/Logos_Store_Enhancements.meta.js
// @downloadURL  https://github.com/simsrw73/userscripts/raw/master/scripts/Logos_Store_Enhancements.user.js
// @match        https://beta.logos.com/products/*
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  // Show resource ID and link to open it
  let displayRIDWhenRendered_limit = 10;
  const displayRIDWhenRendered = setInterval(function() {
    // Timeout if we've been through this too many times before
    if (--displayRIDWhenRendered_limit <= 0) {
      clearInterval(displayRIDWhenRendered);
    }

    const seeInside = document.querySelector('.core-see-inside__iframe');
    if (seeInside !== null) {
      clearInterval(displayRIDWhenRendered);

      const srcURL = new URL(seeInside.getAttribute('src'));
      const resourceName = srcURL.searchParams.get('resourceName');

      if (resourceName !== null) {
        const bookURL =
              'https://app.logos.com/books/' + encodeURIComponent(resourceName);

        const a = document.createElement('a');
        const aText = document.createTextNode(resourceName.substring(4)); // remove LLS:
        a.appendChild(aText);
        a.title = 'Resource Name';
        a.className = 'btn btn-minor';
        a.href = bookURL;
        a.style.marginBottom = '8px';

        const seeInsideBtn = document.querySelector('.btn-see-inside');
        seeInsideBtn.parentNode.style.flexDirection = 'column';
        seeInsideBtn.parentNode.insertBefore(a, seeInsideBtn);
      }
    }
  }, 500);
})();
