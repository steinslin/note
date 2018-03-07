const MD = require('markdown-it')
const md = new MD({
  html: true
})
const fs = require('fs')
const profile = fs.readFileSync('./profile.md', 'utf-8')
const html = md.render(profile)
const express = require('express')
const app = express()

console.log(html)

app.use('*', (req, res) => {
  res.send(html)
})

app.listen('8080', () => {
  console.log('start in localhost:8080')
})

// const pdf = require('html-pdf')

// pdf.create(html, {
//   format: 'A4'
// }).toFile('./profile.pdf', (err, result) => {
//   if (err) {
//     return console.error(err)
//   }
//   console.log(result)
// })

const htmlPdf = require('html-pdf-chrome')

const options = {
  // port: 9222, // port Chrome is listening on
};

htmlPdf.create(html, options).then(pdf => pdf.toFile('./profile.pdf'))
