
function PushPlugin() {}


PushPlugin.prototype.getToken = function(successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, 'PushPlugin', 'getToken');
}

// Installation constructor that binds PushPlugin to window
PushPlugin.install = function() {
  if (!window.plugins) {
    window.plugins = {};
  }
  window.plugins.PushPlugin = new PushPlugin();
  return window.plugins.PushPlugin;
};
cordova.addConstructor(PushPlugin.install);