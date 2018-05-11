const cheerio = require('cheerio')

function parseChapter(html, objToFill) {
  const $ = cheerio.load(html)
  const text = $('.verses').find('li').text().trim()
  if (!text) return false

  const verses = text.match(/".*"/)[0].replace(/"$/, '')

  let book, chapterNumber
  [book, chapterNumber] = text.split(/\s|:/).slice(0, 2)

  if (!objToFill[book]) objToFill[book] = {}
  if (!objToFill[book][chapterNumber]) objToFill[book][chapterNumber] = {}

  fillChapter(objToFill[book][chapterNumber], verses)
  return true
}

function fillChapter(chapter, text) {
  text
    .match(/\(\d+\)[^(\(\d+\))]*/g)
    .map(verse => [verseNumber(verse), verseContent(verse)])
    .forEach(([verseNumber, verseContent]) => chapter[verseNumber] = verseContent)
}

function verseNumber(verse) {
  return verse.match(/\d+(?=\))/)[0]
}

function verseContent(verse) {
  return verse.replace(/\(\d+\)/, '').trim()
}

module.exports = parseChapter
