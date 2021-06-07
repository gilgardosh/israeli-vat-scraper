import { Page } from 'puppeteer';
import { waitForSelectorPlus } from '../utils/pageUtil.js';

export const login = async (page: Page): Promise<void> => {
  try {
    await page.goto('https://www.misim.gov.il/emdvhmfrt/wLogOnMaam.aspx', {
      waitUntil: ['networkidle2', 'domcontentloaded'],
    });
    await waitForSelectorPlus(page, '#LogonMaam1_EmTwbCtlLogonMaam_BtnSubmit');

    await page.type(
      '#LogonMaam1_EmTwbCtlLogonMaam_TxtMisOsek',
      process.env.VAT_NUM as string
    );

    await page.type(
      '#LogonMaam1_EmTwbCtlLogonMaam_TxtKodUser',
      process.env.USER_CODE as string
    );

    await page.type(
      '#LogonMaam1_EmTwbCtlLogonMaam_TxtPassword',
      process.env.USER_PASS as string
    );

    await page.click('#LogonMaam1_EmTwbCtlLogonMaam_BtnSubmit');

    return;
  } catch (e) {
    throw new Error(`login - ${e}`);
  }
};
