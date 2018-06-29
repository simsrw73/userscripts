// ==UserScript==
// @name         Faithlife Community Forum Search2G
// @namespace    http://tampermonkey.net/
// @version      0.7.1
// @description  Send forum searches to Google Search
// @author       Randy W. Sims
// @license      MIT
// @match        https://community.logos.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    var searchButtonID = 'ctl00_ctl00_bhcr_sr_sr_ctl00_ctl00_TitleBarSearchButton';
    var SearchInputID = 'ctl00_ctl00_bhcr_sr_sr_ctl00_ctl00_TitleBarSearchText';

    var searchEngine = 'https://www.google.com/search?q=';

    var siteLogosForums  = 'site:community.logos.com';
    var siteLogosWiki    = 'site:wiki.logos.com';
    var siteLogosSupport = 'site:logos.com/support';

    var basicSearch = siteLogosForums;
    var superSearch = '(' + siteLogosSupport + ' OR ' + siteLogosWiki + ' OR ' + siteLogosForums + ')';

    var searchGoogle = function(isSuperSearch) {
        var searchInput = document.getElementById(SearchInputID);
        if (searchInput == null || searchInput.value == '') { return; } /* No search term entered */

        var searchQuery;
        if (isSuperSearch) {
            searchQuery = searchEngine + encodeURI(superSearch + ' ' + searchInput.value);
        } else {
            searchQuery = searchEngine + encodeURI(basicSearch + ' ' + searchInput.value);
        }

        window.location.href = searchQuery;
    }


    var searchButton = document.getElementById(searchButtonID);
    if (searchButton == null) { return; } /* No Searchbar here */

    searchButton.addEventListener('click', function(e) {
        if (e.shiftKey) {
            return; /* fall through to the default search */
        } else if (e.ctrlKey) {
            e.preventDefault();
            searchGoogle(true);
        } else {
            e.preventDefault();
            searchGoogle(false);
        }
    });

    window.onkeydown = function(e) {
        if (e.keyCode == 13) {
            if (e.shiftKey) {
                return; /* fall through to the default search */
            } else if (e.ctrlKey) {
                searchGoogle(true);
            } else {
                searchGoogle(false);
            }
        } else if (e.keyCode == 83 && e.altKey) {
            var searchInput = document.getElementById(SearchInputID);
            if (searchInput != null) { searchInput.focus(); }
        }
    };

    return;

})();
