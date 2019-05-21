// ==UserScript==
// @name         Logos Store Enhancements
// @namespace    https://github.com/simsrw73/userscripts
// @version      0.1
// @description  Get extended information about resources
// @author       Randy W. Sims
// @match        https://beta.logos.com/products/*
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  // Show resource ID and link to open it
  var displayRIDWhenRendered = setInterval(function() {
    var seeInside = document.querySelector('.core-see-inside__iframe');
    if (seeInside !== null) {
      clearInterval(displayRIDWhenRendered);

      const srcURL = new URL(seeInside.getAttribute('src'));
      const resourceName = srcURL.searchParams.get('resourceName');

      const bookURL =
        'https://app.logos.com/books/' + encodeURIComponent(resourceName);

      var a = document.createElement('a');
      var aText = document.createTextNode(resourceName.substring(4));
      a.appendChild(aText);
      a.title = 'Resource Name';
      a.className = 'btn btn-minor';
      a.href = bookURL;
      a.style.marginBottom = '8px';

      const seeInsideBtn = document.querySelector('.btn-see-inside');
      seeInsideBtn.parentNode.style.flexDirection = 'column';
      seeInsideBtn.parentNode.insertBefore(a, seeInsideBtn);
    }
  }, 500);
})();
