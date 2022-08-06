# Contributing Guide

This is a static snapshot of a university project.

## Prerequisites

- [Node 16 or greater](https://nodejs.org/en/). Don't install Chocolatey.
- A code editor (see below)

## Setup

1. Clone the repository
2. `npm install`
3. `npm run dev`

## Recommended Tooling

I recommend using [Visual Studio Code](https://code.visualstudio.com/) with

- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to format your files
- Settings &rarr; Format On Save &rarr; Enable (`"editor.formatOnSave": true,`)
  - If you are using autosave: Settings &rarr; Autosave &rarr; On Focus Change (`"files.autoSave": "onFocusChange",`)
- [Vue Language Features (Volar) Extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar) for Vue.js
- [TypeScript Vue Plugin (Volar) Extension](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) for Vue.js
- [Eslint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) to automatically show lots of little warnings
- [Tailwind CSS](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) to get nice Tailwind support
- [(optional)Auto Import Extension](https://marketplace.visualstudio.com/items?itemName=steoates.autoimport) to easily import files
- [(optional)Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) to see all the errors inline with the code
- [(optional)TODO Highlight Extension](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight)

I also totally recommend using a decent browser such as Firefox or a Chromium browser with

- [Vue Devtools](https://devtools.vuejs.org/) to get top-notch debugging support

## Used Libraries

The most important ones are

- [Typescript](https://www.typescriptlang.org/) - Typesafe Javascript
- [Vue 3](https://github.com/vuejs/vue-next/) - Vue 3 with [the composition API](https://vuejs.org/guide/extras/composition-api-faq.html#what-is-composition-api)
- [Tailwind CSS](https://tailwindcss.com/) - tons of CSS utility classes 

We are also using

- [Vite](https://github.com/vuejs/vite) - a speedy Vue.js framework
- `vue-toastification`
- `vue-router` - see `router/index.ts` for the defined URL routes
- `ky` - for making REST requests
- `pinia` - our central store
- `jspdf-invoice-template` - to quickly create invoices from JSON
- `date-fns` - utility functions for working with dates until the [Temporal API finally gets released](https://github.com/tc39/proposal-temporal/issues/1450)
- `vuelidate` - for validating forms
- `heroicons` - for pretty icons

For more, check out the `package.json`
