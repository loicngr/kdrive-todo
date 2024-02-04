# Capacitor build

- quasar build -m capacitor -T android
- $ANDROID_HOME/build-tools/30.0.3/zipalign -v 4 ./dist/capacitor/android/apk/release/app-release-unsigned.apk kDriveNotes.apk
- $ANDROID_HOME/build-tools/30.0.3/apksigner sign --ks my-release-key.keystore --ks-key-alias alias_name kDriveNotes.apk
