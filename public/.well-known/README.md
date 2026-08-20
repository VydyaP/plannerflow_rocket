# Digital Asset Links — fill in after Bubblewrap init

`assetlinks.json` in this folder is a **placeholder**. It must be updated with real
values before the Android TWA app can run without a browser address bar, or before
submitting to the Play Store.

## How to fill it in

1. Run `bubblewrap init --manifest=<your-live-site-url>/manifest.webmanifest`. This
   generates an Android project and a signing keystore (`android.keystore` by
   default).
2. Get the SHA-256 certificate fingerprint from that keystore:
   ```
   keytool -list -v -keystore android.keystore -alias android -storepass <password> -keypass <password>
   ```
   Copy the `SHA256:` value (colon-separated hex, e.g. `14:6D:E9:83:...`).
3. Replace the two placeholder values in `assetlinks.json`:
   - `package_name` → the Android package name you chose during `bubblewrap init`
     (e.g. `com.plannerflow.app`)
   - `sha256_cert_fingerprints` → the fingerprint from step 2 (as an array with one
     string)
4. Redeploy the site so `https://<your-domain>/.well-known/assetlinks.json` serves
   the updated file.
5. Verify with `bubblewrap validate` or Google's asset-link checker before
   submitting to Play Store.

Delete this README once the real file is deployed — it's just a note for the
Play Store setup, not part of the app.
