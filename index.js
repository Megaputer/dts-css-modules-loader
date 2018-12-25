// @ts-check
const fs = require('fs');
const fp = require('path');
const loaderUtils = require('loader-utils');

/** @type {import('webpack').loader.Loader} */
module.exports = function(content) {
  this.cacheable();
  const callback = this.async();
  const options = loaderUtils.getOptions(this);
  genTypings(this.resourcePath, content, options, callback);
};

/**
 * @param {string} [path]
 * @param {string | Buffer} [content]
 * @param {import('loader-utils').OptionObject} [options]
 * @param {import('webpack').loader.loaderCallback} [callback]
 */
function genTypings(path, content, options, callback) {
  if (Buffer.isBuffer(content)) {
    content = content.toString('utf8');
  }

  /** @type {string[]} */
  let classes = [];
  {
    /** @type {RegExpExecArray} */
    let match;
    while (match = classesRegex.exec(content)) {
      if (classes.indexOf(match[1]) === -1) {
        classes.push(match[1]);
      }
    }
  }

  let typings = '';
  {
    if (options.banner) {
      typings = `${options.banner}\n`;
    }
    if (options.namedExport) {
      for (let c of classes) {
        typings += `export const ${c}: string;\n`;
      }
    } else {
      const name = getInterfaceName(path);
      typings += `export interface ${name} {\n`;
      for (let c of classes) {
        typings += `  '${c}': string\n`;
      }
      typings += `}\ndeclare const styles: ${name};\nexport default styles;\n`;
    }
  }
  writeFile(getDtsPath(path), typings);

  callback(null, content);
}

const classesRegex = /"([^"\\]+)":/g;

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

/**
 * @param {string} [path]
 * @param {string} [content]
 */
function writeFile(path, content) {
  if (!fs.existsSync(path) || fs.readFileSync(path).toString('utf8') !== content) {
    fs.writeFileSync(path, content);
  }
}
