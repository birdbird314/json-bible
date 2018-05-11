const parseChapter = require('./parse-chapter')
const books = require('./books')
const decapitalizeKeys = require('./decapitalize-keys.js')
const request = require('superagent')
const Throttle = require('superagent-throttle')
const fs = require('fs');

const translation = process.argv[2] ? process.argv[2] : 'kjv'
const lowercaseBookNames = true

const startTime = Date.now()

let throttle = new Throttle({
  active: true,     // set false to pause queue
  rate: 9,          // how many requests can be sent every `ratePer`
  ratePer: 10000,   // number of ms in which `rate` requests may be sent
  concurrent: 2     // how many requests can be sent concurrently
})

let parsed = {}
let promises = []

books.forEach(book => fetchAndParseBook(book.abbrev, book.numberOfChapters))

Promise.all(promises).then(() => {
  const endTime = Date.now()
  console.log(`[DONE] All chapters fetched in ${time(endTime - startTime)}`);
  console.log(`[I] Writing contents to ubg.json file`);

  if (lowercaseBookNames) parsed = decapitalizeKeys(parsed)

  fs.writeFile(`${translation}.json`, JSON.stringify(parsed), (err, data) => {
      if (err) console.log(err);
      console.log("[DONE] Successfully Written to File.");
  });
})

function fetchAndParseBook(bookAbbreviation, numberOfChapters) {
  for (let currChapter = 1; currChapter <= numberOfChapters; currChapter++) {
    console.log(`[I] Trying to fetch'n'parse chapter ${currChapter} from ${bookAbbreviation}`);
    promises.push(new Promise((resolve, reject) => {
      request
        .get('https://biblia.apologetyka.com/read')
        .query({
          q: `${bookAbbreviation} ${currChapter}:1-1000`,
          bible: translation
        })
        .use(throttle.plugin())
        .end((err, res) => {
          if (err) console.log(`[ERROR] Failed to parse ${bookAbbreviation} chapter ${currChapter} due to error:\n${err}`);
          const success = parseChapter(res.res.text, parsed)
          console.log(success ? `[I] Parsed chapter ${currChapter} from ${bookAbbreviation}` : `[I] Chapter ${currChapter} from ${bookAbbreviation} was empty`)
          resolve()
        })
    }))
  }
}

function time(ms) {
    return new Date(ms).toISOString().slice(11, -1);
}
