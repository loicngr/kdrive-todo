# kDrive to-do list
- Manage your to-do lists in a simplified interface.
- The application connects to your [Infomaniak kDrive](https://kdrive.infomaniak.com) via webDAV.

# [How to setup and use](https://kdrive.infomaniak.com/app/share/107082/2c0bee21-2771-4400-9194-a146b85b138e)
# [How to install on PC and Phone](doc/PWA.md)

## Setup infos
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

## Links
- https://kdrive-notes.netlify.app
- https://www.infomaniak.com/fr/support/faq/2409/se-connecter-a-kdrive-via-webdav
