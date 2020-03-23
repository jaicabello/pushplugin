"use strict";

var path = require("path");
var fs = require("fs");

var constants = {
  agconnectServices: "agconnect-services",
  platforms: "platforms",
  android: {
    platform: "android",
    wwwFolder: "assets/www"
  },
  JSONFileExtension: ".json",
  folderNameSuffix: ".agconnect"
};

function handleError(errorMessage, defer) {
  console.log(errorMessage);
  defer.reject();
}

function checkIfFolderExists(path) {
  return fs.existsSync(path);
}

function getFilesFromPath(path) {
  return fs.readdirSync(path);
}

function getSourceFolderPath(context, wwwPath) {
  var sourceFolderPath;
  var appId = getAppId(context);
  var cordovaAbove7 = isCordovaAbove(context, 7);

  // New way of looking for the configuration files' folder
  if (cordovaAbove7) {
    sourceFolderPath = path.join(context.opts.projectRoot, "www", appId + constants.folderNameSuffix);
  } else {
    sourceFolderPath = path.join(wwwPath, appId + constants.folderNameSuffix);
  }

  return sourceFolderPath;
}

function getResourcesFolderPath(context, platform, platformConfig) {
  var platformPath = path.join(context.opts.projectRoot, constants.platforms, platform);
  return path.join(platformPath, platformConfig.wwwFolder);
}

function getPlatformConfigs(platform) {
  if (platform === constants.android.platform) {
    return constants.android;
  } else if (platform === constants.ios.platform) {
    return constants.ios;
  }
}

function getAGSFile(folder, JSONFileName) {
  try {
    var files = getFilesFromPath(folder);
    for (var i = 0; i < files.length; i++) {
      if (files[i].endsWith(constants.JSONFileExtension)) {
        var fileName = path.basename(files[i], constants.JSONFileExtension);
        if (fileName === JSONFileName) {
          return path.join(folder, files[i]);
        }
      }
    }
  } catch (e) {
    console.log(e);
    return;
  }
}

function getAppId(context) {
  var cordovaAbove8 = isCordovaAbove(context, 8);
  var et;
  if (cordovaAbove8) {
    et = require('elementtree');
  } else {
    et = context.requireCordovaModule('elementtree');
  }

  var config_xml = path.join(context.opts.projectRoot, 'config.xml');
  var data = fs.readFileSync(config_xml).toString();
  var etree = et.parse(data);
  return etree.getroot().attrib.id;
}

function isCordovaAbove(context, version) {
  var cordovaVersion = context.opts.cordova.version;
  var sp = cordovaVersion.split('.');
  return parseInt(sp[0]) >= version;
}

function copyFromSourceToDestPath(defer, sourcePath, destPath) {
  fs.createReadStream(sourcePath).pipe(fs.createWriteStream(destPath))
  .on("close", function (err) {
    defer.resolve();
  })
  .on("error", function (err) {
    console.log(err);
    defer.reject();
  });
}

module.exports = function(context) {
  var cordovaAbove8 = isCordovaAbove(context, 8);
  var cordovaAbove7 = isCordovaAbove(context, 7);
  var defer;
  if (cordovaAbove8) {
    defer = require("q").defer();
  } else {
    defer = context.requireCordovaModule("q").defer();
  }
  
  var platform = context.opts.plugin.platform;
  var platformConfig = getPlatformConfigs(platform);
  if (!platformConfig) {
    handleError("Invalid platform", defer);
  }

  var wwwPath = getResourcesFolderPath(context, platform, platformConfig);
  var sourceFolderPath = getSourceFolderPath(context, wwwPath);
  
  var agconnectServicesJSONFile = getAGSFile(sourceFolderPath, constants.agconnectServices);
  if (!agconnectServicesJSONFile) {
    handleError("No JSON file found containing google services configuration file", defer);
  }

  if (cordovaAbove7) {
    var destPath = path.join(context.opts.projectRoot, "platforms", platform, "app");
    if (checkIfFolderExists(destPath)) {
      var destFilePath = path.join(destPath, constants.agconnectServices+".json");
      copyFromSourceToDestPath(defer, agconnectServicesJSONFile, destFilePath);
    }
  }else{
    var destFilePath = path.join(context.opts.plugin.dir, constants.agconnectServices+".json");
    copyFromSourceToDestPath(defer, agconnectServicesJSONFile, destFilePath);
  }
      
  return defer.promise;
}
