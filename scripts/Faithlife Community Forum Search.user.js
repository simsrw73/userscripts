// ==UserScript==
// @name         Faithlife Community Forum Search2G
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Send forum searches to Google Search
// @author       Randy W. Sims
// @updateURL    https://github.com/simsrw73/userscripts/raw/master/scripts/Faithlife%20Community%20Forum%20Search.user.js
// @downloadURL    https://github.com/simsrw73/userscripts/raw/master/scripts/Faithlife%20Community%20Forum%20Search.user.js
// @match        https://community.logos.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    /* Remove listeners by duplicating original and substituting the new eventless clone */
    var removeAllListeners = function(e) {
        var o = e;
        var n = e.cloneNode(true);
        o.parentNode.replaceChild(n, o);
        return n;
    };


    var searchButtonID = 'ctl00_ctl00_bhcr_sr_sr_ctl00_ctl00_TitleBarSearchButton';
    var SearchInputID = 'ctl00_ctl00_bhcr_sr_sr_ctl00_ctl00_TitleBarSearchText';

    var searchButton = document.getElementById(searchButtonID);
    if (searchButton == null) { return; } /* No Searchbar here */
    searchButton = removeAllListeners(searchButton);

    var searchInput = document.getElementById(SearchInputID);
    if (searchInput == null) { return; } /* No Searchbar here */
    searchInput = removeAllListeners(searchInput);


    var searchEngine = 'https://www.google.com/search?q=';

    var siteLogosForums = 'site:community.logos.com';
    var siteLogosWiki   = 'site:wiki.logos.com';

    var basicSearch = siteLogosForums;
    var superSearch = siteLogosForums + ' OR ' + siteLogosWiki;

    searchButton.addEventListener('click', function(e) {
        if (searchInput.value == '') { return; } /* No search term entered */

        var searchQuery;
        if (e.ctrlKey) {
            searchQuery = searchEngine + encodeURI(searchInput.value + ' ' + superSearch);
        } else {
            searchQuery = searchEngine + encodeURI(searchInput.value + ' ' + basicSearch);
        }

        window.location.href = searchQuery;

        e.preventDefault();
        return false;
    });


    return true;

})();
