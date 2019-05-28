// ==UserScript==
// @name         Logos Store Enhancements
// @namespace    https://github.com/simsrw73/userscripts
// @version      0.4.0
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

        // Add loaded in sections to the page navigation TOC
        } else if (mutation.target.matches('div[class^="index--displayTemplate"]')) {
          const toc = document.querySelector('#lseNavTo--TOC');

          if (document.querySelector('#lseNavTo--TOC-divider') === null) {
            const hr = document.createElement('div');
            hr.id = 'lseNavTo--TOC-divider';
            hr.style.height = '0';
            hr.style.margin = '4px 8px';
            hr.style.borderTop = '1px solid #bbb';
            toc.appendChild(hr);
          }

          const containingProducts = document.querySelector('section[class^="index--containingProducts"]');
          if (containingProducts !== null && document.querySelector('.lseNavTo--Heading--100') === null) {
            addHeadingToTOC(toc, containingProducts, 100, 'This title is included in...');
          }

          const customersAlsoBought = document.querySelector('section[class^="index--customersAlsoBoughtSection"]');
          if (customersAlsoBought !== null && document.querySelector('.lseNavTo--Heading--101') === null) {
            addHeadingToTOC(toc, customersAlsoBought, 101, 'Customers also bought...');
          }
        }
      }
    });
  };

  var observer = new MutationObserver(observatory);
  observer.observe(document.body, { childList: true, subtree: true });
  // End of Observatory

  // Extend the sidebar with page navigation and social icons
  const sidebar = document.querySelector('div[class^="index--desktopSidebarContainer"]');
  if (sidebar !== null) {
    const to = document.createElement('div');
    to.className = 'lseShareTo';

    addPageNav(to);
    addSocialIcons(to);

    sidebar.appendChild(to);
  }

  // Add Social Share-to icons to sidebar
  function addSocialIcons(to) {
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
    social.id = 'lseShareTo';

    // Label
    const p = document.createElement('p');
    const aText = document.createTextNode('Share to:');
    p.id = 'lseShareTo--Label';
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
    to.appendChild(social);

  } // function addSocialIcons

  // Add page navigation TOC to sidebar
  function addPageNav(to) {
    const nav = document.createElement('div');
    nav.id = 'page-nav';
    nav.style.position = 'relative';
    nav.minWidth = '118px';

    nav.addEventListener('mouseenter', function(e) {
      const toc = document.querySelector('#lseNavTo--TOC');
      toc.style.display = 'flex';

      // try to display above the button
      toc.classList.remove('lseNavTo--TOC-Dropdown');

      // if that's out of bounds, display below the button
      const box = toc.getBoundingClientRect();
      if (box.top < 0) {
        toc.classList.add('lseNavTo--TOC-Dropdown');
      }
    });

    nav.addEventListener('mouseleave', function(e) {
      document.querySelector('#lseNavTo--TOC').style.display = 'flex';
      document.querySelector('#lseNavTo--TOC').style.display = 'none';
    });

    const dropdown = document.createElement('div');
    dropdown.id = 'lseDropdown';

    const dropdownButton = document.createElement('button');
    dropdownButton.id = 'lseDropdown-button';

    dropdownButton.appendChild(document.createTextNode('Navigate to'));
    dropdown.appendChild(dropdownButton);

    nav.appendChild(dropdown);

    const toc = document.createElement('div');
    toc.id = 'lseNavTo--TOC';

    toc.addEventListener('mouseleave', function(e) {
      document.querySelector('#lseNavTo--TOC').style.display = 'none';
    });

    // Add entries to TOC
    const overview = document.querySelector('[class^="index--productName"]');
    addHeadingToTOC(toc, overview, 0, 'Overview');

    const headings = document.querySelectorAll(
      'div[class^="index--displayTemplate"] h3[class^="index--headerCopy"], div[class^="index--displayTemplate"] div.bd-product-display-content h2'
    );
    headings.forEach(function(h, i) {
      addHeadingToTOC(toc, h, i + 1);
    });

    nav.appendChild(toc);
    to.appendChild(nav);

  } // function addPageNav


  // Utility to add headings to the page navigation TOC
  function addHeadingToTOC(toc, h, uid, altTitle) {
    const headingID = 'lseNavTo--Heading--' + uid;
    h.classList.add(headingID);

    const heading = document.createElement('button');
    heading.appendChild(document.createTextNode(altTitle || h.innerText));
    heading.className = 'lseNavTo--Heading';
    heading.setAttribute('data-heading-id', headingID);
    heading.addEventListener('click', function(e) {
      document.querySelector('.' + e.target.getAttribute('data-heading-id')).scrollIntoView({ behavior: 'smooth' });
      toc.style.display = 'none';
    });
    toc.appendChild(heading);
  }

  ///////////////   CSS
  const css = [
    '.lseShareTo {',
    '  display: flex;',
    '  flex-direction: row;',
    '  justify-content: space-between;',
    '  padding: 8px 8px 8px 0;',
    '}',
    '#lseShareTo--Label {',
    '  margin-left: 16px;',
    '  font-size: 18px;',
    '  vertical-align: middle;',
    '  display: inline-block;',
    '  user-select: none;',
    '}',
    '#lseDropdown-button {',
    '  background-color: #fff;',
    '  border: 1px solid #bbb;',
    '  border-radius: 4px;',
    '  padding: 4px 32px 4px 16px;',
    "  background-image: url(\"data:image/svg+xml,%3Csvg width='12' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 6L5.5 2 2 6.022' stroke-width='1.5' stroke='%236C6C6C' fill='none'/%3E%3Cpath d='M9 9L5.5 13 2 9.022' stroke-width='1.5' stroke='%236C6C6C' fill='none'/%3E%3C/svg%3E\");",
    '  background-position: right 16px center;',
    '  background-repeat: no-repeat;',
    '}',
    '#lseNavTo--TOC {',
    '  position: absolute;',
    '  top: 0;',
    '  left: 0;',
    '  width: 200%;',
    '  transform: translateY(-100%);',
    '  display: none;',
    '  flex-direction: column;',
    '  background-color: #fff;',
    '  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.12), 0 0 4px 0 rgba(0, 0, 0, 0.12);',
    '}',
    '.lseNavTo--TOC-Dropdown {',
    '  top: 100% !important;',
    '  transform: translateY(0) !important;',
    '}',
    '.lseNavTo--Heading {',
    '  background-color: #fff;',
    '  text-align: left;',
    '  border: none;',
    '  padding: .5em 1em;',
    '}',
    '.lseNavTo--Heading:hover {',
    '  background-color: #f4f4f4;',
    '}',
  ].join('\n');

  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  const heads = document.getElementsByTagName('head');
  heads[0].appendChild(style);
})();
