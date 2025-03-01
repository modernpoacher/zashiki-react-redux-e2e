import debug from 'debug'

import puppeteer from 'puppeteer'

import {
  expect
} from 'chai'

const log = debug('zashiki/e2e')

log('`zashiki` is awake')

const getTextContent = ({ textContent = '' }) => textContent.trim()

/**
 * @param {puppeteer.Page} page
 * @returns {Promise<Location>}
 */
const getLocation = async (page) => await page.evaluate(() => location) // eslint-disable-line

/**
 * @param {puppeteer.Page} page
 * @returns {Promise<string>}
 */
const getLocationHref = async (page) => await page.evaluate(() => location.href) // eslint-disable-line

const EMBARK_GRACE = 500
const ROUTE_GRACE = 500
const DEBARK_GRACE = 500
const SUBMIT_GRACE = 1000

const EMBARK = 'https://localhost:5001/embark-stage'
const DEBARK = 'https://localhost:5001/debark-stage'
const CONFIRM = 'https://localhost:5001/confirm-stage'

describe('@modernpoacher/zashiki-react-redux/boolean', () => {
  /**
   *  @type {puppeteer.Browser}
   */
  let browser

  before(async () => { browser = await puppeteer.launch({ acceptInsecureCerts: true, headless: true }) })

  after(async () => await browser.close())

  describe('Embark', () => {
    /**
     *  @type {puppeteer.Page}
     */
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

  describe('Boolean', () => {
    /**
     *  @type {puppeteer.Page}
     */
    let page

    before(async () => {
      page = await browser.newPage()

      await page.goto(EMBARK, { waitUntil: 'load' })
      await page.waitForTimeout(EMBARK_GRACE)

      await page.screenshot({ path: '.screenshots/embark-boolean-1.png' })

      await page.evaluate(() => {
        const index = Array.from(document.querySelectorAll('.cog label .text-content'))
          .findIndex(({ textContent = '' }) => textContent.trim() === 'Boolean')

        const array = Array.from(document.querySelectorAll('.cog input[type="radio"]'))
        const radio = array[index]
        if (radio) {
          radio.scrollIntoView()
          radio.click()
        }
      })

      await page.screenshot({ path: '.screenshots/embark-boolean-2.png' })

      await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

      await page.click('form button[type="submit"]')
      await page.waitForSelector('.omega.resolved')

      await page.evaluate(() => { window.scrollTo(0, 0) })

      await page.screenshot({ path: '.screenshots/embark-boolean-3.png' })
    })

    describe('Boolean - Boolean', () => {
      const ROUTE = 'https://localhost:5001/boolean/boolean'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/boolean-1.png' })
      })

      after(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/boolean-7.png' })

        await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

        const input = await page.$('.cog input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog input[type="text"]', 'true')

        await page.screenshot({ path: '.screenshots/boolean-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        await page.waitForTimeout(SUBMIT_GRACE)

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/boolean-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Boolean'))

      it('Has a Boolean component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'true')

          await page.screenshot({ path: '.screenshots/boolean-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/boolean-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })

      describe('Input is invalid', () => {
        before(async () => {
          await page.goto(ROUTE, { waitUntil: 'load' })
          await page.waitForTimeout(ROUTE_GRACE)

          await page.screenshot({ path: '.screenshots/boolean-4.png' })

          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/boolean-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/boolean-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Boolean - Boolean (Enum)', () => {
      const ROUTE = 'https://localhost:5001/boolean/boolean-enum'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/boolean-enum-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Boolean (Enum)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="0"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="0"]')

          await page.screenshot({ path: '.screenshots/boolean-enum-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/boolean-enum-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Boolean - Boolean (Any Of)', () => {
      const ROUTE = 'https://localhost:5001/boolean/boolean-any-of'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/boolean-any-of-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Boolean (Any Of)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="0"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="0"]')

          await page.screenshot({ path: '.screenshots/boolean-any-of-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/boolean-any-of-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Boolean - Boolean (One Of)', () => {
      const ROUTE = 'https://localhost:5001/boolean/boolean-one-of'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/boolean-one-of-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Boolean (One Of)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="0"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="0"]')

          await page.screenshot({ path: '.screenshots/boolean-one-of-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/boolean-one-of-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Boolean - Boolean (All Of)', () => {
      const ROUTE = 'https://localhost:5001/boolean/boolean-all-of'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/boolean-all-of-1.png' })
      })

      after(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/boolean-all-of-7.png' })

        await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

        const input = await page.$('.cog input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog input[type="text"]', 'true')

        await page.screenshot({ path: '.screenshots/boolean-all-of-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        await page.waitForTimeout(SUBMIT_GRACE)

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/boolean-all-of-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Boolean (All Of)'))

      it('Has a Boolean component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'true')

          await page.screenshot({ path: '.screenshots/boolean-all-of-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/boolean-all-of-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })

      describe('Input is invalid', () => {
        before(async () => {
          await page.goto(ROUTE, { waitUntil: 'load' })
          await page.waitForTimeout(ROUTE_GRACE)

          await page.screenshot({ path: '.screenshots/boolean-all-of-4.png' })

          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/boolean-all-of-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          await page.waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/boolean-all-of-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Debark', () => {
      before(async () => {
        page = await browser.newPage()

        await page.goto(DEBARK, { waitUntil: 'load' })
        await page.waitForTimeout(DEBARK_GRACE)

        await page.screenshot({ path: '.screenshots/debark-boolean.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Debark'))

      it('Has a <button />', async () => expect(await page.$eval('form button[type="submit"]', getTextContent)).to.equal('Continue'))

      describe('Summary', () => {
        describe('Boolean - Boolean', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(1) h2', getTextContent)).to.equal('Boolean'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dt', getTextContent)).to.equal('Boolean')

            expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dd', getTextContent)).to.equal('true')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(1) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(1) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-boolean-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'false')

              await page.screenshot({ path: '.screenshots/summary-boolean-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-boolean-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(1) h2', getTextContent)).to.equal('Boolean'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dt', getTextContent)).to.equal('Boolean')

              expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dd', getTextContent)).to.equal('false')
            })
          })
        })

        describe('Boolean - Boolean (Enum)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(2) h2', getTextContent)).to.equal('Boolean (Enum)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dt', getTextContent)).to.equal('Boolean (Enum)')

            expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dd', getTextContent)).to.equal('true')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(2) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(2) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-boolean-enum-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="1"]').scrollIntoView() })

              await page.click('.cog input[type="radio"][value="1"]')

              await page.screenshot({ path: '.screenshots/summary-boolean-enum-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-boolean-enum-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(2) h2', getTextContent)).to.equal('Boolean (Enum)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dt', getTextContent)).to.equal('Boolean (Enum)')

              expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dd', getTextContent)).to.equal('false')
            })
          })
        })

        describe('Boolean - Boolean (Any Of)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(3) h2', getTextContent)).to.equal('Boolean (Any Of)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dt', getTextContent)).to.equal('Boolean (Any Of)')

            expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dd', getTextContent)).to.equal('True')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(3) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(3) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-boolean-any-of-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="1"]').scrollIntoView() })

              await page.click('.cog input[type="radio"][value="1"]')

              await page.screenshot({ path: '.screenshots/summary-boolean-any-of-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-boolean-any-of-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(3) h2', getTextContent)).to.equal('Boolean (Any Of)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dt', getTextContent)).to.equal('Boolean (Any Of)')

              expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dd', getTextContent)).to.equal('False')
            })
          })
        })

        describe('Boolean - Boolean (One Of)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(4) h2', getTextContent)).to.equal('Boolean (One Of)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dt', getTextContent)).to.equal('Boolean (One Of)')

            expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dd', getTextContent)).to.equal('True')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(4) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(4) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-boolean-one-of-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="1"]').scrollIntoView() })

              await page.click('.cog input[type="radio"][value="1"]')

              await page.screenshot({ path: '.screenshots/summary-boolean-one-of-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-boolean-one-of-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(4) h2', getTextContent)).to.equal('Boolean (One Of)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dt', getTextContent)).to.equal('Boolean (One Of)')

              expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dd', getTextContent)).to.equal('False')
            })
          })
        })

        describe('Boolean - Boolean (All Of)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(5) h2', getTextContent)).to.equal('Boolean (All Of)'))

          it('Has a <dl />', async () => { // TODO - "(All Of)"?
            expect(await page.$eval('.sprocket:nth-of-type(5) h2 + dl dt', getTextContent)).to.equal('Boolean') // (All Of)')

            expect(await page.$eval('.sprocket:nth-of-type(5) h2 + dl dd', getTextContent)).to.equal('true')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(5) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(5) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-boolean-all-of-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'false')

              await page.screenshot({ path: '.screenshots/summary-boolean-all-of-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-boolean-all-of-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(5) h2', getTextContent)).to.equal('Boolean (All Of)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(5) h2 + dl dt', getTextContent)).to.equal('Boolean')

              expect(await page.$eval('.sprocket:nth-of-type(5) h2 + dl dd', getTextContent)).to.equal('false')
            })
          })
        })

        describe('Submit', () => {
          before(async () => {
            await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

            await page.click('form button[type="submit"]')
            await page.waitForSelector('.confirm.resolved')

            await page.evaluate(() => { window.scrollTo(0, 0) })

            await page.screenshot({ path: '.screenshots/summary-boolean-confirm.png' })
          })

          it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(DEBARK))
        })
      })
    })

    describe('Confirm', () => {
      before(async () => {
        page = await browser.newPage()

        await page.goto(CONFIRM, { waitUntil: 'load' })

        await page.screenshot({ path: '.screenshots/confirm-boolean.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Confirm'))
    })
  })
})
