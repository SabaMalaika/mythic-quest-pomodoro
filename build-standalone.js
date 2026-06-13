// Builds a self-contained single-file HTML from the project source.
// Inlines all CSS, JS (as concatenated classic scripts), and layer images as base64.
// Output: dist/index.html

const fs   = require('fs')
const path = require('path')

const ROOT     = __dirname
const DIST     = path.join(ROOT, 'dist')
const LAYERS   = path.join(ROOT, 'src', 'layers')
const TEMPLATE = path.join(ROOT, 'pomodoro-template.html')

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST)

let html = fs.readFileSync(TEMPLATE, 'utf8')

const files = ['layer1_sky','layer2_mountains','layer3_trees','layer4_ruins','layer5_ground']
for (let i = 0; i < files.length; i++) {
  const b64 = fs.readFileSync(path.join(LAYERS, files[i] + '.png'))
               .toString('base64')
  html = html.replace(`'__LAYER${i+1}__'`, `'${b64}'`)
  process.stdout.write(`Injected ${files[i]} (${Math.round(b64.length/1024)}KB)\n`)
}

fs.writeFileSync(path.join(DIST, 'index.html'), html)
console.log('Done → dist/index.html')
