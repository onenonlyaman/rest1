import fs from 'fs'

const raw = fs.readFileSync('public/heropattern.svg', 'utf8')
console.log('File size:', raw.length)
console.log('Has rect:', raw.includes('<rect'))
console.log('Path count:', (raw.match(/<path/g) || []).length)

// Let's create a transparent version where rect is removed and colors can be currentColor or original
const transparent = raw.replace(/<g id="Layer_6">[\s\S]*?<\/g>/, '')
fs.writeFileSync('public/heropattern-transparent.svg', transparent)

// Let's also create currentColor versions for cream and kara
const currentColorVersion = transparent.replace(/fill:#FAAF5E;/g, 'fill:currentColor;')
fs.writeFileSync('public/heropattern-currentColor.svg', currentColorVersion)

console.log('Generated heropattern-transparent.svg and heropattern-currentColor.svg successfully!')
