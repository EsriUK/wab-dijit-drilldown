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
    "dojo/_base/declare",
    "dojo/_base/html",
    "dojo/_base/lang",
    "dojo/on",
    "./DrilldownSourceSetting",
    "../Search/setting/Setting",
    "jimu/dijit/SimpleTable",
    "jimu/dijit/LoadingIndicator"
], function (declare, html, lang, on, DrilldownSourceSetting, SearchSetting) {
    /*jshint maxlen: 150*/
    /*jshint smarttabs:true */

    return declare([SearchSetting], {
        baseClass: 'jimu-widget-drilldown-setting',
        _currentSourceSetting: null,


        _onMenuItemClick: function(evt) {
            // check fields
            if (this._currentSourceSetting && !this._currentSourceSetting.isValidConfig()) {
                this._currentSourceSetting.showValidationTip();
                return;
            }

            var itemType = evt && evt.target && html.getAttr(evt.target, "type");

            switch (itemType) {
                case "locator":
                    this._addNewLocator();
                    break;

                case "query":
                    this._addNewQuerySource();
                    break;

                case "drilldown":
                    this._addNewDrilldownLocator();
                    break;
            }
        },

       

        _addNewDrilldownLocator: function() {
            var addResult = this.sourceList.addRow({
                name: "New Drilldown Locator" //json.name
            });
            if (addResult && addResult.success) {
                this._createNewDrilldownLocatorSourceSetting({}, {}, addResult.tr);
                this.sourceList.selectRow(addResult.tr);
                this._currentSourceSetting._onSetLocatorUrlClick();
            }
        },


        _createNewDrilldownLocatorSourceSetting: function (setting, definition, relatedTr) {
            if (this._currentSourceSetting) {
                this._closeSourceSetting();
            }

            this._currentSourceSetting = new DrilldownSourceSetting({
                nls: this.nls
            });
            this._currentSourceSetting.placeAt(this.sourceSettingNode);
            this._currentSourceSetting.setDefinition(definition);
            this._currentSourceSetting.setConfig({
                url: setting.url || "",
                name: setting.name || "",
                singleLineFieldName: setting.singleLineFieldName || "",
                placeholder: setting.placeholder || "",
                countryCode: setting.countryCode || "",
                maxResults: setting.maxResults || 6,
                type: "drilldown",
                locatorType: setting.locatorType || ""
            });
            this._currentSourceSetting.setRelatedTr(relatedTr);

            this._currentSourceSetting.own(
                on(this._currentSourceSetting, 'reset-locator-source', lang.hitch(this, function (item) {
                    var tr = this._currentSourceSetting.getRelatedTr();
                    this.sourceList.editRow(tr, {
                        name: item.name || ""
                    });
                }))
            );
        },


        _onSourceItemSelected: function(tr) {
            var config = this._getRelatedConfig(tr);
            var currentTr = this._currentSourceSetting && this._currentSourceSetting.tr;
            if (!config || tr === currentTr) {
                return;
            }

            // check fields
            if (this._currentSourceSetting && !this._currentSourceSetting._isNew && !this._currentSourceSetting.isValidConfig()) {
                this._currentSourceSetting.showValidationTip();
                this.sourceList.selectRow(currentTr);
                return;
            }

            switch (config.type) {
                case "query":
                    this._createNewQuerySourceSetting(config, config._definition || {}, tr);
                    break;

                case "locator":
                    this._createNewLocatorSourceSetting(config, config._definition || {}, tr);
                    break;

                case "drilldown":
                    this._createNewDrilldownLocatorSourceSetting(config, config._definition || {}, tr);
                    break;
            }
        }
    });
  });