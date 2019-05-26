// ==UserScript==
// @name         Logos Store Enhancements
// @namespace    https://github.com/simsrw73/userscripts
// @version      0.3.1
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


  // Add Social Share-to icons
  // TODO: Clips the pricing box above on CP pages
  function addSocialIcons() {
    const sidebar = document.querySelector('div[class^="index--desktopSidebarContainer"]');
    if (sidebar !== null) {
      const url = document.head.querySelector("[property='og:url'][content]").content;
      const title = document.head.querySelector("[property='og:title'][content]").content;
      let fbURL =
        'https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&u=' +
        encodeURIComponent(url) +
        '&display=popup&ref=plugin&src=share_button';
      let twitURL =
        'https://twitter.com/intent/tweet?original_referer=' +
        encodeURIComponent(url) +
        '&ref_src=twsrc%5Etfw&text=' +
        encodeURIComponent(title) +
        '&tw_p=tweetbutton&url=' +
        encodeURIComponent(url);

      const social = document.createElement('div');
      social.id = 'social-bar';

      // Label
      const p = document.createElement('p');
      const aText = document.createTextNode('Share to:');
      p.style.marginLeft = '16px';
      p.style.fontSize = '18px';
      p.style.verticalAlign = 'middle';
      p.style.display = 'inline-block';
      p.style.userSelect = 'none';

      p.appendChild(aText);
      social.appendChild(p);

      // Facebook
      let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttributeNS(null, 'viewBox', '0 0 512 512');
      svg.setAttributeNS(null, 'width', 24);
      svg.setAttributeNS(null, 'height', 24);
      svg.style.display = 'inline-block';
      svg.style.marginLeft = '8px';
      svg.insertAdjacentHTML(
        'beforeend',
        '<path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path>'
      );

      let a = document.createElement('a');
      a.appendChild(svg);
      a.href = fbURL;
      a.style.color = '#333'; // '#3b5998';

      social.appendChild(a);

      // Twitter
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttributeNS(null, 'viewBox', '0 0 512 512');
      svg.setAttributeNS(null, 'width', 24);
      svg.setAttributeNS(null, 'height', 24);
      svg.style.display = 'inline-block';
      svg.style.marginLeft = '8px';
      svg.insertAdjacentHTML(
        'beforeend',
        '<path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" class=""></path>'
      );

      a = document.createElement('a');
      a.appendChild(svg);
      a.href = twitURL;
      a.style.color = '#333'; // '#38A1F3';

      social.appendChild(a);

      // Add social bar to the sidebar
      sidebar.appendChild(social);
    }
  }

  addSocialIcons();
})();
