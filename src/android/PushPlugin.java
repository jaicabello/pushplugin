package com.hms.cordova.plugin;

import android.text.TextUtils;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;

import com.huawei.agconnect.config.AGConnectServicesConfig;
import com.huawei.hms.aaid.HmsInstanceId;


public class PushPlugin extends CordovaPlugin {

    private static final String TAG = PushPlugin.class.getSimpleName();

    @Override
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) {
        if (action.equals("getToken")) {
            getToken(callbackContext);
        }
        return true;
    }

    private void getToken(CallbackContext callbackContext) {
        Log.i(TAG, "get token: begin");
        try {
            String appId = AGConnectServicesConfig.fromContext(cordova.getContext()).getString("client/app_id");
            String pushToken = HmsInstanceId.getInstance(cordova.getContext()).getToken(appId, "HCM");
            if (!TextUtils.isEmpty(pushToken)) {
                Log.i(TAG, "******TOKEN******:" + pushToken);
                PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, pushToken);
                callbackContext.sendPluginResult(pluginResult);
            }
        } catch (Exception e) {
            Log.e(TAG, "getToken Failed, " + e);
            PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
            callbackContext.sendPluginResult(pluginResult);
        }
    }
}