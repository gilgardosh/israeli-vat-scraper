import puppeteer, { Page } from 'puppeteer';
import dotenv from 'dotenv';
import { getSelectOptions, sleep } from './utils/pageUtil.js';
import { Report, ReportDetails } from './utils/types.js';
import {
  clickElementByName,
  missingDataChecker,
  getReportDetails,
  getReportsTable,
} from './utils/evaluationFunctions.js';

dotenv.config();

const login = async (page: Page): Promise<void> => {
  await page.goto('https://www.misim.gov.il/emdvhmfrt/wLogOnMaam.aspx', {
    waitUntil: 'networkidle2',
  });
  await page.waitForSelector('#LogonMaam1_EmTwbCtlLogonMaam_BtnSubmit');

  console.log('Loaded: www.misim.gov.il');

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

  console.log('Logged in');
  return;
};

const reportsTableHandler = async (
  page: Page,
  year: string
): Promise<Report[]> => {
  console.log(`Scraping data for year ${year}`);

  await page.select('#ContentUsersPage_DdlTkufa', year);

  await page.waitForSelector('#ContentUsersPage_TblDuhot');

  if (await page.evaluate(missingDataChecker)) {
    return [];
  }

  const table: Report[] = await page.evaluate(getReportsTable);

  return table;
};

const reportAdditionalDetailsHandler = async (
  page: Page,
  reportLinkName: string
): Promise<ReportDetails> => {
  await page.evaluate(clickElementByName, reportLinkName);

  await page.waitForSelector(
    '#ContentUsersPage_ucPratimNosafimDuchot1_TblPerutDoch'
  );

  const additionalDetails: ReportDetails = await page.evaluate(
    getReportDetails
  );

  await page.click('#BtnCloseDlgPrtNsf');

  return additionalDetails;
};

const reportsPageHandler = async (page: Page): Promise<Report[]> => {
  await page.goto('https://www.misim.gov.il/emdvhmfrt/wViewDuchot.aspx', {
    waitUntil: 'networkidle2',
  });

  const taxYears = await getSelectOptions(
    page,
    'select#ContentUsersPage_DdlTkufa > option'
  );

  const reports: Report[] = [];

  for (const year of taxYears) {
    const baseYearTable = await reportsTableHandler(page, year.value);
    if (!baseYearTable || baseYearTable.length === 0) {
      continue;
    }

    for (const report of baseYearTable) {
      console.log(`Expanding data for ${report.submissionPeriod} report`);

      report.additionalDetails = await reportAdditionalDetailsHandler(
        page,
        report._additionalDetailsName
      );

      // TODO: get reportExpansion
      await sleep(1000);

      reports.push(report);
    }
  }

  return reports;
};

const scraper = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await login(page);

  const reports = await reportsPageHandler(page);

  console.log(JSON.stringify(reports));

  await browser.close();
};

scraper();
