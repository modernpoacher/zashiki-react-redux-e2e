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
const getLocationHref = async (page) => await page.evaluate(() => location.href)

const EMBARK = 'https://localhost:5001/embark-stage'
const DEBARK = 'https://localhost:5001/debark-stage'
const CONFIRM = 'https://localhost:5001/confirm-stage'

describe('@modernpoacher/zashiki-react-redux/array', () => {
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
      /**
       *  Current stage
       */
      await page.waitForSelector('h1::-p-text(Embark)') // await await waitForTimeout(EMBARK_GRACE)
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

  describe('Array', () => {
    /**
     *  @type {puppeteer.Page}
     */
    let page

    before(async () => {
      page = await browser.newPage()

      await page.goto(EMBARK, { waitUntil: 'load' })
      /**
       *  Current stage
       */
      await page.waitForSelector('h1::-p-text(Embark)')

      await page.screenshot({ path: '.screenshots/embark-array-1.png' })

      await page.evaluate(() => {
        const index = Array.from(document.querySelectorAll('.cog label .text-content'))
          .findIndex(({ textContent = '' }) => textContent.trim() === 'Array')

        const array = Array.from(document.querySelectorAll('.cog input[type="radio"]'))
        const radio = array[index]
        if (radio) {
          radio.scrollIntoView() // @ts-expect-error
          radio.click()
        }
      })

      await page.screenshot({ path: '.screenshots/embark-array-2.png' })

      await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

      await page.click('form button[type="submit"]')
      await page.waitForSelector('.omega.resolved')

      await page.evaluate(() => { window.scrollTo(0, 0) })

      await page.screenshot({ path: '.screenshots/embark-array-3.png' })
    })

    describe('Array - Array (String - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-string-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        await page.waitForSelector('h1::-p-text(Array (String - Array))')

        await page.screenshot({ path: '.screenshots/array-string-array-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (String - Array)'))

      it('Has a String component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-string-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (String - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-string-array-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (String - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-string-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (String - Object))')

        await page.screenshot({ path: '.screenshots/array-string-object-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (String - Object)'))

      it('Has a String component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-string-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-string-object-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (Number - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-number-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - Array))')

        await page.screenshot({ path: '.screenshots/array-number-array-1.png' })
      })

      after(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h2::-p-text(There is a problem)')

        await page.screenshot({ path: '.screenshots/array-number-array-7.png' })

        await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

        const input = await page.$('.cog input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog input[type="text"]', '1')

        await page.screenshot({ path: '.screenshots/array-number-array-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - Object))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-number-array-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Number - Array)'))

      it('Has a Number component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', '1')

          await page.screenshot({ path: '.screenshots/array-number-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - Object))') // await  waitForTimeout(SUBMIT_GRACE)

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-array-3.png' })
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
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - Array))')

          await page.screenshot({ path: '.screenshots/array-number-array-4.png' })

          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-number-array-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-array-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Number - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-number-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - Object))')

        await page.screenshot({ path: '.screenshots/array-number-object-1.png' })
      })

      after(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h2::-p-text(There is a problem)')

        await page.screenshot({ path: '.screenshots/array-number-object-7.png' })

        await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

        const input = await page.$('.cog input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog input[type="text"]', '1')

        await page.screenshot({ path: '.screenshots/array-number-object-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Array - Array))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-number-object-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Number - Object)'))

      it('Has a Number component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          await page.type('.cog input[type="text"]', '1')

          await page.screenshot({ path: '.screenshots/array-number-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Array - Array))')

          await page.screenshot({ path: '.screenshots/wut-6.png' })

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-object-3.png' })
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
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - Object))')

          await page.screenshot({ path: '.screenshots/array-number-object-4.png' })

          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-number-object-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-object-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Array - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-array-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Array - Array))')

        await page.screenshot({ path: '.screenshots/array-array-array-1.png' })
      })

      after(async () => {
        let input

        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h2::-p-text(There is a problem)')

        await page.screenshot({ path: '.screenshots/array-array-array-7.png' })

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(1) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(2) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(2) input[type="text"]', '1')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(3) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(3) input[type="text"]', 'true')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(4) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

        await page.screenshot({ path: '.screenshots/array-array-array-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Array - Object))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-array-array-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Array - Array)'))

      it('Has a String component', async () => expect(await page.$('.cog:nth-of-type(1) input[type="text"]')).not.to.be.null)

      it('Has a Number component', async () => expect(await page.$('.cog:nth-of-type(2) input[type="text"]')).not.to.be.null)

      it('Has a Boolean component', async () => expect(await page.$('.cog:nth-of-type(3) input[type="text"]')).not.to.be.null)

      it('Has a Null component', async () => expect(await page.$('.cog:nth-of-type(4) input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          let input

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(2) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(2) input[type="text"]', '1')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(3) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(3) input[type="text"]', 'true')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(4) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

          await page.screenshot({ path: '.screenshots/array-array-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Array - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-array-array-3.png' })
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
          let input

          await page.goto(ROUTE, { waitUntil: 'load' })
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Array - Array))')

          await page.screenshot({ path: '.screenshots/array-array-array-4.png' })

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(2) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(2) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(3) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(3) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(4) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(4) input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-array-array-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-array-array-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Array - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-array-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Array - Object))')

        await page.screenshot({ path: '.screenshots/array-array-object-1.png' })
      })

      after(async () => {
        let input

        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h2::-p-text(There is a problem)')

        await page.screenshot({ path: '.screenshots/array-array-object-7.png' })

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(1) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(2) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(2) input[type="text"]', '1')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(3) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(3) input[type="text"]', 'true')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(4) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

        await page.screenshot({ path: '.screenshots/array-array-object-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Object - Array))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-array-object-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Array - Object)'))

      it('Has a String component', async () => expect(await page.$('.cog:nth-of-type(1) input[type="text"]')).not.to.be.null)

      it('Has a Number component', async () => expect(await page.$('.cog:nth-of-type(2) input[type="text"]')).not.to.be.null)

      it('Has a Boolean component', async () => expect(await page.$('.cog:nth-of-type(3) input[type="text"]')).not.to.be.null)

      it('Has a Null component', async () => expect(await page.$('.cog:nth-of-type(4) input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          let input

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(2) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(2) input[type="text"]', '1')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(3) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(3) input[type="text"]', 'true')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(4) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

          await page.screenshot({ path: '.screenshots/array-array-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Object - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-array-object-3.png' })
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
          let input

          await page.goto(ROUTE, { waitUntil: 'load' })
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Array - Object))')

          await page.screenshot({ path: '.screenshots/array-array-object-4.png' })

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(2) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(2) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(3) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(3) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(4) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(4) input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-array-object-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-array-object-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Object - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-object-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Object - Array))')

        await page.screenshot({ path: '.screenshots/array-object-array-1.png' })
      })

      after(async () => {
        let input

        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h2::-p-text(There is a problem)')

        await page.screenshot({ path: '.screenshots/array-object-array-7.png' })

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(1) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(2) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(2) input[type="text"]', '1')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(3) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(3) input[type="text"]', 'true')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(4) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

        await page.screenshot({ path: '.screenshots/array-object-array-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Object - Object))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-object-array-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Object - Array)'))

      it('Has a String component', async () => expect(await page.$('.cog:nth-of-type(1) input[type="text"]')).not.to.be.null)

      it('Has a Number component', async () => expect(await page.$('.cog:nth-of-type(2) input[type="text"]')).not.to.be.null)

      it('Has a Boolean component', async () => expect(await page.$('.cog:nth-of-type(3) input[type="text"]')).not.to.be.null)

      it('Has a Null component', async () => expect(await page.$('.cog:nth-of-type(4) input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          let input

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(2) input[type="text"]', '1')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(3) input[type="text"]', 'true')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

          await page.screenshot({ path: '.screenshots/array-object-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Object - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-object-array-3.png' })
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
          let input

          await page.goto(ROUTE, { waitUntil: 'load' })
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Object - Array))')

          await page.screenshot({ path: '.screenshots/array-object-array-4.png' })

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(2) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(2) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(3) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(3) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(4) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(4) input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-object-array-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-object-array-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Object - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-object-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Object - Object))')

        await page.screenshot({ path: '.screenshots/array-object-object-1.png' })
      })

      after(async () => {
        let input

        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h2::-p-text(There is a problem)')

        await page.screenshot({ path: '.screenshots/array-object-object-7.png' })

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(1) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(2) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(2) input[type="text"]', '1')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(3) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(3) input[type="text"]', 'true')

        await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

        input = await page.$('.cog:nth-of-type(4) input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

        await page.screenshot({ path: '.screenshots/array-object-object-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Boolean - Array))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-object-object-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Object - Object)'))

      it('Has a String component', async () => expect(await page.$('.cog:nth-of-type(1) input[type="text"]')).not.to.be.null)

      it('Has a Number component', async () => expect(await page.$('.cog:nth-of-type(2) input[type="text"]')).not.to.be.null)

      it('Has a Boolean component', async () => expect(await page.$('.cog:nth-of-type(3) input[type="text"]')).not.to.be.null)

      it('Has a Null component', async () => expect(await page.$('.cog:nth-of-type(4) input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          let input

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(2) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(2) input[type="text"]', '1')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(3) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(3) input[type="text"]', 'true')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(4) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

          await page.screenshot({ path: '.screenshots/array-object-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Boolean - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-object-object-3.png' })
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
          let input

          await page.goto(ROUTE, { waitUntil: 'load' })
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Object - Object))')

          await page.screenshot({ path: '.screenshots/array-object-object-4.png' })

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(1) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(1) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(2) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(2) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(3) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(3) input[type="text"]', 'string')

          await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

          input = await page.$('.cog:nth-of-type(4) input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog:nth-of-type(4) input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-object-object-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-object-object-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Boolean - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-boolean-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Boolean - Array))')

        await page.screenshot({ path: '.screenshots/array-boolean-array-1.png' })
      })

      after(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h2::-p-text(There is a problem)')

        await page.screenshot({ path: '.screenshots/array-boolean-array-7.png' })

        await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

        const input = await page.$('.cog input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog input[type="text"]', 'true')

        await page.screenshot({ path: '.screenshots/array-boolean-array-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Boolean - Object))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-boolean-array-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Boolean - Array)'))

      it('Has a Boolean component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'true')

          await page.screenshot({ path: '.screenshots/array-boolean-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Boolean - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-boolean-array-3.png' })
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
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Boolean - Array))')

          await page.screenshot({ path: '.screenshots/array-boolean-array-4.png' })

          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-boolean-array-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-boolean-array-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Boolean - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-boolean-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Boolean - Object))')

        await page.screenshot({ path: '.screenshots/array-boolean-object-1.png' })
      })

      after(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h2::-p-text(There is a problem)')

        await page.screenshot({ path: '.screenshots/array-boolean-object-7.png' })

        await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

        const input = await page.$('.cog input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog input[type="text"]', 'true')

        await page.screenshot({ path: '.screenshots/array-boolean-object-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Null - Array))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-boolean-object-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Boolean - Object)'))

      it('Has a Boolean component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'true')

          await page.screenshot({ path: '.screenshots/array-boolean-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Null - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-boolean-object-3.png' })
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
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Boolean - Object))')

          await page.screenshot({ path: '.screenshots/array-boolean-object-4.png' })

          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-boolean-object-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-boolean-object-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Null - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-null-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Null - Array))')

        await page.screenshot({ path: '.screenshots/array-null-array-1.png' })
      })

      after(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Null - Array))')

        await page.screenshot({ path: '.screenshots/array-null-array-7.png' })

        await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

        const input = await page.$('.cog input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog input[type="text"]', 'null')

        await page.screenshot({ path: '.screenshots/array-null-array-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Null - Object))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-null-array-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Null - Array)'))

      it('Has a Null component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'null')

          await page.screenshot({ path: '.screenshots/array-null-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Null - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-null-array-3.png' })
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
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Null - Array))')

          await page.screenshot({ path: '.screenshots/array-null-array-4.png' })

          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-null-array-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-null-array-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (Null - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-null-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Null - Object))')

        await page.screenshot({ path: '.screenshots/array-null-object-1.png' })
      })

      after(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Null - Object))')

        await page.screenshot({ path: '.screenshots/array-null-object-7.png' })

        await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

        const input = await page.$('.cog input[type="text"]')
        await input.click({ clickCount: 3 })
        await page.type('.cog input[type="text"]', 'null')

        await page.screenshot({ path: '.screenshots/array-null-object-8.png' })

        await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

        await page.click('form button[type="submit"]')
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (String - Enum - Array))')

        await page.evaluate(() => { window.scrollTo(0, 0) })

        await page.screenshot({ path: '.screenshots/array-null-object-9.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Null - Object)'))

      it('Has a Null component', async () => expect(await page.$('.cog input[type="text"]')).not.to.be.null)

      describe('Input is valid', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          await page.type('.cog input[type="text"]', 'null')

          await page.screenshot({ path: '.screenshots/array-null-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (String - Enum - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-null-object-3.png' })
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
          /**
           *  Current stage
           */
          await page.waitForSelector('h1::-p-text(Array (Null - Object))')

          await page.screenshot({ path: '.screenshots/array-null-object-4.png' })

          await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

          const input = await page.$('.cog input[type="text"]')
          await input.click({ clickCount: 3 })
          await page.type('.cog input[type="text"]', 'string')

          await page.screenshot({ path: '.screenshots/array-null-object-5.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Current stage
           */
          await page.waitForSelector('h2::-p-text(There is a problem)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-null-object-6.png' })
        })

        it('Returns to the same url', async () => expect(await getLocationHref(page)).to.equal(ROUTE))

        it('Has an error summary', async () => expect(await page.$('.sprocket.error-summary')).not.to.be.null)

        it('Has some error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf.above(0)
        })
      })
    })

    describe('Array - Array (String - Enum - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-string-enum-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (String - Enum - Array))')

        await page.screenshot({ path: '.screenshots/array-string-enum-array-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (String - Enum - Array)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-string-enum-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (String - Enum - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-string-enum-array-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (String - Enum - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-string-enum-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (String - Enum - Object))')

        await page.screenshot({ path: '.screenshots/array-string-enum-object-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (String - Enum - Object)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-string-enum-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (String - Any Of - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-string-enum-object-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (String - Any Of - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-string-any-of-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (String - Any Of - Array))')

        await page.screenshot({ path: '.screenshots/array-string-any-of-array-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (String - Any Of - Array)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-string-any-of-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (String - Any Of - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-string-any-of-array-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (String - Any Of - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-string-any-of-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (String - Any Of - Object))')

        await page.screenshot({ path: '.screenshots/array-string-any-of-object-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (String - Any Of - Object)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-string-any-of-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (String - One Of - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-string-any-of-object-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (String - One Of - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-string-one-of-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (String - One Of - Array))')

        await page.screenshot({ path: '.screenshots/array-string-one-of-array-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (String - One Of - Array)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-string-one-of-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (String - One Of - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-string-one-of-array-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (String - One Of - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-string-one-of-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (String - One Of - Object))')

        await page.screenshot({ path: '.screenshots/array-string-one-of-object-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (String - One Of - Object)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-string-one-of-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - Enum - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-string-one-of-object-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (Number - Enum - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-number-enum-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - Enum - Array))') // waitForTimeout(ROUTE_GRACE)

        await page.screenshot({ path: '.screenshots/array-number-enum-array-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Number - Enum - Array)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-number-enum-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - Enum - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-enum-array-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (Number - Enum - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-number-enum-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - Enum - Object))')

        await page.screenshot({ path: '.screenshots/array-number-enum-object-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Number - Enum - Object)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('.cog input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-number-enum-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - Any Of - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-enum-object-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (Number - Any Of - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-number-any-of-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - Any Of - Array))')

        await page.screenshot({ path: '.screenshots/array-number-any-of-array-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Number - Any Of - Array)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-number-any-of-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - Any Of - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-any-of-array-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (Number - Any Of - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-number-any-of-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - Any Of - Object))')

        await page.screenshot({ path: '.screenshots/array-number-any-of-object-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Number - Any Of - Object)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-number-any-of-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - One Of - Array))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-any-of-object-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (Number - One Of - Array)', () => {
      const ROUTE = 'https://localhost:5001/array/array-number-one-of-array'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Next stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - One Of - Array))')

        await page.screenshot({ path: '.screenshots/array-number-one-of-array-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Number - One Of - Array)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('.cog input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-number-one-of-array-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Array (Number - One Of - Object))')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-one-of-array-3.png' })
        })

        it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(ROUTE))

        it('Does not have an error summary', async () => expect(await page.$('.sprocket.error-summary')).to.be.null)

        it('Does not have any error messages', async () => {
          const nodeList = await page.$$('.cog .error-message')

          return expect(nodeList).to.have.lengthOf(0)
        })
      })
    })

    describe('Array - Array (Number - One Of - Object)', () => {
      const ROUTE = 'https://localhost:5001/array/array-number-one-of-object'

      before(async () => {
        await page.goto(ROUTE, { waitUntil: 'load' })
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Array (Number - One Of - Object))')

        await page.screenshot({ path: '.screenshots/array-number-one-of-object-1.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Array (Number - One Of - Object)'))

      it('Has a Radios component', async () => {
        const nodeList = await page.$$('.cog input[type="radio"]')

        return expect(nodeList).to.have.lengthOf.above(0)
      })

      describe('Input', () => {
        before(async () => {
          await page.evaluate(() => { document.querySelector('input[type="radio"][value="1"]').scrollIntoView() })

          await page.click('input[type="radio"][value="1"]')

          await page.screenshot({ path: '.screenshots/array-number-one-of-object-2.png' })

          await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

          await page.click('form button[type="submit"]')
          /**
           *  Next stage
           */
          await page.waitForSelector('h1::-p-text(Debark)')

          await page.evaluate(() => { window.scrollTo(0, 0) })

          await page.screenshot({ path: '.screenshots/array-number-one-of-object-3.png' })
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
        /**
         *  Current stage
         */
        await page.waitForSelector('h1::-p-text(Debark)')

        await page.screenshot({ path: '.screenshots/debark-array.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Debark'))

      it('Has a <button />', async () => expect(await page.$eval('form button[type="submit"]', getTextContent)).to.equal('Continue'))

      describe('Summary', () => {
        describe('Array - Array (String - Array)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(1) h2', getTextContent)).to.equal('Array (String - Array)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dt', getTextContent)).to.equal('String')

            expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dd', getTextContent)).to.equal('string')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(1) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(1) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-string-array-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'change')

              await page.screenshot({ path: '.screenshots/summary-array-string-array-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-string-array-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(1) h2', getTextContent)).to.equal('Array (String - Array)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dt', getTextContent)).to.equal('String')

              expect(await page.$eval('.sprocket:nth-of-type(1) h2 + dl dd', getTextContent)).to.equal('change')
            })
          })
        })

        describe('Array - Array (String - Object)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(2) h2', getTextContent)).to.equal('Array (String - Object)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dt', getTextContent)).to.equal('String')

            expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dd', getTextContent)).to.equal('string')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(2) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(2) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-string-object-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'change')

              await page.screenshot({ path: '.screenshots/summary-array-string-object-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-string-object-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(2) h2', getTextContent)).to.equal('Array (String - Object)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dt', getTextContent)).to.equal('String')

              expect(await page.$eval('.sprocket:nth-of-type(2) h2 + dl dd', getTextContent)).to.equal('change')
            })
          })
        })

        describe('Array - Array (Number - Array)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(3) h2', getTextContent)).to.equal('Array (Number - Array)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dt', getTextContent)).to.equal('Number')

            expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dd', getTextContent)).to.equal('1')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(3) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(3) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-number-array-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', '2')

              await page.screenshot({ path: '.screenshots/summary-array-number-array-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-number-array-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(3) h2', getTextContent)).to.equal('Array (Number - Array)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dt', getTextContent)).to.equal('Number')

              expect(await page.$eval('.sprocket:nth-of-type(3) h2 + dl dd', getTextContent)).to.equal('2')
            })
          })
        })

        describe('Array - Array (Number - Object)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(4) h2', getTextContent)).to.equal('Array (Number - Object)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dt', getTextContent)).to.equal('Number')

            expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dd', getTextContent)).to.equal('1')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(4) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(4) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-number-object-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', '2')

              await page.screenshot({ path: '.screenshots/summary-array-number-object-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-number-object-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(4) h2', getTextContent)).to.equal('Array (Number - Object)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dt', getTextContent)).to.equal('Number')

              expect(await page.$eval('.sprocket:nth-of-type(4) h2 + dl dd', getTextContent)).to.equal('2')
            })
          })
        })

        describe('Array - Array (Array - Array)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(5) h2', getTextContent)).to.equal('Array (Array - Array)'))

          it('Has a <dl />', async () => {
            const titles = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(5) h2 + dl dt'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            const values = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(5) h2 + dl dd.answer-value'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            const actions = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(5) h2 + dl dd.change-answer'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            expect(titles).to.eql([
              'String',
              'Number',
              'Boolean',
              'Null'
            ])

            expect(values).to.eql([
              'string',
              '1',
              'true',
              'null'
            ])

            expect(actions).to.eql([
              'Change string',
              'Change number',
              'Change boolean',
              'Change null'
            ])
          })

          describe('Change', () => {
            before(async () => {
              let input

              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(5) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(5) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-array-array-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(1) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(1) input[type="text"]', 'change')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(2) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(2) input[type="text"]', '2')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(3) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(3) input[type="text"]', 'false')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(4) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

              await page.screenshot({ path: '.screenshots/summary-array-array-array-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-array-array-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(5) h2', getTextContent)).to.equal('Array (Array - Array)'))

            it('Has a <dl />', async () => {
              const titles = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(5) h2 + dl dt'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              const values = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(5) h2 + dl dd.answer-value'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              const actions = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(5) h2 + dl dd.change-answer'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              expect(titles).to.eql([
                'String',
                'Number',
                'Boolean',
                'Null'
              ])

              expect(values).to.eql([
                'change',
                '2',
                'false',
                'null'
              ])

              expect(actions).to.eql([
                'Change string',
                'Change number',
                'Change boolean',
                'Change null'
              ])
            })
          })
        })

        describe('Array - Array (Array - Object)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(6) h2', getTextContent)).to.equal('Array (Array - Object)'))

          it('Has a <dl />', async () => {
            const titles = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(6) h2 + dl dt'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            const values = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(6) h2 + dl dd.answer-value'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            const actions = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(6) h2 + dl dd.change-answer'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            expect(titles).to.eql([
              'String',
              'Number',
              'Boolean',
              'Null'
            ])

            expect(values).to.eql([
              'string',
              '1',
              'true',
              'null'
            ])

            expect(actions).to.eql([
              'Change string',
              'Change number',
              'Change boolean',
              'Change null'
            ])
          })

          describe('Change', () => {
            before(async () => {
              let input

              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(6) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(6) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-array-object-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(1) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(1) input[type="text"]', 'change')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(2) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(2) input[type="text"]', '2')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(3) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(3) input[type="text"]', 'false')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(4) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

              await page.screenshot({ path: '.screenshots/summary-array-array-object-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-array-object-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(6) h2', getTextContent)).to.equal('Array (Array - Object)'))

            it('Has a <dl />', async () => {
              const titles = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(6) h2 + dl dt'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              const values = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(6) h2 + dl dd.answer-value'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              const actions = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(6) h2 + dl dd.change-answer'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              expect(titles).to.eql([
                'String',
                'Number',
                'Boolean',
                'Null'
              ])

              expect(values).to.eql([
                'change',
                '2',
                'false',
                'null'
              ])

              expect(actions).to.eql([
                'Change string',
                'Change number',
                'Change boolean',
                'Change null'
              ])
            })
          })
        })

        describe('Array - Array (Object - Array)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(7) h2', getTextContent)).to.equal('Array (Object - Array)'))

          it('Has a <dl />', async () => {
            const titles = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(7) h2 + dl dt'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            const values = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(7) h2 + dl dd.answer-value'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            const actions = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(7) h2 + dl dd.change-answer'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            expect(titles).to.eql([
              'String',
              'Number',
              'Boolean',
              'Null'
            ])

            expect(values).to.eql([
              'string',
              '1',
              'true',
              'null'
            ])

            expect(actions).to.eql([
              'Change string',
              'Change number',
              'Change boolean',
              'Change null'
            ])
          })

          describe('Change', () => {
            before(async () => {
              let input

              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(7) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(7) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-object-array-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(1) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(1) input[type="text"]', 'change')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(2) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(2) input[type="text"]', '2')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(3) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(3) input[type="text"]', 'false')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(4) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

              await page.screenshot({ path: '.screenshots/summary-array-object-array-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-object-array-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(7) h2', getTextContent)).to.equal('Array (Object - Array)'))

            it('Has a <dl />', async () => {
              const titles = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(7) h2 + dl dt'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              const values = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(7) h2 + dl dd.answer-value'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              const actions = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(7) h2 + dl dd.change-answer'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              expect(titles).to.eql([
                'String',
                'Number',
                'Boolean',
                'Null'
              ])

              expect(values).to.eql([
                'change',
                '2',
                'false',
                'null'
              ])

              expect(actions).to.eql([
                'Change string',
                'Change number',
                'Change boolean',
                'Change null'
              ])
            })
          })
        })

        describe('Array - Array (Object - Object)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(8) h2', getTextContent)).to.equal('Array (Object - Object)'))

          it('Has a <dl />', async () => {
            const titles = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(8) h2 + dl dt'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            const values = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(8) h2 + dl dd.answer-value'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            const actions = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('.sprocket:nth-of-type(8) h2 + dl dd.change-answer'))
                .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
            })

            expect(titles).to.eql([
              'String',
              'Number',
              'Boolean',
              'Null'
            ])

            expect(values).to.eql([
              'string',
              '1',
              'true',
              'null'
            ])

            expect(actions).to.eql([
              'Change string',
              'Change number',
              'Change boolean',
              'Change null'
            ])
          })

          describe('Change', () => {
            before(async () => {
              let input

              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(8) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(8) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-object-object-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(1) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(1) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(1) input[type="text"]', 'change')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(2) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(2) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(2) input[type="text"]', '2')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(3) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(3) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(3) input[type="text"]', 'false')

              await page.evaluate(() => { document.querySelector('.cog:nth-of-type(4) input[type="text"]').scrollIntoView() })

              input = await page.$('.cog:nth-of-type(4) input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog:nth-of-type(4) input[type="text"]', 'null')

              await page.screenshot({ path: '.screenshots/summary-array-object-object-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-object-object-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(8) h2', getTextContent)).to.equal('Array (Object - Object)'))

            it('Has a <dl />', async () => {
              const titles = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(8) h2 + dl dt'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              const values = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(8) h2 + dl dd.answer-value'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              const actions = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.sprocket:nth-of-type(8) h2 + dl dd.change-answer'))
                  .map(({ textContent = '' }) => textContent.trim()) // must be in page scope
              })

              expect(titles).to.eql([
                'String',
                'Number',
                'Boolean',
                'Null'
              ])

              expect(values).to.eql([
                'change',
                '2',
                'false',
                'null'
              ])

              expect(actions).to.eql([
                'Change string',
                'Change number',
                'Change boolean',
                'Change null'
              ])
            })
          })
        })

        describe('Array - Array (Boolean - Array)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(9) h2', getTextContent)).to.equal('Array (Boolean - Array)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(9) h2 + dl dt', getTextContent)).to.equal('Boolean')

            expect(await page.$eval('.sprocket:nth-of-type(9) h2 + dl dd', getTextContent)).to.equal('true')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(9) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(9) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-boolean-array-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'false')

              await page.screenshot({ path: '.screenshots/summary-array-boolean-array-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-boolean-array-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(9) h2', getTextContent)).to.equal('Array (Boolean - Array)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(9) h2 + dl dt', getTextContent)).to.equal('Boolean')

              expect(await page.$eval('.sprocket:nth-of-type(9) h2 + dl dd', getTextContent)).to.equal('false')
            })
          })
        })

        describe('Array - Array (Boolean - Object)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(10) h2', getTextContent)).to.equal('Array (Boolean - Object)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(10) h2 + dl dt', getTextContent)).to.equal('Boolean')

            expect(await page.$eval('.sprocket:nth-of-type(10) h2 + dl dd', getTextContent)).to.equal('true')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(10) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(10) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-boolean-object-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'false')

              await page.screenshot({ path: '.screenshots/summary-array-boolean-object-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-boolean-object-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(10) h2', getTextContent)).to.equal('Array (Boolean - Object)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(10) h2 + dl dt', getTextContent)).to.equal('Boolean')

              expect(await page.$eval('.sprocket:nth-of-type(10) h2 + dl dd', getTextContent)).to.equal('false')
            })
          })
        })

        describe('Array - Array (Null - Array)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(11) h2', getTextContent)).to.equal('Array (Null - Array)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(11) h2 + dl dt', getTextContent)).to.equal('Null')

            expect(await page.$eval('.sprocket:nth-of-type(11) h2 + dl dd', getTextContent)).to.equal('null')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(11) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(11) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-null-array-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'null')

              await page.screenshot({ path: '.screenshots/summary-array-null-array-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-null-array-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(11) h2', getTextContent)).to.equal('Array (Null - Array)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(11) h2 + dl dt', getTextContent)).to.equal('Null')

              expect(await page.$eval('.sprocket:nth-of-type(11) h2 + dl dd', getTextContent)).to.equal('null')
            })
          })
        })

        describe('Array - Array (Null - Object)', () => {
          it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(12) h2', getTextContent)).to.equal('Array (Null - Object)'))

          it('Has a <dl />', async () => {
            expect(await page.$eval('.sprocket:nth-of-type(12) h2 + dl dt', getTextContent)).to.equal('Null')

            expect(await page.$eval('.sprocket:nth-of-type(12) h2 + dl dd', getTextContent)).to.equal('null')
          })

          describe('Change', () => {
            before(async () => {
              await page.evaluate(() => { document.querySelector('.sprocket:nth-of-type(12) h2 + dl dd a').scrollIntoView() })

              await page.click('.sprocket:nth-of-type(12) h2 + dl dd a')
              await page.waitForSelector('.omega.resolved')

              await page.screenshot({ path: '.screenshots/summary-array-null-object-change-1.png' })

              await page.evaluate(() => { document.querySelector('.cog input[type="text"]').scrollIntoView() })

              const input = await page.$('.cog input[type="text"]')
              await input.click({ clickCount: 3 })
              await page.type('.cog input[type="text"]', 'null')

              await page.screenshot({ path: '.screenshots/summary-array-null-object-change-2.png' })

              await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

              await page.click('form button[type="submit"]')
              await page.waitForSelector('.debark.resolved')

              await page.evaluate(() => { window.scrollTo(0, 0) })

              await page.screenshot({ path: '.screenshots/summary-array-null-object-change-3.png' })
            })

            it('Has an <h2 />', async () => expect(await page.$eval('.sprocket:nth-of-type(12) h2', getTextContent)).to.equal('Array (Null - Object)'))

            it('Has a <dl />', async () => {
              expect(await page.$eval('.sprocket:nth-of-type(12) h2 + dl dt', getTextContent)).to.equal('Null')

              expect(await page.$eval('.sprocket:nth-of-type(12) h2 + dl dd', getTextContent)).to.equal('null')
            })
          })
        })

        describe('Submit', () => {
          before(async () => {
            await page.evaluate(() => { document.querySelector('form button[type="submit"]').scrollIntoView() })

            await page.click('form button[type="submit"]')
            await page.waitForSelector('.confirm.resolved')

            await page.evaluate(() => { window.scrollTo(0, 0) })

            await page.screenshot({ path: '.screenshots/summary-array-confirm.png' })
          })

          it('Does not return to the same url', async () => expect(await getLocationHref(page)).not.to.equal(DEBARK))
        })
      })
    })

    describe('Confirm', () => {
      before(async () => {
        page = await browser.newPage()

        await page.goto(CONFIRM, { waitUntil: 'load' })

        await page.screenshot({ path: '.screenshots/confirm-array.png' })
      })

      it('Has an <h1 />', async () => expect(await page.$eval('h1', getTextContent)).to.equal('Confirm'))
    })
  })
})
