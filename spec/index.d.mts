// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars -- Puppeteer
import * as puppeteer from 'puppeteer'

declare module 'puppeteer' {
  export interface Page {
    waitForTimeout: (duration: number) => Promise<void>
  }
}
