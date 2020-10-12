// @ts-check
const fs = require('fs');
const fp = require('path');
const loaderUtils = require('loader-utils');

/** @type {import('webpack').loader.Loader} */
module.exports = function(content) {
  this.cacheable && this.cacheable();

  /** @type {{ banner?: string, namedExport?: boolean, customTypings?: (classes: string[]) => string }} */
  const options = loaderUtils.getOptions(this) || {};
  const callback = this.async();

  let typings = '';

  if (options.banner) {
    typings = `${options.banner}\n`;
  }

  {
    const classes = getClasses(content);
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
  }

  fs.writeFileSync(getDtsPath(this.resourcePath), typings);

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
  let isCssLoader4NamedExport = false;

  // check v4
  let from = content.indexOf('___CSS_LOADER_EXPORT___.locals = {');
  if (from === -1) {
    from = content.indexOf('export const ');
    isCssLoader4NamedExport = from !== -1;
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
    content = content.substr(from);

    /** @type {RegExpExecArray} */
    let match;
    const regex = isCssLoader4NamedExport ? classesOfNamedExportRegex : classesRegex;
    while (match = regex.exec(content)) {
      if (classes.indexOf(match[1]) === -1) {
        classes.push(match[1]);
      }
    }
  }

  return classes;
}

const classesRegex = /"([^"\\/;()\n]+)":/g;
const classesOfNamedExportRegex = /export const (\w+) =/g;

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
  return fp.basename(path)
    .replace(/^(\w)/, (_, c) => 'I' + c.toUpperCase())
    .replace(/\W+(\w)/g, (_, c) => c.toUpperCase());
}
