import puppeteer, { Page } from 'puppeteer';
import { login } from '../handlers/loginHandler.js';
import { waitForSelectorPlus } from './pageUtil.js';
import { Config } from './types.js';

export const newPageByYear = async (
  config: Config,
  year: string
): Promise<Page> => {
  try {
    const page = await newHomePage(config);

    await waitForSelectorPlus(page, '#ContentUsersPage_DdlTkufa');
    await page.select('#ContentUsersPage_DdlTkufa', year);

    return page;
  } catch (e) {
    throw new Error(`newPageByYear - ${e.message}`);
  }
};

export const newHomePage = async (config: Config): Promise<Page> => {
  try {
    const browser = await puppeteer.launch({
      headless: !config.visibleBrowser,
    });
    const page = (await browser.pages())[0];
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36'
    );

    await login(page);

    await page.goto('https://www.misim.gov.il/emdvhmfrt/wViewDuchot.aspx', {
      waitUntil: ['networkidle2', 'domcontentloaded'],
    });

    return page;
  } catch (e) {
    throw new Error(`newHomePage - ${e.message}`);
  }
};
