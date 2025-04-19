
package com.lovable.streamify;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.media.MediaPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register plugins
        registerPlugin(MediaPlugin.class);
    }
}
