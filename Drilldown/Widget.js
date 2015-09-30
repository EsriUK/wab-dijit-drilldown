///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

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
    './Drilldown/Locators/AGSLLPGLocator',
    './Drilldown/Locators/LLPGLocator',
    'esri/tasks/locator',
    'esri/layers/FeatureLayer',
    'esri/InfoTemplate',
    'esri/lang',
    './utils',
    'dojo/i18n!esri/nls/jsapi',
    'dojo/NodeList-dom'
],
  function (declare, lang, array, html, when, on, query, keys,
    BaseWidget, LayerInfos, jimuUtils, Drilldown, AGSLLPGLocator, LLPGLocator, Locator,
    FeatureLayer, InfoTemplate, esriLang, utils, esriBundle) {
      //To create a widget, you need to derive from BaseWidget.
      return declare([BaseWidget], {
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
              this.inherited(arguments);

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
                  if (this.drilldownDijit && this.drilldownDijit.domNode) {
                      var box = html.getMarginBox(this.domNode);
                      var sourcesBox = html.getMarginBox(this.drilldownDijit.sourcesBtnNode);
                      var submitBox = html.getMarginBox(this.drilldownDijit.submitNode);
                      var style = null;
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
                              var inputGroup = query('.searchInputGroup', this.drilldownDijit.domNode)[0];

                              if (inputGroup) {
                                  html.setStyle(inputGroup, style);
                                  var groupBox = html.getMarginBox(inputGroup);
                                  var extents = html.getPadBorderExtents(this.drilldownDijit.inputNode);
                                  html.setStyle(this.drilldownDijit.inputNode, 'width', groupBox.w - extents.w + 'px');
                              }

                          }
                      }
                  }
              }), 50);
          },

          _convertConfig: function (config) {
              var searchSouces = array.map(config.sources, lang.hitch(this, function (source) {
                  if (source && source.url && source.type === 'locator') {
                      return {
                          locator: new Locator(source.url || ""),
                          outFields: ["*"],
                          singleLineFieldName: source.singleLineFieldName || "",
                          name: source.name || "",
                          placeholder: source.placeholder || "",
                          countryCode: source.countryCode || "",
                          maxResults: source.maxResults || 6
                      };
                  }
                  else if (source && source.url && source.type === 'query') {
                      var flayer = new FeatureLayer(source.url || null, {
                          outFields: ["*"]
                      });
                      var template = this._getInfoTemplate(flayer, source, source.displayField);
                      return {
                          featureLayer: flayer,
                          outFields: ["*"],
                          searchFields: source.searchFields.length > 0 ? source.searchFields : ["*"],
                          displayField: source.displayField || "",
                          exactMatch: !!source.exactMatch,
                          name: source.name || "",
                          placeholder: source.placeholder || "",
                          maxResults: source.maxResults || 6,
                          infoTemplate: template
                      };
                  }
                  else if (source && source.url && source.type === 'drilldown') {
                      switch (source.locatorType) {
                          case "AGS_LLPG":
                              return {
                                  locator: new AGSLLPGLocator(source.url || ""),
                                  outFields: ["*"],
                                  singleLineFieldName: source.singleLineFieldName || "",
                                  name: source.name || "",
                                  placeholder: source.placeholder || "",
                                  countryCode: source.countryCode || "",
                                  maxResults: source.maxResults || 6
                              };
                              break;

                          case "LLPG":
                              return {
                                  locator: new LLPGLocator(source.url || ""),
                                  outFields: ["*"],
                                  singleLineFieldName: source.singleLineFieldName || "",
                                  name: source.name || "",
                                  placeholder: source.placeholder || "",
                                  countryCode: source.countryCode || "",
                                  maxResults: source.maxResults || 6
                              };
                              break;
                      }
                      return {
                          locator: new Locator(source.url || ""),
                          outFields: ["*"],
                          singleLineFieldName: source.singleLineFieldName || "",
                          name: source.name || "",
                          placeholder: source.placeholder || "",
                          countryCode: source.countryCode || "",
                          maxResults: source.maxResults || 6
                      };
                  }
                  else {
                      return {};
                  }
              }));

              return searchSouces;
          },

          _getInfoTemplate: function (fLayer, source, displayField) {
              var layerInfo = this.layerInfosObj.getLayerInfoById(source.layerId);
              var template = layerInfo && layerInfo.getInfoTemplate();
              if (layerInfo && template) {
                  return template;
              } else {
                  template = new InfoTemplate();
                  template.setTitle('&nbsp;');
                  template.setContent(lang.hitch(this, '_formatContent', source.name, fLayer, displayField));

                  return template;
              }
          },

          _formatContent: function (title, fLayer, displayField, graphic) {
              var content = "";
              if (graphic && graphic.attributes && fLayer && fLayer.url) {
                  var aliasAttrs = this._getFormatedAliasAttrs(
                    lang.clone(graphic.attributes),
                    fLayer.fields,
                    fLayer.typeIdField,
                    fLayer.types
                  );
                  var displayValue = graphic.attributes[displayField];
                  content += '<div class="esriViewPopup">' +
                    '<div class="mainSection">' +
                    (esriLang.isDefined(displayValue) ?
                      ('<div class="header">' + title + ': ' + displayValue + '</div>') : "") +
                    '<div class="hzLine"></div>' +
                    '<div>' +
                    '<table class="attrTable" cellpading="0" cellspacing="0">' +
                    '<tbody>';
                  for (var p in aliasAttrs) {
                      if (aliasAttrs.hasOwnProperty(p)) {
                          // content += p + ": " + aliasAttrs[p] + "</br>";
                          content += '<tr valign="top">' +
                            '<td class="attrName">' + p + '</td>' +
                            '<td class="attrValue">' + aliasAttrs[p] + '</td>' +
                            '</tr>';
                      }
                  }
                  content += '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '<div class="break"></div>' +
                    '</div>';
              }

              return content;
          },

          _getFormatedAliasAttrs: function (attrs, fields, typeIdField, types) {
              var aliasAttrs = {};
              array.forEach(fields, lang.hitch(this, function (_field, i) {
                  var isCodeValue = !!(_field.domain && _field.domain.type === 'codedValue');
                  var isDate = _field.type === "esriFieldTypeDate";
                  var isTypeIdField = typeIdField && (_field.name === typeIdField);

                  if (fields[i].type === "esriFieldTypeString") {
                      aliasAttrs[_field.alias] = this.urlFormatter(attrs[_field.name]);
                  } else if (fields[i].type === "esriFieldTypeDate") {
                      aliasAttrs[_field.alias] = this.dateFormatter(attrs[_field.name]);
                  } else if (fields[i].type === "esriFieldTypeDouble" ||
                    fields[i].type === "esriFieldTypeSingle" ||
                    fields[i].type === "esriFieldTypeInteger" ||
                    fields[i].type === "esriFieldTypeSmallInteger") {
                      aliasAttrs[_field.alias] = this.numberFormatter(attrs[_field.name]);
                  }

                  if (isCodeValue) {
                      aliasAttrs[_field.alias] = this.getCodeValue(_field.domain, attrs[_field.name]);
                  } else if (!isCodeValue && !isDate && !isTypeIdField) {
                      // Not A Date, Domain or Type Field
                      // Still need to check for codedType value
                      aliasAttrs[_field.alias] = _field.alias in aliasAttrs ?
                        aliasAttrs[_field.alias] : attrs[_field.name];
                      aliasAttrs[_field.alias] = this.getCodeValueFromTypes(
                        _field,
                        typeIdField,
                        types,
                        attrs,
                        aliasAttrs
                      );
                  }
              }));
              return aliasAttrs;
          },

          getCodeValue: function (domain, v) {
              for (var i = 0, len = domain.codedValues.length; i < len; i++) {
                  var cv = domain.codedValues[i];
                  if (v === cv.code) {
                      return cv.name;
                  }
              }
              return null;
          },

          urlFormatter: function (str) {
              if (str) {
                  var s = str.indexOf('http:');
                  if (s === -1) {
                      s = str.indexOf('https:');
                  }
                  if (s > -1) {
                      if (str.indexOf('href=') === -1) {
                          var e = str.indexOf(' ', s);
                          if (e === -1) {
                              e = str.length;
                          }
                          var link = str.substring(s, e);
                          str = str.substring(0, s) +
                            '<A href="' + link + '" target="_blank">' + this.nls.more + '</A>' +
                            str.substring(e, str.length);
                      }
                  }
              }
              return str || "";
          },

          dateFormatter: function (str) {
              if (str) {
                  var sDateate = new Date(str);
                  str = jimuUtils.localizeDate(sDateate, {
                      fullYear: true
                  });
              }
              return str || "";
          },

          numberFormatter: function (num) {
              if (typeof num === 'number') {
                  var decimalStr = num.toString().split('.')[1] || "",
                    decimalLen = decimalStr.length;
                  num = jimuUtils.localizeNumber(num, {
                      places: decimalLen
                  });
                  return '<span class="jimu-numeric-value">' + (num || "") + '</span>';
              }
              return num;
          },

          getCodeValueFromTypes: function (field, typeIdField, types, obj, aliasAttrs) {
              var codeValue = null;
              if (typeIdField && types && types.length > 0) {
                  var typeCheck = array.filter(types, lang.hitch(this, function (item) {
                      // value of typeIdFild has been changed above
                      return item.name === obj[typeIdField];
                  }));

                  if (typeCheck && typeCheck.domains &&
                    typeCheck.domains[field.name] && typeCheck.domains[field.name].codedValues) {
                      codeValue = this.getCodeValue(
                        typeCheck.domains[field.name],
                        obj[field.name]
                      );
                  }
              }
              var _value = codeValue !== null ? codeValue : aliasAttrs[field.alias];
              return _value || isFinite(_value) ? _value : "";
          },

          _resetSelectorPosition: function (cls) {
              var layoutBox = html.getMarginBox(window.jimuConfig.layoutId);
              query(cls, this.domNode).forEach(lang.hitch(this, function (menu) {
                  var menuPosition = html.position(menu);
                  if (menuPosition.y + menuPosition.h > layoutBox.h) {
                      html.setStyle(menu, 'top', (-menuPosition.h) + 'px');
                  }
              }));
          },

          _onSourceIndexChange: function () {
              if (this.drilldownDijit.value) {
                  this.drilldownDijit.search(this.drilldownDijit.value);
              }
          },

          _onSearchDijitClick: function () {
              this._resetSelectorPosition('.searchMenu');
          },

          _onSearchResults: function (evt) {
              var sources = this.drilldownDijit.get('sources');
              var activeSourceIndex = this.drilldownDijit.get('activeSourceIndex');
              var value = this.drilldownDijit.get('value');
              var htmlContent = "";
              var results = evt.results;
              var _activeSourceNumber = null;
              if (results && evt.numResults > 0) {
                  html.removeClass(this.drilldownDijit.containerNode, 'showSuggestions');

                  this.drilldownResults = results;
                  htmlContent += '<div class="show-all-results jimu-ellipsis" title="' +
                    this.nls.showAll + '">' +
                    this.nls.showAllResults + '<strong >' + value + '</strong></div>';
                  htmlContent += '<div class="searchMenu" role="menu">';
                  for (var i in results) {
                      if (results[i] && results[i].length) {
                          var name = sources[parseInt(i, 10)].name;
                          if (sources.length > 1 && activeSourceIndex === 'all') {
                              htmlContent += '<div title="' + name + '" class="menuHeader">' + name + '</div>';
                          }
                          htmlContent += "<ul>";
                          var partialMatch = value;
                          var r = new RegExp("(" + partialMatch + ")", "gi");
                          var maxResults = sources[i].maxResults;

                          for (var j = 0, len = results[i].length; j < len && j < maxResults; j++) {
                              var untitledResult = (esriBundle && esriBundle.widgets &&
                                esriBundle.widgets.Search && esriBundle.widgets.Search.main &&
                                esriBundle.widgets.Search.main.untitledResult) || "Untitled";
                              var text = esriLang.isDefined(results[i][j].name) ?
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
                  htmlContent += "</div>";
                  this.drilldownResultsNode.innerHTML = htmlContent;

                  this._showResultMenu();

                  if (evt.numResults === 1 && (isFinite(_activeSourceNumber))) {
                      var result = evt.results &&
                        evt.results[_activeSourceNumber] && evt.results[_activeSourceNumber][0];
                      if (result) {
                          this.drilldownDijit.select(result);
                      }
                  }

                  this._resetSelectorPosition('.searchMenu');
              } else {
                  this._onClearSearch();
              }
          },

          _onSuggestResults: function () {
              this._resetSelectorPosition('.searchMenu');

              this._hideResultMenu();
          },

          _onSelectSearchResult: function (evt) {
              var target = evt.target;
              while (!(html.hasAttr(target, 'data-source-index') && html.getAttr(target, 'data-index'))) {
                  target = target.parentNode;
              }
              var result = null;
              var dataSourceIndex = html.getAttr(target, 'data-source-index');
              var dataIndex = parseInt(html.getAttr(target, 'data-index'), 10);
              // var sources = this.drilldownDijit.get('sources');

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
              var result = e.result;
              if (!(result && result.name)) {
                  return;
              }
              var dataSourceIndex = e.sourceIndex;
              var sourceResults = this.drilldownResults[dataSourceIndex];
              var dataIndex = 0;
              for (var i = 0, len = sourceResults.length; i < len; i++) {
                  if (jimuUtils.isEqual(sourceResults[i], result)) {
                      dataIndex = i;
                      break;
                  }
              }
              query('li', this.drilldownResultsNode)
                .forEach(lang.hitch(this, function (li) {
                    html.removeClass(li, 'result-item-selected');
                    var title = html.getAttr(li, 'title');
                    var dIdx = html.getAttr(li, 'data-index');
                    var dsIndex = html.getAttr(li, 'data-source-index');

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
              html.setStyle(this.drilldownResultsNode, 'display', 'block');
              query('.show-all-results', this.drilldownResultsNode).style('display', 'none');
              query('.searchMenu', this.drilldownResultsNode).style('display', 'block');

              var groupNode = query('.searchInputGroup', this.drilldownDijit.domNode)[0];
              if (groupNode) {
                  var groupBox = html.getMarginBox(groupNode);
                  var style = {
                      left: groupBox.l + 'px',
                      width: groupBox.w + 'px'
                  };
                  query('.show-all-results', this.drilldownResultsNode).style(style);
                  query('.searchMenu', this.drilldownResultsNode).style(style);
              }
          }
      });
  });