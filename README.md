wab-dijit-drilldown
====================
The Web AppBuilder Widget wraps up the arcgis-dijit-drilldown code, this can be found [here](https://github.com/EsriUK/arcgis-dijit-drilldown)

## Features
The drilldown widget provides hierarchical address search results.
The Web AppBuilder Drilldown widget extends the functionality of the WAB Search widget, so you can use it in the same way. 

## Deployment
The widget can be used with the developer edition of the Web AppBuilder.
To use the widget download this repository and copy the Drilldown folder into the Web AppBuilder widget repository, by default this is client\stemapp\widgets. 
Then to get it to show in the applications you need to modify the config files and replace the Search widget with the Drilldown widget. The config files for the applications can be
found in client\stemapp\predefined-apps

As an example you can add the widget to the default viewer by changing Search to Drilldown as shown below.
```javascript
{
	"uri": "widgets/Drilldown/Widget",
    "position": {
		"left": 55,
		"top": 5
	},
	"version": "1.3"
}
```

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Support

Use of this widget is covered by [Esri UK Developer Support](http://www.esriuk.com/support/support-services)

## Contributing

Anyone and everyone is welcome to contribute.

## Licensing

Copyright 2015 ESRI (UK) Limited

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the Licence.

A copy of the license is available in the repository's [license.txt](license.txt) file.