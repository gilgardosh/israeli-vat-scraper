import puppeteer, { Page } from 'puppeteer';
import dotenv from 'dotenv';
import {
  getSelectOptions,
  waitAndClick,
  waitForSelectorPlus,
} from './utils/pageUtil.js';
import {
  Report,
  ReportDeals,
  ReportDetails,
  ReportExpansion,
  ReportFixedInvoice,
  ReportInputs,
  ReportInputTransaction,
  ReportInputTransactionDetails,
} from './utils/types.js';
import {
  getReportDetails,
  getReportsTable,
  getReportExpansionTitle,
  getReportExpansionInputs,
  getReportExpansionInputTransactions,
  getReportExpansionInputTransactionDetails,
  getReportExpansionDeals,
  getReportExpansionFixes,
} from './utils/evaluationFunctions.js';

dotenv.config();

const login = async (page: Page): Promise<void> => {
  await page.goto('https://www.misim.gov.il/emdvhmfrt/wLogOnMaam.aspx', {
    waitUntil: 'networkidle2',
  });
  await waitForSelectorPlus(page, '#LogonMaam1_EmTwbCtlLogonMaam_BtnSubmit');

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

  await waitForSelectorPlus(page, '#ContentUsersPage_DdlTkufa');
  await page.select('#ContentUsersPage_DdlTkufa', year);

  await waitForSelectorPlus(page, '#ContentUsersPage_TblDuhot');

  const tableElement = await page.$('#dgDuchot');

  if (!tableElement) {
    return [];
  }

  const table: Report[] = await page.evaluate(getReportsTable, tableElement);

  return table;
};

const reportAdditionalDetailsHandler = async (
  page: Page,
  index: number
): Promise<ReportDetails> => {
  console.log('    Fetching details...');

  const selector = `#dgDuchot > tbody > tr:nth-child(${
    index + 2
  }) > td:nth-child(7) > table > tbody > tr > td:nth-child(1) > input`;
  await waitAndClick(page, selector);

  const detailsTable = await waitForSelectorPlus(
    page,
    '#ContentUsersPage_ucPratimNosafimDuchot1_TblPerutDoch'
  );

  const additionalDetails: ReportDetails = await page.evaluate(
    getReportDetails,
    detailsTable
  );

  await waitAndClick(page, '#BtnCloseDlgPrtNsf');

  return additionalDetails;
};

const reportExpansionInputTransactionDetailsHandler = async (
  page: Page,
  index: number
): Promise<ReportInputTransactionDetails> => {
  await waitAndClick(
    page,
    `#ContentUsersPage_dgHeshboniot_btnPratimNosafim_${index}`
  );

  const detailsTable = await waitForSelectorPlus(
    page,
    '#ContentUsersPage_ucPratimNosafimHsb1_TblPerutHeshbonit'
  );

  const details = await page.evaluate(
    getReportExpansionInputTransactionDetails,
    detailsTable
  );

  await waitAndClick(page, '#BtnCloseDlgPrtNsf');
  return details;
};

const reportExpansionRecordTransactionsHandler = async (
  page: Page,
  index: number
): Promise<ReportInputTransaction[]> => {
  await waitAndClick(
    page,
    `#tblSikum > tbody > tr:nth-child(${index}) > td:nth-child(2) > a`
  );

  const transactionsTable = await waitForSelectorPlus(
    page,
    '#ContentUsersPage_dgHeshboniot'
  );
  const transactions = await page.evaluate(
    getReportExpansionInputTransactions,
    transactionsTable
  );

  for (let i = 0; i < transactions.length; i++) {
    transactions[i].details =
      await reportExpansionInputTransactionDetailsHandler(page, i);
  }

  await waitAndClick(page, '#ContentUsersPage_btnGoBack');
  return transactions;
};

const reportExpansionInputsHandler = async (
  page: Page
): Promise<ReportInputs> => {
  console.log('      Fetching inputs...');
  await waitAndClick(page, '#ContentUsersPage_TabMenu1_LinkButton0');

  const inputsTable = await waitForSelectorPlus(page, '#tblSikum');
  const inputsData = await page.evaluate(getReportExpansionInputs, inputsTable);

  // gt income transactions
  for (const key in inputsData) {
    if (key === 'total') {
      continue;
    }
    if (inputsData[key as keyof ReportInputs].received.transactionsNum > 0) {
      const index = ((): number | null => {
        switch (key) {
          case 'regularInput':
            return 3;
          case 'pettyCash':
            return 4;
          case 'selfInvoiceInput':
            return 5;
          case 'importList':
            return 6;
          case 'rashapSupplier':
            return 7;
          case 'otherDocument':
            return 8;
          default:
            return null;
        }
      })();

      if (index) {
        inputsData[key as keyof ReportInputs].received.transactions =
          await reportExpansionRecordTransactionsHandler(page, index);
      }
    }
  }

  return inputsData;
};

const reportExpansionDealsHandler = async (
  page: Page
): Promise<ReportDeals> => {
  console.log('      Fetching deals...');
  await waitAndClick(page, '#ContentUsersPage_TabMenu1_LinkButton1');

  const dealsTable = await waitForSelectorPlus(page, '#tblSikum');
  const dealsData = await page.evaluate(getReportExpansionDeals, dealsTable);

  // gt income transactions
  for (const key in dealsData) {
    if (key === 'total') {
      continue;
    }
    if (dealsData[key as keyof ReportDeals].received.transactionsNum > 0) {
      const index = ((): number | null => {
        switch (key) {
          case 'regularDealRecognized':
            return 3;
          case 'zeroDealRecognized':
            return 4;
          case 'regularDealUnrecognized':
            return 5;
          case 'zeroDealUnrecognized':
            return 6;
          case 'selfInvoiceDeal':
            return 7;
          case 'listExport':
            return 8;
          case 'servicesExport':
            return 9;
          case 'rashapClient':
            return 10;
          default:
            return null;
        }
      })();

      if (index) {
        dealsData[key as keyof ReportDeals].received.transactions =
          await reportExpansionRecordTransactionsHandler(page, index);
      }
    }
  }

  return dealsData;
};

const reportExpansionFixesHandler = async (
  page: Page
): Promise<ReportFixedInvoice[]> => {
  console.log('      Fetching fixes...');
  await waitAndClick(page, '#ContentUsersPage_lnkHeshboniotBeforeTikun');

  // get fixes
  const fixesTable = await waitForSelectorPlus(
    page,
    '#ContentUsersPage_DgIskNosfu'
  );
  const fixes = await page.evaluate(getReportExpansionFixes, fixesTable);

  await waitAndClick(page, '#ContentUsersPage_btnGoBack');

  return fixes;
};

const reportExpansionHandler = async (
  page: Page,
  index: number,
  getFixes: boolean
): Promise<ReportExpansion> => {
  console.log('    Fetching expansion...');
  const selector = `#dgDuchot > tbody > tr:nth-child(${
    index + 2
  }) > td:nth-child(1) > a`;
  await waitAndClick(page, selector);

  // get title
  console.log('      Fetching title...');
  await waitForSelectorPlus(page, '#shaamcontent');

  const titleTable = await waitForSelectorPlus(
    page,
    '#shaamcontent > table > tbody > tr:nth-child(2) > td > table'
  );
  if (!titleTable) {
    console.log('Error fetching title');
  }
  const reportExpansion: ReportExpansion = await page.evaluate(
    getReportExpansionTitle,
    titleTable
  );

  // get inputs
  try {
    reportExpansion.inputs = await reportExpansionInputsHandler(page);
  } catch (e) {
    console.log('Error fetching inputs:', e);
  }

  // get deals
  try {
    reportExpansion.deals = await reportExpansionDealsHandler(page);
  } catch (e) {
    console.log('Error fetching deals:', e);
  }

  // get fixes
  try {
    if (getFixes) {
      reportExpansion.fixedInvoices = await reportExpansionFixesHandler(page);
    }
  } catch (e) {
    console.log('Error fetching fixes:', e);
  }

  await waitAndClick(page, '#ContentUsersPage_btnGoBack');

  return reportExpansion;
};

const reportsPageHandler = async (page: Page): Promise<Report[]> => {
  await page.goto('https://www.misim.gov.il/emdvhmfrt/wViewDuchot.aspx', {
    waitUntil: 'networkidle2',
  });

  await waitForSelectorPlus(page, '#ContentUsersPage_DdlTkufa');
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

    for (let i = 0; i < baseYearTable.length; i++) {
      const report = baseYearTable[i];
      console.log(`  Expanding data for ${report.submissionPeriod} report`);

      // get report details
      report.additionalDetails = await reportAdditionalDetailsHandler(page, i);

      // get report expansion
      report.reportExpansion = await reportExpansionHandler(
        page,
        i,
        report.isFixed
      );

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
