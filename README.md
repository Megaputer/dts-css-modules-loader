# dts-css-modules-loader
Replacement for the [typings-for-css-modules-loader](https://github.com/Jimdo/typings-for-css-modules-loader). This loader does not make any changes in content of styles, just creates `*.d.ts` file during the work. It is assumed that the content will be preprocessed first by [css-loader](https://github.com/webpack-contrib/css-loader).

## Installation
```bash
npm i -D dts-css-modules-loader
# or
yarn add -D dts-css-modules-loader
```

## Usage
```js
{
  test: /\.scss$/,
  use: [
    {
      loader: 'style-loader',
      options: {
        esModule: false,
      },
    },
    {
      loader: 'dts-css-modules-loader',
      options: {
        namedExport: true
      }
    },
    {
      loader: 'css-loader',
      options: {
        // options for the v5 of css-loader
        modules: {
          exportLocalsConvention: 'camelCaseOnly',
          localIdentName: '[local]'
        }
      }
    },
    'sass-loader'
  ]
}
```

## Options
### `namedExport`
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
export = styles;
```

### `banner`
Adds a "banner" prefix to each generated file.

### `customTypings`
A function that accepts classes (an array of string) and returns the content of declaration file:
```js
customTypings: classes => {
  let content = '// This file is generated automatically\ndeclare const styles: {\n';
  for (const c of classes) {
    content += `  ${c}: string;\n`;
  }
  content += '};\nexport default styles;\n';
  return content;
}
```
`namedExport` and `banner` option will be ignored

### `dropEmptyFile`
If there are no classes, the typings file will not be generated, and the existing will be deleted.

## Usage in Typescript
```ts
import * as styles from './_button.scss';
```

To avoid errors about the absent module, you need to determine this:
```ts
/**
 * Trap for `*.scss.d.ts` files which are not generated yet.
 */
declare module '*.scss' {
  var classes: any;
  export = classes;
}
```
When you add new classname Typescript compiler may not find the generated variable so you need to compile twice your files.

## License
Licensed under the MIT license.
