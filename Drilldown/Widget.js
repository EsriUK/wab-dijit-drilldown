/*global declare, define, console, window, setTimeout */

/*
 | Copyright 2015 ESRI (UK) Limited
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/when',
    'dojo/on',
    'dojo/query',
    'dojo/keys',
    'jimu/BaseWidget',
    'jimu/LayerInfos/LayerInfos',
    'jimu/utils',
    './Drilldown/Drilldown',
    './Drilldown/Locators/LLPGLocator',
    './Drilldown/Locators/ABXLocator',
    "./Drilldown/Locators/GMSLocator",
    "./Drilldown/Locators/OSGLocator",
    "./Drilldown/Locators/ABXDPALocator",
    'esri/lang',
    './Search/utils',
    './Search/Widget',
    'dojo/i18n!esri/nls/jsapi',
    'dojo/NodeList-dom'
],
function (declare, lang, array, html, when, on, query, keys, BaseWidget, LayerInfos, jimuUtils, Drilldown, LLPGLocator, ABXLocator, GMSLocator, OSGLocator, ABXDPALocator, esriLang, utils, Search, esriBundle) {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        isEmpty = function (obj) {
            var key;

            // null and undefined are "empty"
            if (obj === undefined || obj === null) {
                return true;
            }

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0) {
                return false;
            }
            if (obj.length === 0) {
                return true;
            }
            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }

            return true;
        };

    return declare([Search], {
        // summary:
        //      A hierarchical address search Web AppBuilder widget that extends the functionality of the Esri Search widget.
        //
        // description: 
        //      Search for and display address details in a hierarchical list. The Drilldown widget works with custom locators to 
        //      create a picklist from the address results and output this as an interactive list.

        name: 'Drilldown',
        baseClass: 'jimu-widget-drilldown',
        drilldownDijit: null,
        drilldownResults: null,

        postCreate: function () {
            if (this.closeable || !this.isOnScreen) {
                html.addClass(this.drilldownNode, 'default-width-for-openAtStart');
            }
        },

        startup: function () {
            BaseWidget.prototype.startup.apply(this, arguments);

            if (!(this.config && this.config.sources)) {
                this.config.sources = [];
            }

            LayerInfos.getInstance(this.map, this.map.itemInfo)
            .then(lang.hitch(this, function (layerInfosObj) {
                this.layerInfosObj = layerInfosObj;
                utils.setMap(this.map);
                utils.setLayerInfosObj(this.layerInfosObj);
                utils.setAppConfig(this.appConfig);
                when(utils.getConfigInfo(this.config)).then(lang.hitch(this, function (config) {
                    if (!this.domNode) {
                        return;
                    }

                    var searchSouces = this._convertConfig(config);
                    this.drilldownDijit = new Drilldown({
                        activeSourceIndex: searchSouces.length === 1 ? 0 : 'all',
                        autoSelect: false,
                        enableSuggestions: false,
                        enableButtonMode: false,
                        enableLabel: false,
                        enableInfoWindow: true,
                        showInfoWindowOnSelect: true,
                        map: this.map,
                        sources: searchSouces,
                        theme: 'arcgisSearch'
                    });
                    html.place(this.drilldownDijit.domNode, this.drilldownNode);
                    this.drilldownDijit.startup();

                    this._resetDrilldownDijitStyle();

                    this.own(
                        this.drilldownDijit.watch(
                        'activeSourceIndex',
                        lang.hitch(this, '_onSourceIndexChange')
                        )
                    );

                    this.own(
                        on(this.drilldownDijit.domNode, 'click', lang.hitch(this, '_onSearchDijitClick'))
                    );
                    this.own(on(this.drilldownDijit.inputNode, "keyup", lang.hitch(this, function (e) {
                        if (e.keyCode !== keys.ENTER) {
                            this._onClearSearch();
                        }
                    })));
                    this.own(
                        on(this.drilldownDijit, 'search-results', lang.hitch(this, '_onSearchResults'))
                    );
                    this.own(
                        on(this.drilldownDijit, 'suggest-results', lang.hitch(this, '_onSuggestResults'))
                    );
                    this.own(
                        on(this.drilldownDijit, 'select-result', lang.hitch(this, '_onSelectResult'))
                    );
                    this.own(
                        on(this.drilldownResultsNode, 'li:click', lang.hitch(this, '_onSelectSearchResult'))
                    );
                    this.own(on(
                        this.drilldownResultsNode,
                        '.show-all-results:click',
                        lang.hitch(this, '_showResultMenu')
                    ));
                    this.own(
                        on(window.document, 'click', lang.hitch(this, function (e) {
                            if (!html.isDescendant(e.target, this.drilldownResultsNode)) {
                                this._hideResultMenu();
                                this._resetSelectorPosition('.show-all-results');
                            }
                        }))
                    );
                    this.own(
                        on(this.drilldownDijit, 'clear-search', lang.hitch(this, '_onClearSearch'))
                    );
                }));
            }));
        },

        setPosition: function () {
            this._resetDrilldownDijitStyle();
            this.inherited(arguments);
        },

        resize: function () {
            this._resetDrilldownDijitStyle();
        },

        _resetDrilldownDijitStyle: function () {
            html.removeClass(this.domNode, 'use-absolute');
            if (this.drilldownDijit && this.drilldownDijit.domNode) {
                html.setStyle(this.drilldownDijit.domNode, 'width', 'auto');
            }

            setTimeout(lang.hitch(this, function () {
                var box, sourcesBox, submitBox, style, inputGroup, groupBox, extents;

                if (this.drilldownDijit && this.drilldownDijit.domNode) {
                    box = html.getMarginBox(this.domNode);
                    sourcesBox = html.getMarginBox(this.drilldownDijit.sourcesBtnNode);
                    submitBox = html.getMarginBox(this.drilldownDijit.submitNode);
                    style = null;

                    if (box.w) {
                        html.setStyle(this.drilldownDijit.domNode, 'width', box.w + 'px');
                        html.addClass(this.domNode, 'use-absolute');


                        if (isFinite(sourcesBox.w) && isFinite(submitBox.w)) {
                            if (window.isRTL) {
                                style = {
                                    left: submitBox.w + 'px',
                                    right: sourcesBox.w + 'px'
                                };
                            } else {
                                style = {
                                    left: sourcesBox.w + 'px',
                                    right: submitBox.w + 'px'
                                };
                            }
                            inputGroup = query('.searchInputGroup', this.drilldownDijit.domNode)[0];

                            if (inputGroup) {
                                html.setStyle(inputGroup, style);
                                groupBox = html.getMarginBox(inputGroup);
                                extents = html.getPadBorderExtents(this.drilldownDijit.inputNode);
                                html.setStyle(this.drilldownDijit.inputNode, 'width', groupBox.w - extents.w + 'px');
                            }

                        }
                    }
                }
            }), 50);
        },

        _convertConfig: function (config) {
            var sources = [], a = this.inherited(arguments), searchSources,
                searchSourcesFunc = function (item) {
                    if (!isEmpty(item)) {
                        sources.push(item);
                    }
                };

            searchSources = array.map(config.sources, lang.hitch(this, function (source) {
                var locatorConf = {
                    locator: null,
                    outFields: ["*"],
                    singleLineFieldName: "",
                    name: "",
                    placeholder: "",
                    countryCode: "",
                    maxResults: 6
                };

                if (source && source.url && source.type === 'drilldown') {
                    locatorConf.singleLineFieldName = source.singleLineFieldName || "",
                    locatorConf.name = source.name || "";
                    locatorConf.placeholder = source.placeholder || "";
                    locatorConf.countryCode = source.countryCode || "";
                    locatorConf.maxResults = source.maxResults || 6;

                    switch (source.locatorType) {
                        case "AGS_LLPG":
                            locatorConf.locator = new AGSLLPGLocator(source.url || "");
                            break;

                        case "LLPG":
                            locatorConf.locator = new LLPGLocator(source.url || "");
                            break;

                        case "ABX":
                            locatorConf.locator = new ABXLocator(source.url || "");
                            break;

                        case "GMS":
                            locatorConf.locator = new GMSLocator(source.url || "");
                            break;

                        case "ABXDPA":
                            locatorConf.locator = new ABXDPALocator(source.url || "");
                            break;

                        case "OSG":
                            locatorConf.locator = new OSGLocator(source.url || "");
                            break;
                    }
                    return locatorConf;
                }
                else {
                    return {};
                }
            }));

            array.forEach(searchSources, searchSourcesFunc);
            array.forEach(a, searchSourcesFunc);
            return sources;
        },

        _onSourceIndexChange: function () {
            if (this.drilldownDijit.value) {
                this.drilldownDijit.search(this.drilldownDijit.value);
            }
        },

        _onSearchResults: function (evt) {
            var sources = this.drilldownDijit.get('sources'), activeSourceIndex = this.drilldownDijit.get('activeSourceIndex'),
                value = this.drilldownDijit.get('value'), htmlContent = "", results = evt.results, _activeSourceNumber = null,
                i, name, r, partialMatch, maxResults, j = 0, len = 0, untitledResult, text, result;

            if (results && evt.numResults > 0) {
                html.removeClass(this.drilldownDijit.containerNode, 'showSuggestions');
                this.drilldownResults = results;
                htmlContent += '<div class="show-all-results jimu-ellipsis" title="' +
                this.nls.showAll + '">' +
                this.nls.showAllResults + '<strong >' + value + '</strong></div>';
                htmlContent += '<div class="searchMenu" role="menu">';

                for (i in results) {
                    if (results.hasOwnProperty(i)) {
                        if (results[i] && results[i].length) {
                            name = sources[parseInt(i, 10)].name;
                            if (sources.length > 1 && activeSourceIndex === 'all') {
                                htmlContent += '<div title="' + name + '" class="menuHeader">' + name + '</div>';
                            }
                            htmlContent += "<ul>";
                            partialMatch = value;
                            r = new RegExp("(" + partialMatch + ")", "gi");
                            maxResults = sources[i].maxResults;

                            for (j = 0, len = results[i].length; j < len && j < maxResults; j++) {
                                untitledResult = (esriBundle && esriBundle.widgets &&
                                esriBundle.widgets.Search && esriBundle.widgets.Search.main &&
                                esriBundle.widgets.Search.main.untitledResult) || "Untitled";
                                text = esriLang.isDefined(results[i][j].name) ?
                                results[i][j].name : untitledResult;

                                htmlContent += '<li title="' + text + '" data-index="' + j +
                                '" data-source-index="' + i + '" role="menuitem" tabindex="0">' +
                                text.toString().replace(r, "<strong >$1</strong>") + '</li>';
                            }
                            htmlContent += '</url>';

                            if (evt.numResults === 1) {
                                _activeSourceNumber = i;
                            }
                        }
                    }
                }
                htmlContent += "</div>";
                this.drilldownResultsNode.innerHTML = htmlContent;

                this._showResultMenu();

                if (evt.numResults === 1 && (isFinite(_activeSourceNumber))) {
                    result = evt.results &&
                    evt.results[_activeSourceNumber] && evt.results[_activeSourceNumber][0];
                    if (result) {
                        this.drilldownDijit.select(result);
                    }
                }

                this._resetSelectorPosition('.searchMenu');
            }
            else {
                this._onClearSearch();
            }
        },

        _onSelectSearchResult: function (evt) {
            var target = evt.target, result = null, dataSourceIndex, dataIndex;
            while (!(html.hasAttr(target, 'data-source-index') && html.getAttr(target, 'data-index'))) {
                target = target.parentNode;
            }
            
            dataSourceIndex = html.getAttr(target, 'data-source-index');
            dataIndex = parseInt(html.getAttr(target, 'data-index'), 10);
            
            if (dataSourceIndex !== 'all') {
                dataSourceIndex = parseInt(dataSourceIndex, 10);
            }
            if (this.drilldownResults && this.drilldownResults[dataSourceIndex] &&
            this.drilldownResults[dataSourceIndex][dataIndex]) {
                result = this.drilldownResults[dataSourceIndex][dataIndex];
                this.drilldownDijit.select(result);
            }
        },

        _onSelectResult: function (e) {
            var result = e.result, dataSourceIndex, sourceResults, dataIndex = 0, i = 0, len = 0,
                title, dIdx, dsIndex;

            if (!(result && result.name)) {
                return;
            }
            dataSourceIndex = e.sourceIndex;
            sourceResults = this.drilldownResults[dataSourceIndex];
           
            for (i = 0, len = sourceResults.length; i < len; i++) {
                if (jimuUtils.isEqual(sourceResults[i], result)) {
                    dataIndex = i;
                    break;
                }
            }
            query('li', this.drilldownResultsNode)
            .forEach(lang.hitch(this, function (li) {
                html.removeClass(li, 'result-item-selected');
                title = html.getAttr(li, 'title');
                dIdx = html.getAttr(li, 'data-index');
                dsIndex = html.getAttr(li, 'data-source-index');

                if (title === result.name &&
                    dIdx === dataIndex.toString() &&
                    dsIndex === dataSourceIndex.toString()) {
                    html.addClass(li, 'result-item-selected');
                }
            }));
        },

        _onClearSearch: function () {
            html.setStyle(this.drilldownResultsNode, 'display', 'none');
            this.drilldownResultsNode.innerHTML = "";
            this.drilldownResults = null;
        },

        _hideResultMenu: function () {
            query('.show-all-results', this.drilldownResultsNode).style('display', 'block');
            query('.searchMenu', this.drilldownResultsNode).style('display', 'none');
        },

        _showResultMenu: function () {
            var groupNode, groupBox, style;

            html.setStyle(this.drilldownResultsNode, 'display', 'block');
            query('.show-all-results', this.drilldownResultsNode).style('display', 'none');
            query('.searchMenu', this.drilldownResultsNode).style('display', 'block');

            groupNode = query('.searchInputGroup', this.drilldownDijit.domNode)[0];
            if (groupNode) {
                groupBox = html.getMarginBox(groupNode);
                style = {
                    left: groupBox.l + 'px',
                    width: groupBox.w + 'px'
                };
                query('.show-all-results', this.drilldownResultsNode).style(style);
                query('.searchMenu', this.drilldownResultsNode).style(style);
            }
        }
    });
});