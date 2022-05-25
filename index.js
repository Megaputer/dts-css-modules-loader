// @ts-check
const fs = require('fs');
const fp = require('path');
const schema = require("./options.json");

/**
 * @template T
 * @typedef {Object} LoaderOptions<T>
 * @type {{
 *    banner?: string,
 *    namedExport?: boolean,
 *    customTypings?: (classes: string[]) => string,
 *    dropEmptyFile?: boolean
 * }}
 * @property {string} [severityError] Allows to choose how errors are displayed.
 */

/**
 * @template T
 * @this {import("webpack").LoaderContext<LoaderOptions<T>>}
 * @param {Buffer} content
 */
module.exports = function (content) {
  this.cacheable && this.cacheable();

  /**
   * @type {{
   *   banner?: string,
   *   namedExport?: boolean,
   *   customTypings?: (classes: string[]) => string,
   *   dropEmptyFile?: boolean
   * }}
   */
  const options = this.getOptions(schema) || {};
  const callback = this.async();

  const classes = getClasses(content);
  const dtsPath = getDtsPath(this.resourcePath);

  if (options.dropEmptyFile && classes.length === 0) {
    if (fs.existsSync(dtsPath)) {
      fs.rmSync(dtsPath);
    }
  } else {
    let typings = options.banner ? `${options.banner}\n` : '';

    if (options.customTypings) {
      typings = options.customTypings(classes);
    } else if (options.namedExport) {
      for (let c of classes) {
        typings += `export const ${c}: string;\n`;
      }
    } else {
      const i = getInterfaceName(this.resourcePath);
      typings += `export interface ${i} {\n`;
      for (let c of classes) {
        typings += `  '${c}': string;\n`;
      }
      typings += `}\ndeclare const styles: ${i};\nexport = styles;\n`;
    }

    if (!fs.existsSync(dtsPath) || fs.readFileSync(dtsPath, "utf-8") != typings) {
      fs.writeFileSync(dtsPath, typings, "utf8");
    }
  }

  callback(null, content);
};

/**
 * @param {string | Buffer} [content]
 */
function getClasses(content) {
  if (Buffer.isBuffer(content)) {
    content = content.toString('utf8');
  }

  /** @type {string[]} */
  let classes = [];
  let isCssLoaderNamedExport = false;

  // check v4 / v5
  let from = content.indexOf('___CSS_LOADER_EXPORT___.locals = {');
  if (from === -1) {
    // >= v5.2.5
    from = content.indexOf('export var ');
    if (from === -1) {
      // < v5.2.5
      from = content.indexOf('export const ');
    }
    isCssLoaderNamedExport = from !== -1;
  }
  // check v3
  if (from === -1) {
    // when `onlyLocals` is on
    from = content.indexOf('module.exports = {');
  }
  if (from === -1) {
    // when `onlyLocals` is off
    from = content.indexOf('exports.locals = {');
  }

  if (~from) {
    content = content.slice(from);

    /** @type {RegExpExecArray} */
    let match;
    const regex = isCssLoaderNamedExport ? classesOfNamedExportRegex : classesRegex;
    while ((match = regex.exec(content))) {
      if (classes.indexOf(match[1]) === -1) {
        classes.push(match[1]);
      }
    }
  }

  return classes;
}

const classesRegex = /"([^"\\/;()\n]+)":/g;
const classesOfNamedExportRegex = /export (?:var|const) (\w+) =/g;

/**
 * @param {string} [path]
 */
function getDtsPath(path) {
  return fp.join(fp.dirname(path), `${fp.basename(path)}.d.ts`);
}

/**
 * @param {string} [path]
 */
function getInterfaceName(path) {
  return fp
    .basename(path)
    .replace(/^(\w)/, (_, c) => 'I' + c.toUpperCase())
    .replace(/\W+(\w)/g, (_, c) => c.toUpperCase());
}
