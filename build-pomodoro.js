const fs = require('fs')
const path = require('path')

const layers = path.join(__dirname, 'layers')
const template = fs.readFileSync(path.join(__dirname, 'pomodoro-template.html'), 'utf8')

const files = ['layer1_sky','layer2_mountains','layer3_trees','layer4_ruins','layer5_ground']

let out = template
for (let i = 0; i < files.length; i++) {
  const b64 = fs.readFileSync(path.join(layers, files[i] + '.b64'), 'utf8').replace(/\s/g,'')
  out = out.replace(`'__LAYER${i+1}__'`, `'${b64}'`)
  process.stdout.write(`Injected layer ${i+1} (${Math.round(b64.length/1024)}KB)\n`)
}

fs.writeFileSync(path.join(__dirname, 'pomodoro-quest.html'), out)
console.log('Done → pomodoro-quest.html')
