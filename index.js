// const MD = require('markdown-it')
// const md = new MD({
//   html: true
// })
// const fs = require('fs')
// const profile = fs.readFileSync('./profile.md', 'utf-8')
// const html = md.render(profile)
// const express = require('express')
// const app = express()

// console.log(html)

// app.use('*', (req, res) => {
//   res.send(html)
// })

// app.listen('8080', () => {
//   console.log('start in localhost:8080')
// })

// // const pdf = require('html-pdf')

// // pdf.create(html, {
// //   format: 'A4'
// // }).toFile('./profile.pdf', (err, result) => {
// //   if (err) {
// //     return console.error(err)
// //   }
// //   console.log(result)
// // })

// const htmlPdf = require('html-pdf-chrome')

// const options = {
//   // port: 9222, // port Chrome is listening on
// };

// htmlPdf.create(html, options).then(pdf => pdf.toFile('./profile.pdf'))


// function p () {
//   setTimeout(() => {
//     console.log('settimeout 0')
//   }, 0)
//   window.requestAnimationFrame(() => {
//     console.log('request')
//   })
//   setTimeout(() => {
//     console.log('settimeout 0')
//   }, 0)
//   setTimeout(() => {
//     console.log('settimeout 17')
//   }, 17)
// }


// function bind (context, ...args) {
//   const fn = this
//   return function (..._args) {
//     return fn.call(context, ...args, ..._args)
//   }
// }


// c.bind(_this, ...[1])


























const data = [{
  id: 'a',
  parent: 'b'
}, {
  id: 'b',
  parent: 'c'
}, {
  id: 'c',
  parent: 'd'
}, {
  id: 'd',
  parent: null
}, {
  id: 'e',
  parent: 'd'
}]


var dataMap = {};
data.forEach(function(node) {
  dataMap[node.id] = node
})
var tree = [];
data.forEach(function(node) {
    // find parent
    var parent = dataMap[node.parent];
    if (parent) {
        // create child array if it doesn't exist
        (parent.children || (parent.children = []))
            // add node to parent's child array
            .push(node);
    } else {
        // parent is null or missing
        tree.push(node);
    }
});

console.log(tree)

function toLine(data){
  return data.reduce((arr, {id, value, pid, children = []}) =>
      arr.concat([{id, value, pid}], toLine(children)), [])
    return result;
}
var listarr=toLine(data);
console.log(listarr);

























/**
 * @param {string} S
 * @return {number}
 */
var longestRepeatingSubstring = function(S) {
    return binarySearch(S)
};

function binarySearch (S) {
    let left = 0;
    let right = S.length - 1
    let len = S.length
    let ans = ''
    while (left <= right) {
      console.log(left, right)
        let mid = Math.floor((left + right) / 2)
        const str = hasStr(S, mid)
        if (str) {
            left = mid + 1
            if (str.length > ans.length) {
                ans = str
            }
        } else {
            right = mid - 1
        }
    }
    return ans.length
}

function hasStr (S, l) {
  console.log(S, l)
    for (let i = 0; i < S.length - l; i++) {
        const str = S.substr(i, l)
        for (let j = i + 1; j < S.length - l; j++) {
          const _str = S.substr(j, l)
          console.log(S, l, str, _str)
          if (_str === str) {
            return str
          }
        }
    }
    return ''
}


longestRepeatingSubstring("aaaaa")
