const MD = require('markdown-it')
const md = new MD()
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
