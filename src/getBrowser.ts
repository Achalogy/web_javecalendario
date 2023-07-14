import puppeteer, { Browser } from "puppeteer";

let browser: Browser;

try {
  // @ts-expect-error
  browser.close()
} catch {}

export default async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      // headless: "new",
      headless: false,
      args: ['--no-sandbox', '--disable-gpu'],
      timeout: 0,
    });
  }
  return browser;
}
