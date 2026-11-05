package org.dsgnetwork.taptapmaker;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import android.graphics.Color;
import android.view.Window;
import android.view.WindowManager;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class MainActivity extends Activity {
  private static final int CHOOSE_AUDIO = 1001;
  private static final int OPEN_PROJECT = 1002;
  private static final int SAVE_PROJECT = 1003;
  private WebView web;
  private android.webkit.ValueCallback<Uri[]> fileCallback;
  private String pendingProject = "";

  @Override public void onCreate(Bundle b) {
    super.onCreate(b);
    getWindow().setStatusBarColor(Color.rgb(5,13,27));
    getWindow().setNavigationBarColor(Color.rgb(5,13,27));
    web = new WebView(this);
    web.setBackgroundColor(Color.rgb(6,17,35));
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(true);
    s.setAllowContentAccess(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setDefaultTextEncodingName("UTF-8");
    web.addJavascriptInterface(new Bridge(), "AndroidMaker");
    web.setWebChromeClient(new WebChromeClient() {
      @Override public boolean onShowFileChooser(WebView v, android.webkit.ValueCallback<Uri[]> cb, FileChooserParams params) {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        fileCallback = cb;
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("audio/*");
        i.putExtra(Intent.EXTRA_MIME_TYPES, new String[] {"audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/ogg"});
        startActivityForResult(i, CHOOSE_AUDIO);
        return true;
      }
    });
    setContentView(web);
    web.loadUrl("file:///android_asset/index.html");
  }

  public class Bridge {
    @JavascriptInterface public void saveProject(String project, String filename) {
      runOnUiThread(() -> {
        pendingProject = project;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, filename.replaceAll("[^a-zA-Z0-9_. -]", "_") + ".dsgmaker.json");
        startActivityForResult(intent, SAVE_PROJECT);
      });
    }
    @JavascriptInterface public void openProject() {
      runOnUiThread(() -> {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        startActivityForResult(intent, OPEN_PROJECT);
      });
    }
    @JavascriptInterface public void notifyUser(String message) {
      runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
    }
  }

  @Override protected void onActivityResult(int requestCode,int resultCode,Intent data) {
    super.onActivityResult(requestCode,resultCode,data);
    Uri uri = resultCode == RESULT_OK && data != null ? data.getData() : null;
    if (requestCode == CHOOSE_AUDIO) {
      if (fileCallback != null) { fileCallback.onReceiveValue(uri == null ? null : new Uri[]{uri}); fileCallback = null; }
    } else if (requestCode == SAVE_PROJECT && uri != null) {
      try(OutputStream out=getContentResolver().openOutputStream(uri)) {
        out.write(pendingProject.getBytes(StandardCharsets.UTF_8));
        Toast.makeText(this,"Project exported",Toast.LENGTH_SHORT).show();
      } catch(Exception e) {Toast.makeText(this,"Export failed: "+e.getMessage(),Toast.LENGTH_LONG).show();}
    } else if (requestCode == OPEN_PROJECT && uri != null) {
      try(InputStream in=getContentResolver().openInputStream(uri)) {
        byte[] bytes=new byte[0];
        java.io.ByteArrayOutputStream buf=new java.io.ByteArrayOutputStream();
        byte[] chunk=new byte[8192];int n;int total=0;
        while((n=in.read(chunk))!=-1){total+=n;if(total>10_000_000)throw new Exception("File is too large");buf.write(chunk,0,n);}
        String raw=buf.toString("UTF-8");
        String literal=org.json.JSONObject.quote(raw);
        web.evaluateJavascript("window.loadImportedProject("+literal+")",null);
      }catch(Exception e){Toast.makeText(this,"Import failed: "+e.getMessage(),Toast.LENGTH_LONG).show();}
    }
  }
  @Override public void onBackPressed(){web.evaluateJavascript("window.makerBack && window.makerBack()",null);}
  @Override public void onDestroy(){if(web!=null){web.destroy();web=null;}super.onDestroy();}
}
