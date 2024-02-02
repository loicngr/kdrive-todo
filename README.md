# kDrive to-do list
- Manage your to-do lists in a simplified interface.
- The application connects to your [Informaniak kDrive](https://kdrive.infomaniak.com) kDrive via webDAV.


![demo](demo.gif)

## Env
- The default folder is `WebDAVJS`, please create it at the root of your kDrive.

## File structure
Default file template: `{"todos": []}`

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn lint
# or
npm run lint
```

### Format the files
```bash
yarn format
# or
npm run format
```


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## TODO
- [ ] Make all in the box version for no developer (PWA?)
- [ ] Go in folder
- [ ] Cache issue with webdav on file load (![chrome-cache.png](chrome-cache.png))

## Links
- https://www.infomaniak.com/fr/support/faq/2409/se-connecter-a-kdrive-via-webdav
