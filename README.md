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
      loader: 'dts-css-modules-loader',
      options: {
        banner: "// This file is generated automatically"
      }
    },
    {
      loader: 'css-loader',
      options: {
        modules: true, // enable the CSS Modules
        exportOnlyLocals: true // export class names as variables
        camelCase: 'only', // generate valid name of variables
        localIdentName: '[local]',
      }
    },
    'sass-loader'
  ]
}
```

## Options
### `banner`
Adds a "banner" prefix to each generated file.

## css-loader
As loader uses output of `css-loader`, generated typings depends on it's options.

When [exportOnlyLocals](https://github.com/webpack-contrib/css-loader#exportonlylocals) is on, class names exported as variables:
```ts
export const button: string;
export const buttonActive: string;
```
Be sure you using [camelCase](https://github.com/webpack-contrib/css-loader#camelcase) to avoid invalid name of variables.

When option is off, will be generated following typings:
```ts
export interface I_buttonScss {
  'paButton': string;
  'paButtonActive': string;
}
export const locals: I_buttonScss;
```

## Usage in Typescript

With `exportOnlyLocals`:
```ts
import * as classes from './_button.scss';
```

Without:
```ts
import { locals as classes } from './_button.scss';
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
When you add new class name, Typescript compiler may not find the generated variable so you need to compile twice your files.

## License
Licensed under the MIT license.
