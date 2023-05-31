import debug from 'debug'

import puppeteer from 'puppeteer'

import {
  expect
} from 'chai'

const log = debug('zashiki/e2e')

log('`zashiki` is awake')

const getTextContent = ({ textContent = '' }) => textContent.trim()

const getLocation = async (page) => page.evaluate(() => location) // eslint-disable-line

const getLocationHref = async (page) => page.evaluate(() => location.href) // eslint-disable-line

const EMBARK_GRACE = 500
const ROUTE_GRACE = 500
const DEBARK_GRACE = 500
const SUBMIT_GRACE = 1000

const EMBARK = 'https://localhost:5001/embark-stage'
const DEBARK = 'https://localhost:5001/debark-stage'
const CONFIRM = 'https://localhost:5001/confirm-stage'

describe('@modernpoacher/zashiki-react-redux/string', () => {
  before(() => {
    const {
      env: {
        DEBUG
      }
    } = process

    if (DEBUG) debug.enable(DEBUG)
  })

  let browser

  before(async () => { browser = await puppeteer.launch({ ignoreHTTPSErrors: true }) })

  after(async () => await browser.close())

  describe('Embark', () => {
    let page

    before(async () => {
      page = await browser.newPage()

      await page.goto(EMBARK, { waitUntil: 'load' })
      await page.waitForTimeout(EMBARK_GRACE)
    })

    it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Embark'))

    it('Has a <button />', async () => expect(await page.$eval('form button[type="submit"]', getTextContent)).to.equal('Continue'))

    describe('Zashiki', () => {
      it('Has a <legend />', async () => {
        expect(await page.$eval('body form fieldset > legend', getTextContent)).to.equal('Schema for Collections')
      })

      it('Has a <legend />', async () => {
        expect(await page.$eval('body form fieldset fieldset > legend', getTextContent)).to.equal('Collection')
      })

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })
    })
  })

  describe('String', () => {
    let page

    before(async () => {
      page = await browser.newPage()

      await page.goto(EMBARK, { waitUntil: 'load' })
      await page.waitForTimeout(EMBARK_GRACE)

      await page.screenshot({ path: '.screenshots/embark-string-1.png' })

      await page.evaluate(() => {
        const index = Array.from(document.querySelectorAll('.cog label .text-content'))
          .findIndex(({ textContent = '' }) => textContent.trim() === 'String')

        const array = Array.from(document.querySelectorAll('.cog input[type="radio"]'))
        const radio = array[index]
        if (radio) {
          radio.scrollIntoView()
          radio.click()
        }
      })

      await page.screenshot({ path: '.screenshots/embark-string-2.png' })

      await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

      await page.click('form button[type="submit"]')
      await page.waitForSelector('.omega.resolved')

      await page.evaluate(() => { window.scrollTo(0, 0) })

      await page.screenshot({ path: '.screenshots/embark-string-3.png' })
    })

    describe('String - String', () => {
      const ROUTE = 'https://localhost:5001/string/string'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/string-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('String'))

      it('Has a String component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/string-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/string-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('String - String (Enum)', () => {
      const ROUTE = 'https://localhost:5001/string/string-enum'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/string-enum-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('String (Enum)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/string-enum-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/string-enum-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('String - String (Any Of)', () => {
      const ROUTE = 'https://localhost:5001/string/string-any-of'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/string-any-of-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('String (Any Of)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/string-any-of-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/string-any-of-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('String - String (One Of)', () => {
      const ROUTE = 'https://localhost:5001/string/string-one-of'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/string-one-of-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('String (One Of)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/string-one-of-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/string-one-of-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('String - String (All Of)', () => {
      const ROUTE = 'https://localhost:5001/string/string-all-of'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/string-all-of-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('String (All Of)'))

      it('Has a String component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/string-all-of-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/string-all-of-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Debark', () => {
      before(async () => {
        page = await browser.newPage()

        await page.goto(DEBARK, { waitUntil: 'load' })
        await page.waitForTimeout(DEBARK_GRACE)

        await page.screenshot({ path: '.screenshots/debark-string.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Debark'))

      it('Has a <button />', async () => expect(await page.$eval('form button[type="submit"]', getTextContent)).to.equal('Continue'))

      describe('Summary', () => {
        describe('String - String', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(1) h2', getTextContent)).to.equal('String'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dt', getTextContent)).to.equal('String')

            expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dd', getTextContent)).to.equal('string')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(1) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(1) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-string-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'change')

              await page.screenshot({ path: '.screenshots/summary-string-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-string-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(1) h2', getTextContent)).to.equal('String'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dt', getTextContent)).to.equal('String')

              expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dd', getTextContent)).to.equal('change')
            })
          })
        })

        describe('String - String (Enum)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(2) h2', getTextContent)).to.equal('String (Enum)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dt', getTextContent)).to.equal('String (Enum)')

            expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dd', getTextContent)).to.equal('Two')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(2) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(2) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-string-enum-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="2"]').scrollIntoView() })

              await page.click('.cog input[type="radio"][value="2"]')

              await page.screenshot({ path: '.screenshots/summary-string-enum-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-string-enum-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(2) h2', getTextContent)).to.equal('String (Enum)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dt', getTextContent)).to.equal('String (Enum)')

              expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dd', getTextContent)).to.equal('Three')
            })
          })
        })

        describe('String - String (Any Of)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(3) h2', getTextContent)).to.equal('String (Any Of)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dt', getTextContent)).to.equal('String (Any Of)')

            expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dd', getTextContent)).to.equal('Two')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(3) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(3) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-string-any-of-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="2"]').scrollIntoView() })

              await page.click('.cog input[type="radio"][value="2"]')

              await page.screenshot({ path: '.screenshots/summary-string-any-of-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-string-any-of-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(3) h2', getTextContent)).to.equal('String (Any Of)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dt', getTextContent)).to.equal('String (Any Of)')

              expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dd', getTextContent)).to.equal('Three')
            })
          })
        })

        describe('String - String (One Of)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(4) h2', getTextContent)).to.equal('String (One Of)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dt', getTextContent)).to.equal('String (One Of)')

            expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dd', getTextContent)).to.equal('Two')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(4) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(4) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-string-one-of-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="2"]').scrollIntoView() })

              await page.click('.cog input[type="radio"][value="2"]')

              await page.screenshot({ path: '.screenshots/summary-string-one-of-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-string-one-of-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(4) h2', getTextContent)).to.equal('String (One Of)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dt', getTextContent)).to.equal('String (One Of)')

              expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dd', getTextContent)).to.equal('Three')
            })
          })
        })

        describe('String - String (All Of)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(5) h2', getTextContent)).to.equal('String (All Of)'))

          it('Has a <dl />', async () => { // TODO - "(All Of)"?
            expect(await page.$eval('.sprocket:nth-of-type(5) h2 + dl dt', getTextContent)).to.equal('String') // (All Of)')

            expect(await page.$eval('.sprocket:nth-of-type(5) h2 + dl dd', getTextContent)).to.equal('string')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(5) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(5) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-string-all-of-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'change')

              await page.screenshot({ path: '.screenshots/summary-string-all-of-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-string-all-of-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(5) h2', getTextContent)).to.equal('String (All Of)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(5) h2 + dl dt', getTextContent)).to.equal('String')

              expect(await page.$eval('.sprocket:nth-of-type(5) h2 + dl dd', getTextContent)).to.equal('change')
            })
          })
        })

        describe('Submit', () => {
          before(async () => {
            await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

            await page.click('form button[type="submit"]')
            await page.waitForSelector('.confirm.resolved')

            await page.evaluate(() => { window.scrollTo(0, 0) })

            await page.screenshot({ path: '.screenshots/summary-string-confirm.png' })
          })

          it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(DEBARK))
        })
      })
    })

    describe('Confirm', () => {
      before(async () => {
        page = await browser.newPage()

        await page.goto(CONFIRM, { waitUntil: 'load' })

        await page.screenshot({ path: '.screenshots/confirm-string.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Confirm'))
    })
  })
})
