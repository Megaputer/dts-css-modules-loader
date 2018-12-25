# typed-css-modules-loader
Replacement for the [typings-for-css-modules-loader](https://github.com/Jimdo/typings-for-css-modules-loader). This loader does not make any changes in content of styles, just creates `*.d.ts` file during the work. It is assumed that the content will be preprocessed first by [css-loader](https://github.com/webpack-contrib/css-loader).

# Installation

```
npm i -DE Megaputer/typed-css-modules-loader
```
or
```
yarn add -DE Megaputer/typed-css-modules-loader
```

# Usage

```js
{
  test: /\.scss$/,
  use: [
    {
      loader: 'typed-css-modules-loader',
      options: {
        namedExport: true,
        banner: "// This file is generated automatically."
      }
    },
    {
      loader: 'css-loader',
      options: {
        modules: true,
        camelCase: 'only',
        localIdentName: '[local]',
        exportOnlyLocals: true
      }
    },
    'sass-loader'
  ]
}
```

# Options
## `namedExport`
When the option is switched on classes exported as variables. Be sure you using `camelCase` option of [css-loader](https://github.com/webpack-contrib/css-loader) to avoid invalid name of variables.

```ts
// This file is generated automatically.
export const button: string;
export const buttonActive: string;
```

When option is off:
```ts
// This file is generated automatically.
export interface I_buttonScss {
  'button': string
  'buttonActive': string
}
declare const styles: I_buttonScss;
export default styles;
```

## `banner`
Adds a "banner" prefix to each generated file.

# License
Licensed under the MIT license.