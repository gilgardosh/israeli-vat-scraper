import { Page } from 'puppeteer';
import { newPageByYear } from '../utils/browserUtil.js';
import {
  getReportExpansionDeals,
  getReportExpansionFixes,
  getReportExpansionInputs,
  getReportExpansionInputTransactionDetails,
  getReportExpansionInputTransactions,
  getReportExpansionTitle,
} from '../utils/evaluationFunctions.js';
import { waitAndClick, waitForSelectorPlus } from '../utils/pageUtil.js';
import {
  Config,
  ReportDeals,
  ReportExpansion,
  ReportFixedInvoice,
  ReportInputs,
  ReportInputTransaction,
  ReportInputTransactionDetails,
} from '../utils/types.js';

const reportExpansionInputTransactionDetailsHandler = async (
  page: Page,
  index: number
): Promise<ReportInputTransactionDetails> => {
  try {
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
  } catch (e) {
    throw new Error(
      `reportExpansionInputTransactionDetailsHandler(${index}) - ${e}`
    );
  }
};

const reportExpansionRecordTransactionsHandler = async (
  page: Page,
  index: number
): Promise<ReportInputTransaction[]> => {
  try {
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
  } catch (e) {
    throw new Error(
      `reportExpansionRecordTransactionsHandler(${index}) - ${e}`
    );
  }
};

const reportExpansionInputsHandler = async (
  page: Page
): Promise<ReportInputs> => {
  try {
    console.log('      Fetching inputs...');
    await waitAndClick(page, '#ContentUsersPage_TabMenu1_LinkButton0');

    const inputsTable = await waitForSelectorPlus(page, '#tblSikum');
    const inputsData = await page.evaluate(
      getReportExpansionInputs,
      inputsTable
    );

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
  } catch (e) {
    throw new Error(`reportExpansionInputsHandler - ${e}`);
  }
};

const reportExpansionDealsHandler = async (
  page: Page
): Promise<ReportDeals> => {
  try {
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
  } catch (e) {
    throw new Error(`reportExpansionDealsHandler - ${e}`);
  }
};

const reportExpansionFixesHandler = async (
  page: Page
): Promise<ReportFixedInvoice[]> => {
  try {
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
  } catch (e) {
    throw new Error(`reportExpansionFixesHandler - ${e.message}`);
  }
};

export const reportExpansionHandler = async (
  config: Config,
  year: string,
  index: number,
  getFixes: boolean
): Promise<ReportExpansion> => {
  try {
    console.log('    Fetching expansion...');

    const page = await newPageByYear(config, year);

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
      console.log(`${year} - ${index} - Error fetching title`);
    }
    const reportExpansion: ReportExpansion = await page.evaluate(
      getReportExpansionTitle,
      titleTable
    );

    // get inputs
    try {
      reportExpansion.inputs = await reportExpansionInputsHandler(page);
    } catch (e) {
      console.log(`${year} - ${index} - Error fetching inputs:`, e);
    }

    // get deals
    try {
      reportExpansion.deals = await reportExpansionDealsHandler(page);
    } catch (e) {
      console.log(`${year} - ${index} - Error fetching deals:`, e);
    }

    // get fixes
    try {
      if (getFixes) {
        reportExpansion.fixedInvoices = await reportExpansionFixesHandler(page);
      }
    } catch (e) {
      console.log(`${year} - ${index} - Error fetching fixes:`, e);
    }

    // await waitAndClick(page, '#ContentUsersPage_btnGoBack');

    await page.browser().close();

    return reportExpansion;
  } catch (e) {
    throw new Error(`reportExpansionHandler(${index}) - ${e.message}`);
  }
};
