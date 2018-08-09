wab-dijit-drilldown
====================
The Web AppBuilder Widget wraps up the arcgis-dijit-drilldown code, this can be found [here](https://github.com/EsriUK/arcgis-dijit-drilldown)

## Features
The [drilldown widget](https://github.com/EsriUK/arcgis-dijit-drilldown) provides hierarchical address search results allowing the user to drilldown into the list of results and find a specific location.

For further information on when this might be useful to you, demo sites and details on how to get started using the widget please see our [blog](http://communityhub.esriuk.com/geoxchange/2015/11/23/need-a-more-flexible-way-to-search-for-addresses?rq=drilldown).

The Web Appbuilder Drilldown widget provides a version of the drilldown widget that has been wrapped up so it is ready to use directly as a custom widget within the [Web AppBuilder for ArcGIS](http://doc.arcgis.com/en/web-appbuilder/).  

This widget can be used to replace the existing WebApp Builder Search widget where there is a requirement for hierarchical address searching.  

The widget can also be used with ArcGIS Enterprise by hosting the widget on your server then using the custom widget within a Web AppBuilder instance [See: Add custom widgets](http://enterprise.arcgis.com/en/portal/latest/use/add-custom-widgets.htm).
 
## Requirements
- Web AppBuilder or Web AppBuilder Dev Edition. See [here](https://github.com/EsriUK/wab-dijit-drilldown/wiki)
- Supported Browsers, these can be found [here](https://github.com/EsriUK/arcgis-dijit-drilldown/wiki/Supported-Browsers)
- LocatorHub 5.3 (or above) and one of the following locators:
	- Addressbase Premium (Epoch 39 or above, requires LocatorHub 5.4)
	- LLPG
	- IDOX GMS Connector, V8.2 or greater **
	- One Scotland Gazetteer
	- Merge or Cascade locators using an appropriate standardised schema (requires LocatorHub 5.4).
	  For further information on the schema please see [here](https://github.com/EsriUK/arcgis-dijit-drilldown/wiki/Standardised-Schema)
- Experience with the Web AppBuilder for ArcGIS
- Basic developer skills (to edit the configuration based on step by step instructions)
- Capability to host your application


## Deployment

There are three ways that the Web AppBuilder drilldown widget can be integrated into your Web AppBuilder apps:
 1. If using ArcGIS Enterprise, host a custom drilldown widget on your server then use this with Web AppBuilder. [See: Add custom widgets](http://enterprise.arcgis.com/en/portal/latest/use/add-custom-widgets.htm). This is the recommended approach if you have ArcGIS Enterprise 10.5.1 or greater.
 2. Use the built-in version of the Web AppBuilder (in ArcGIS Online or ArcGIS Enterprise), then download the app and switch the search widget for the drilldown widget.  
	   This is the recommended approach if this is the only custom widget you are using and you only want to use the drilldown widget in a small number of apps, if you do not have ArcGIS Enterprise.
 3. Use the custom drilldown widget with the [developer edition](http://doc.arcgis.com/en/web-appbuilder/extend-apps/) of the Web AppBuilder.  
	   This allows you to create application templates which use the drilldown widget instead of the search widget and then author as many apps as you wish using these templates.  This is recommended if you want to use the drilldown widget in a large number of apps and/or in combination with other custom widgets, if you do not have ArcGS Enterprise.


The [wiki](https://github.com/EsriUK/wab-dijit-drilldown/wiki) provides step by step information on how to deploy the drilldown widget using each of these approaches.

Once you have created your application you will need to host it.  Esri UK provides a hosting capability through AppHub, please contact your Customer Success Manager if you are interested in this service.


## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Support

Use of the drilldown widget is covered by [Esri UK Developer Support](http://www.esriuk.com/support/support-services).

If you are a customer of Esri UK’s LocatorHub product and are in current maintenance, then your use of this Drilldown Widget for the Web AppBuilder (in an unmodified state) is covered by your LocatorHub support.

## Contributing

Anyone and everyone is welcome to contribute.

## Licensing

Copyright 2015 ESRI (UK) Limited

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the Licence.

A copy of the license is available in the repository's [license.txt](license.txt) file.


**[IDOX GMS Connector Configuration](https://github.com/EsriUK/arcgis-dijit-drilldown/wiki/IDOX-GMS-Connector-Configuration)
