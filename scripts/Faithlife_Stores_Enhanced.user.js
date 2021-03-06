// ==UserScript==
// @name         Faithlife Stores Enhanced
// @namespace    https://github.com/simsrw73/userscripts
// @version      0.5.1
// @description  Get extended information about resources
// @author       Randy W. Sims
// @updateURL    https://github.com/simsrw73/userscripts/raw/master/scripts/Faithlife_Stores_Enhanced.meta.js
// @downloadURL  https://github.com/simsrw73/userscripts/raw/master/scripts/Faithlife_Stores_Enhanced.user.js
// @match        https://*.logos.com/*
// @match        https://verbum.com/*
// @match        https://ebooks.faithlife.com/*
// @match        https://ebooks.noet.com/*
// @grant        GM_xmlhttpRequest
// @connect      libapi.logos.com
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

          // Display ResourceID & link it to app.logos.com
        } else if (mutation.target.matches('div[class^="index--imageContainer"]')) {
          const seeInside = document.querySelector('.core-see-inside__iframe');

          const srcURL = new URL(seeInside.getAttribute('src'));
          const resourceName = srcURL.searchParams.get('resourceName');

          if (resourceName !== null) {
            const bookURL = 'https://app.logos.com/books/' + encodeURIComponent(resourceName);

            const a = document.createElement('a');
            a.id = 'fseResInfo';
            a.className = 'btn btn-minor';
            a.title = 'Resource Info';
            const aText = document.createTextNode(resourceName.substring(4)); // remove 'LLS:'
            a.appendChild(aText);
            a.href = bookURL;
            a.style.marginBottom = '8px';
            a.style.borderRadius = '3px';

            // Discovered APIs:
            //   https://libapi.logos.com/v1/resource/LLS%3AESVSB/resourceInfo.json?resourceFields=version
            //   https://productsapi.logos.com/v3/products/filter?sourceToken=libronix&productTokens=LLS%3AESVSB&statusIds=3&storefront=logos-desktop&limit=1
            //   https://app.logos.com/api/app/resourceViewInfo?resourceId=LLS%3AESVSB
            //   https://app.logos.com/api/sinaix/resources/LLS%3AESVSB/fileInfo   (requires ownership)
            GM_xmlhttpRequest({
              method: 'GET',
              url: 'https://libapi.logos.com/v1/resource/' + encodeURIComponent(resourceName) + '/resourceInfo.json',
              overrideMimeType: 'application/json',
              onload: function(response) {
                if (response.status == 200) {
                  const resourceInfo = JSON.parse(response.responseText);

                  // get resource version info
                  const versElem = document.createElement('div');
                  versElem.id = 'fseResInfo--Version';
                  versElem.style.marginTop = '4px';
                  versElem.style.fontSize = '12px';
                  const txt = document.createTextNode(resourceInfo.version);
                  versElem.appendChild(txt);
                  a.appendChild(versElem);

                  // get milestone indexes
                  let resMilestoneIndexes = resourceInfo.milestoneIndexes.reduce(function(miString, mi) {
                    let idx = '';
                    switch (mi.kind) {
                      case 'reference':
                        idx = mi.dataTypeName;
                        break;
                      case 'headword':
                        idx = mi.headwordLanguage;
                        break;
                      default:
                        console.log(mi);
                    }
                    return miString === '' ? idx : miString + ', ' + idx;

                    // get traits ???
                  }, '');
                  a.title = resMilestoneIndexes ? 'Indexes: ' + resMilestoneIndexes : 'Resource Info';
                }
              },
            });

            const seeInsideBtn = document.querySelector('.btn-see-inside');
            seeInsideBtn.parentNode.style.flexDirection = 'column';
            seeInsideBtn.parentNode.insertBefore(a, seeInsideBtn);
          }

          // Add loaded in sections to the page navigation TOC
        } else if (mutation.target.matches('div[class^="index--displayTemplate"]')) {
          const toc = document.querySelector('#fseNavTo--TOC');

          if (document.querySelector('#fseNavTo--TOC-divider') === null) {
            const hr = document.createElement('div');
            hr.id = 'fseNavTo--TOC-divider';
            hr.style.display = 'none';
            hr.style.height = '0';
            hr.style.margin = '4px 8px';
            hr.style.borderTop = '1px solid #bbb';
            toc.appendChild(hr);
          }

          const containingProducts = document.querySelector('section[class^="index--containingProducts"]');
          if (containingProducts !== null && document.querySelector('.fseNavTo--Heading--100') === null) {
            document.querySelector('#fseNavTo--TOC-divider').style.display = 'block';
            addHeadingToTOC(toc, containingProducts, 100, 'This title is included in...');
          }

          const customersAlsoBought = document.querySelector('section[class^="index--customersAlsoBoughtSection"]');
          if (customersAlsoBought !== null && document.querySelector('.fseNavTo--Heading--101') === null) {
            document.querySelector('#fseNavTo--TOC-divider').style.display = 'block';
            addHeadingToTOC(toc, customersAlsoBought, 101, 'Customers also bought...');
          }

        // Handle Added/Removed nodes individually
        } else {
          mutation.addedNodes.forEach(function(node){
            if (/\bfacet--facet/.test(node.className) && // facet--mutuallyExclusiveFacet
                ! (/\bfacet--mutuallyExclusiveFacet/.test(node.className) ||
                   /\bfseFacet--Container/.test(node.className) ))
            {
              redrawFacetCheckbox(node);
            }

          });
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
    to.id = 'fseSocialBar';

    addPageNav(to);
    addSocialIcons(to);

    sidebar.appendChild(to);
  }

  // Add page navigation TOC to sidebar
  function addPageNav(to) {
    const nav = document.createElement('div');
    nav.id = 'fseNavTo';
    nav.style.position = 'relative';
    nav.style.minWidth = '118px';

    nav.addEventListener('mouseenter', function(e) {
      const toc = document.querySelector('#fseNavTo--TOC');
      toc.style.display = 'flex';

      // try to popup above the button
      toc.classList.remove('fseNavTo--TOC-Dropdown');

      // if it's out of bounds, display below the button
      const box = toc.getBoundingClientRect();
      if (box.top < 0) {
        toc.classList.add('fseNavTo--TOC-Dropdown');
      }
    });

    nav.addEventListener('mouseleave', function(e) {
      document.querySelector('#fseNavTo--TOC').style.display = 'none';
    });

    const dropdown = document.createElement('div');
    dropdown.id = 'fseDropdown';

    const dropdownButton = document.createElement('button');
    dropdownButton.id = 'fseDropdown-button';

    dropdownButton.appendChild(document.createTextNode('Navigate to'));
    dropdown.appendChild(dropdownButton);

    nav.appendChild(dropdown);

    const toc = document.createElement('div');
    toc.id = 'fseNavTo--TOC';

    toc.addEventListener('mouseleave', function(e) {
      document.querySelector('#fseNavTo--TOC').style.display = 'none';
    });

    // Add entries to TOC
    const overview = document.querySelector('[class^="index--productName"]');
    addHeadingToTOC(toc, overview, 0, 'Overview');

    const headings = document.querySelectorAll(
      'div[class^="index--displayTemplate"] h3[class^="index--headerCopy"], ' +
        'div[class^="index--displayTemplate"] div.bd-product-display-content h2,' +
        'div[class^="index--defaultTemplateOverviewContainer"] div.bd-product-display-content h2'
    );
    headings.forEach(function(h, i) {
      addHeadingToTOC(toc, h, i + 1);
    });

    nav.appendChild(toc);
    to.appendChild(nav);
  } // function addPageNav

  // Add Social Share-to icons to sidebar
  function addSocialIcons(to) {
    const url = document.head.querySelector("[property='og:url'][content]").content;
    const title = document.head.querySelector("[property='og:title'][content]").content;
    let flURL = 'https://faithlife.com/share?content=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url);
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
    social.id = 'fseShareTo';

    // Label
    const p = document.createElement('p');
    const aText = document.createTextNode('Share to:');
    p.id = 'fseShareTo--Label';
    p.appendChild(aText);
    social.appendChild(p);

    // Faithlife
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
    svg.setAttributeNS(null, 'width', 20);
    svg.setAttributeNS(null, 'height', 20);
    svg.style.display = 'inline-block';
    svg.style.marginLeft = '8px';
    svg.insertAdjacentHTML(
      'beforeend',
      '<g id="g3739" transform="matrix(0.61790844,0,0,0.61790844,-0.36363799,-0.2920958)"><circle r="19.420353" cy="19.893066" cx="20.008844" id="path24" style="fill:currentColor;fill-opacity:1;stroke-width:0.68275863" /><g transform="translate(-37.266609,0.16343591)" id="g30"><path style="fill:#ffffff;fill-rule:evenodd;stroke-width:0.91120678" inkscape:connector-curvature="0" id="path6" d="m 58.521238,37.083593 c -0.01822,0.04738 -0.08019,0.05923 -0.114812,0.02095 -0.478384,-0.5285 -3.268499,-3.521813 -7.439093,-6.360222 -2.393739,-1.694845 -3.331371,-2.745466 -3.602911,-3.085347 -0.03645,-0.04556 0,-0.114812 0.05832,-0.112078 0.277919,0.01549 0.923964,0.03918 1.740406,-0.01458 0.05467,-0.0037 0.08201,-0.06197 0.05467,-0.106611 -0.350815,-0.537612 -2.03837,-3.225672 -2.15956,-6.232654 -0.0018,-0.05467 0.05467,-0.08929 0.102051,-0.06379 0.255138,0.145793 0.953122,0.512098 1.84246,0.776348 0.05012,0.01458 0.0975,-0.03007 0.08656,-0.08019 -0.133036,-0.625999 -0.72532,-3.768751 -0.125746,-6.95433 0.01094,-0.05649 0.08019,-0.07655 0.118457,-0.03645 0.177686,0.196821 0.624176,0.633288 1.409637,1.089803 0.03645,0.02187 0.08201,0.0054 0.0975,-0.03645 0.191353,-0.548546 1.406903,-3.881741 3.459852,-5.880928 0.04009,-0.039184 0.107522,-0.014579 0.114812,0.041 0.898449,5.891862 5.98845,7.234981 8.394947,12.424304 1.614659,3.48081 -0.430089,5.394343 -1.10256,5.904619 -0.05649,0.04101 -0.02278,0.130303 0.04739,0.123925 3.840736,-0.309811 5.430792,-3.79062 5.847213,-4.89956 0.02734,-0.07107 0.131213,-0.05285 0.133947,0.02278 0.268807,8.206327 -6.394848,8.692912 -7.451848,8.724804 -0.08838,0.0018 -0.176775,-0.01822 -0.255138,-0.06014 -6.024899,-3.212003 -5.995741,-9.613231 -5.933779,-10.825136 0.0018,-0.03645 -0.05012,-0.0483 -0.06379,-0.01367 -3.028852,7.320635 2.185074,11.457514 4.043024,13.26717 0.744456,0.72532 1.073402,1.36681 0.695251,2.367315" /><path style="fill:#ffffff;fill-rule:evenodd;stroke-width:0.91120678" inkscape:connector-curvature="0" id="path8" d="m 59.437912,2.3575055 c 0.04829,-0.054673 0.139414,-0.015489 0.130302,0.058315 -0.136681,1.1180508 -0.444669,5.8289897 3.328638,9.9230405 4.241667,4.569701 3.781509,8.055068 2.268905,11.291673 -0.03462,0.07289 -0.145793,0.0483 -0.14306,-0.03371 0.02734,-0.872936 -0.209577,-2.678948 -3.161886,-5.943802 C 57.18632,12.486476 53.908709,8.6831009 59.437,2.3556813" /></g></g>'
    );

    let a = document.createElement('a');
    a.appendChild(svg);
    a.href = flURL;
    a.target = '_blank';
    a.style.color = '#333'; // '#3b5998';

    social.appendChild(a);

    // Facebook
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(null, 'viewBox', '0 0 512 512');
    svg.setAttributeNS(null, 'width', 20);
    svg.setAttributeNS(null, 'height', 20);
    svg.style.display = 'inline-block';
    svg.style.marginLeft = '8px';
    svg.insertAdjacentHTML(
      'beforeend',
      '<path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path>'
    );

    a = document.createElement('a');
    a.appendChild(svg);
    a.href = fbURL;
    a.target = '_blank';
    a.style.color = '#333'; // '#3b5998';

    social.appendChild(a);

    // Twitter
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(null, 'viewBox', '0 0 512 512');
    svg.setAttributeNS(null, 'width', 20);
    svg.setAttributeNS(null, 'height', 20);
    svg.style.display = 'inline-block';
    svg.style.marginLeft = '8px';
    svg.insertAdjacentHTML(
      'beforeend',
      '<path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" class=""></path>'
    );

    a = document.createElement('a');
    a.appendChild(svg);
    a.href = twitURL;
    a.target = '_blank';
    a.style.color = '#333'; // '#38A1F3';

    social.appendChild(a);

    // Add social bar to the sidebar
    to.appendChild(social);
  } // function addSocialIcons

  // Utility to add headings to the page navigation TOC
  function addHeadingToTOC(toc, h, uid, altTitle) {
    const headingID = 'fseNavTo--Heading--' + uid;
    h.classList.add(headingID);

    const heading = document.createElement('button');
    heading.appendChild(document.createTextNode(altTitle || h.innerText));
    heading.className = 'fseNavTo--Heading';
    heading.setAttribute('data-heading-id', headingID);
    heading.addEventListener('click', function(e) {
      document.querySelector('.' + e.target.getAttribute('data-heading-id')).scrollIntoView({ behavior: 'smooth' });
      toc.style.display = 'none';
    });
    toc.appendChild(heading);
  }

  // Reformat Facet Checkboxes
  const facets = document.querySelectorAll('input[class^="facet--checkbox"]');
  facets.forEach(function(facet){
    redrawFacetCheckbox(facet.parentElement);
    // facet.parentElement.classList.add('fseFacet--Container');
    // const newChkBox = document.createElement('span');
    // newChkBox.className = 'fseFacet--Checkbox';
    // facet.parentElement.insertBefore(newChkBox, facet.nextElementSibling);
  });

  function redrawFacetCheckbox(node){
    node.classList.add('fseFacet--Container');
    const newChkBox = document.createElement('span');
    newChkBox.className = 'fseFacet--Checkbox';
    node.insertBefore(newChkBox, node.querySelector('input[class^="facet--checkbox"]').nextElementSibling);
  }



  ///////////////   CSS   ///////////////
  const css = [
    '#fseSocialBar {',
    '  display: flex;',
    '  flex-direction: row;',
    '  justify-content: space-between;',
    '  align-items: baseline;',
    '  padding: 8px 8px 8px 0;',
    '}',
    '#fseShareTo {',
    '  display: flex;',
    '}',
    '#fseShareTo--Label {',
    '  margin-left: 16px;',
    '  font-size: 16px;',
    '  vertical-align: middle;',
    '  display: inline-block;',
    '  user-select: none;',
    '}',
    '#fseDropdown-button {',
    '  background-color: #fff;',
    '  border: 1px solid #bbb;',
    '  border-radius: 4px;',
    '  padding: 4px 32px 4px 16px;',
    "  background-image: url(\"data:image/svg+xml,%3Csvg width='12' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 6L5.5 2 2 6.022' stroke-width='1.5' stroke='%236C6C6C' fill='none'/%3E%3Cpath d='M9 9L5.5 13 2 9.022' stroke-width='1.5' stroke='%236C6C6C' fill='none'/%3E%3C/svg%3E\");",
    '  background-position: right 16px center;',
    '  background-repeat: no-repeat;',
    '}',
    '#fseNavTo--TOC {',
    '  position: absolute;',
    '  top: 0;',
    '  left: 0;',
    '  width: 200%;',
    '  transform: translateY(-100%);',
    '  display: none;',
    '  flex-direction: column;',
    '  background-color: #fff;',
    '  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.12), 0 0 4px 0 rgba(0, 0, 0, 0.12);',
    '  z-index: 999;',
    '}',
    '.fseNavTo--TOC-Dropdown {',
    '  top: 100% !important;',
    '  transform: translateY(0) !important;',
    '}',
    '.fseNavTo--Heading {',
    '  background-color: #fff;',
    '  text-align: left;',
    '  border: none;',
    '  padding: .5em 1em;',
    '}',
    '.fseNavTo--Heading:hover {',
    '  background-color: #f4f4f4;',
    '}',
    'input[class^="facet--checkbox"] {',
    '  position: absolute;',
    '  opacity: 0;',
    '  cursor: pointer;',
    '  height: 0;',
    '  width: 0;',
    '}',
    '.fseFacet--Checkbox {',
    '  position: absolute;',
    '  top: 0;',
    '  left: 0;',
    '  height: 18px;',
    '  width: 18px;',
    '  border: 1px solid #aaa;',
    '}',
    '.fseFacet--Container {',
    '  display: block;',
    '  position: relative;',
    '  padding-left: 24px;',
    '  cursor: pointer;',
    '  -webkit-user-select: none;',
    '  -moz-user-select: none;',
    '  -ms-user-select: none;',
    '  user-select: none;',
    '}',
    '.fseFacet--Container:hover input ~ .fseFacet--Checkbox {',
    '  background-color: #eee;',
    '}',
    '.fseFacet--Container input:checked ~ .fseFacet--Checkbox {',
    '',
    '}',
    '.fseFacet--Checkbox:after {',
    '  content: "";',
    '  position: absolute;',
    '  display: none;',
    '}',
    '.fseFacet--Container input:checked ~ .fseFacet--Checkbox:after {',
    '  display: block;',
    '  content: "\\2714"',
    '}',
    '.fseFacet--Container .fseFacet--Checkbox:after {',
    '  left: 0;',
    '  top: 0;',
    '  width: 16px;',
    '  height: 16px;',
    '  color: var(--brand-blue);',
    '  font-weight: 700;',
    '  text-align: center;',
    '  vertical-align: middle',
    '}',
  ].join('\n');

  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  const heads = document.getElementsByTagName('head');
  heads[0].appendChild(style);
})();
