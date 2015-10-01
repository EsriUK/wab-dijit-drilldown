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
    "../Search/setting/LocatorSourceSetting",
    "dojo/text!./DrilldownSourceSetting.html"
],
function (declare, LocatorSourceSetting, template) {
    return declare([LocatorSourceSetting], {
        // summary:
        //      Custom settings for configuring a drilldown locaotr.
        //
        // description: 
        //      Inherit from the standard locator settings and extend them with a locator type.

        // templateString: String
        //      Override the standard template and add the locator type.
        templateString: template,

        getConfig: function() {
            // summary:
            //      Override the locator settings getConfig function and add in locator type.

            var geocode = {
                url: this.locatorUrl.get('value'),
                name: this.locatorName.get('value'),
                singleLineFieldName: this.singleLineFieldName,
                placeholder: this.placeholder.get('value'),
                countryCode: this.countryCode.get('value'),
                maxResults: this.maxResults.get('value'),
                type: "drilldown",
                locatorType: this.locatorType.get('value')
            };
            return geocode;
        },

        _setSourceItems: function () {
            // summary:
            //      Override the _setSourceItems function and add in locatorType.

            var config = this.config;
            this.inherited(arguments);
            this.locatorType.set("value", config.locatorType);
        }
    });
});