define(['../Search/VersionManager'],
  function (VersionManager) {

    

    VersionManager.prototype = new BaseVersionManager();
    //VersionManager.prototype.constructor = VersionManager;
    return VersionManager;
  });