const atwrap = require('../index.js');
const postcss = require('postcss');

const path = require('path');
const fs = require('fs');

const srcPath = path.join(__dirname, './stylesheets/source/wrap-nodes-in-atrule.css');
const destPath = path.join(__dirname, './stylesheets/output/wrap-nodes-in-atrule.css');
const mapPath = destPath + '.map';

console.log(atwrap);

fs.readFile(path.join(__dirname, './stylesheets/source/wrap-nodes-in-atrule.css'), (err, css) => {
  postcss([atwrap])
    .process(css, { from: srcPath, to: destPath })
    .then(result => {
      // fs.writeFile(destPath, result.css, () => true);
      // if (result.map) {
      //   fs.writeFile(mapPath, result.map, () => true);
      // }

      console.log(result.css);
    });
});