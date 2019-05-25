// ==UserScript==
// @name         Logos Store Enhancements
// @namespace    https://github.com/simsrw73/userscripts
// @version      0.3
// @description  Get extended information about resources
// @author       Randy W. Sims
// @updateURL    https://github.com/simsrw73/userscripts/raw/master/scripts/Logos_Store_Enhancements.meta.js
// @downloadURL  https://github.com/simsrw73/userscripts/raw/master/scripts/Logos_Store_Enhancements.user.js
// @match        https://beta.logos.com/*
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  var observatory = function(mutations, observer) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        // Hide chat button
        if (mutation.target.matches('#lhnChatButton')) {
          mutation.target.style.display = 'none';

          // If there was a chat button, add chat to the Phone menu
        } else if (
          mutation.target.matches('div[class^="phone-number--container"]') &&
          document.querySelectorAll('#lhnContainerDone').length
        ) {
          const a = document.createElement('a');
          a.appendChild(document.createTextNode('Open Live Chat'));
          a.id = 'aLHNBTN';
          a.className = 'ui1';
          a.href = '#';
          a.style.marginTop = '16px';
          a.style.paddingTop = '8px';
          a.style.borderTop = '2px solid var(--brand-blue)';
          a.style.color = 'var(--brand-blue)';
          a.setAttribute('onclick', 'OpenLHNChat();return false;');

          const chatPopup = document.querySelector('div[class^="phone-number--popup"]');
          if (chatPopup !== null) {
            chatPopup.appendChild(a);
          }

          // Display ResourceID & link it to app.logos.com
        } else if (mutation.target.matches('div[class^="index--imageContainer"]')) {
          const seeInside = document.querySelector('.core-see-inside__iframe');

          const srcURL = new URL(seeInside.getAttribute('src'));
          const resourceName = srcURL.searchParams.get('resourceName');

          if (resourceName !== null) {
            const bookURL = 'https://app.logos.com/books/' + encodeURIComponent(resourceName);

            const a = document.createElement('a');
            const aText = document.createTextNode(resourceName.substring(4)); // remove 'LLS:'
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
      }
    });
  };

  var observer = new MutationObserver(observatory);
  observer.observe(document.body, { childList: true, subtree: true });
})();
