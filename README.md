# Manage your to-do list from a dedicated [kDrive](https://kdrive.infomaniak.com) interface through webdav

## Env
- Create `.env.local` file at root and set your variables.
- The default folder is `webdav_js`, please create it at the root of your kDrive.

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

### TODO
- [ ] Make all in the box version for no developer (PWA?)
- [ ] Cache issue with webdav on file load (![chrome-cache.png](chrome-cache.png))
