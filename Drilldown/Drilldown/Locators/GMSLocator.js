define(["dojo/_base/declare","./_LocatorBase"],function(a,b){return a([b],{locatorType:"GMS",resultsPickList:null,streetGrouping:["STREET_NAME","LOCALITY_NAME","TOWN_NAME","COUNTY_NAME"],premiseGrouping:["PAO_TEXT","PAO_END_SFX","PAO_END_NO","PAO_START_SFX","PAO_START_NO"],streetFields:{STREET_DESCRIPTOR:"STREET_NAME",LOCALITY_NAME:"LOCALITY_NAME",TOWN_NAME:"TOWN_NAME",ADMINISTRATIVE_AREA:"COUNTY_NAME"},paoFields:{PAO_TEXT:"PAO_TEXT",PAO_START_NUMBER:"PAO_START_NO",PAO_START_SUFFIX:"PAO_START_SFX",PAO_END_NUMBER:"PAO_END_NO",PAO_END_SUFFIX:"PAO_END_SFX"},saoFields:{SAO_TEXT:"SAO_TEXT",SAO_START_NUMBER:"SAO_START_NO",SAO_START_SUFFIX:"SAO_START_SFX",SAO_END_NUMBER:"SAO_END_NO",SAO_END_SUFFIX:"SAO_END_SFX"}})});