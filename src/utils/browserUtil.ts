import puppeteer, { Page } from 'puppeteer';
import { login } from '../handlers/loginHandler.js';
import { waitAndClick, waitForSelectorPlus } from './pageUtil.js';

export const newPageByMonth = async (
  showBrowser: boolean,
  year: string,
  monthIndex: number
): Promise<Page> => {
  try {
    const page = await newPageByYear(showBrowser, year);

    const selector = `#dgDuchot > tbody > tr:nth-child(${
      monthIndex + 2
    }) > td:nth-child(1) > a`;
    await waitAndClick(page, selector);

    return page;
  } catch (e) {
    throw new Error(`newPageByYear - ${e}`);
  }
};

export const newPageByYear = async (
  showBrowser: boolean,
  year: string
): Promise<Page> => {
  try {
    const page = await newHomePage(showBrowser);

    await waitForSelectorPlus(page, '#ContentUsersPage_DdlTkufa');
    await page.select('#ContentUsersPage_DdlTkufa', year);

    return page;
  } catch (e) {
    throw new Error(`newPageByYear - ${e}`);
  }
};

export const newHomePage = async (showBrowser: boolean): Promise<Page> => {
  try {
    const browser = await puppeteer.launch({
      headless: !showBrowser,
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
    throw new Error(`newHomePage - ${e}`);
  }
};
