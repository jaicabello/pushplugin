package com.hms.cordova.plugin;

import android.util.Log;

import com.huawei.hms.push.HmsMessageService;
import com.huawei.hms.push.RemoteMessage;

public class PushService extends HmsMessageService {
    private static final String TAG = PushService.class.getSimpleName();

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "onMessageReceived");
        if (remoteMessage != null) {
            String message = remoteMessage.getData();
            Log.d(TAG, message);
        }
        super.onMessageReceived(remoteMessage);
    }

    @Override
    public void onMessageSent(String s) {
        Log.i(TAG, "Got Msg " + s);
    }


    @Override
    public void onNewToken(String s) {
        super.onNewToken(s);
    }
}
