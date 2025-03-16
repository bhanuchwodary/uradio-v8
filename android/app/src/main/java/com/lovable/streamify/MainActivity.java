
package com.lovable.streamify;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Start the PlaybackService for background audio
        Intent serviceIntent = new Intent(this, PlaybackService.class);
        startService(serviceIntent);
    }
}
