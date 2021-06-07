import puppeteer, { Page } from 'puppeteer';
import dotenv from 'dotenv';
import {
  getSelectOptions,
  waitAndClick,
  waitForSelectorPlus,
} from './utils/pageUtil.js';
import {
  Config,
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
import { parseDate } from './utils/dates.js';

dotenv.config();

const login = async (page: Page): Promise<void> => {
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

const reportsYearHandler = async (year: string): Promise<Report[]> => {
  try {
    console.log(`Scraping data for year ${year}`);
    const page = await newPageByYear(year);

    const baseYearTable = await reportsTableHandler(page);

    await page.browser().close();

    if (!baseYearTable || baseYearTable.length === 0) {
      console.log(`  No data for ${year}`);
      return [];
    }

    const reports: Report[] = [];

    await Promise.all(
      baseYearTable.map(async (report: Report, i: number) => {
        console.log(`  Expanding data for ${report.submissionPeriod} report`);

        // get report details
        report.additionalDetails = await reportAdditionalDetailsHandler(
          year,
          i
        );

        // get report expansion
        if (_defaultConfig.expandData) {
          report.reportExpansion = await reportExpansionHandler(
            year,
            i,
            report.isFixed
          );
        }

        return report;
      })
    ).then((reportsList) => {
      reports.push(...reportsList);
    });

    console.log(`Done scraping ${year}`);
    return reports;
  } catch (e) {
    throw new Error(`${year} - reportsYearHandler - ${e}`);
  }
};

const reportsTableHandler = async (page: Page): Promise<Report[]> => {
  try {
    await waitForSelectorPlus(page, '#ContentUsersPage_TblDuhot');

    const tableElement = await page.$('#dgDuchot');

    if (!tableElement) {
      return [];
    }

    const table: Report[] = await page.evaluate(getReportsTable, tableElement);

    return table;
  } catch (e) {
    throw new Error(`reportsTableHandler - ${e}`);
  }
};

const reportAdditionalDetailsHandler = async (
  year: string,
  index: number
): Promise<ReportDetails> => {
  try {
    console.log('    Fetching details...');

    const page = await newPageByYear(year);

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

    // await waitAndClick(page, '#BtnCloseDlgPrtNsf');

    await page.browser().close();

    return additionalDetails;
  } catch (e) {
    throw new Error(`reportAdditionalDetailsHandler(${index}) - ${e}`);
  }
};

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

const reportExpansionHandler = async (
  year: string,
  index: number,
  getFixes: boolean
): Promise<ReportExpansion> => {
  try {
    console.log('    Fetching expansion...');

    const page = await newPageByYear(year);

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

const reportsHandler = async (): Promise<Report[]> => {
  try {
    const page = await newHomePage();
    console.log('Logged in');

    await waitForSelectorPlus(page, '#ContentUsersPage_DdlTkufa');
    const taxYears = await getSelectOptions(
      page,
      'select#ContentUsersPage_DdlTkufa > option'
    );

    await page.browser().close();

    const reports: Report[] = [];

    await Promise.all(
      taxYears.map(async (year) => {
        return await reportsYearHandler(year.value);
      })
    ).then((reportsLists) => {
      reportsLists.forEach((list) => {
        reports.push(...list);
      });
    });

    reports.sort(
      (a, b) =>
        (_defaultConfig.sortDescending
          ? parseDate(a.submissionPeriod) < parseDate(b.submissionPeriod) && 1
          : parseDate(a.submissionPeriod) > parseDate(b.submissionPeriod) &&
            1) || -1
    );

    return reports;
  } catch (e) {
    throw new Error(`reportsHandler - ${e.message}`);
  }
};

const _defaultConfig: Config = {
  visibleBrowser: false,
  expandData: true,
  sortDescending: false,
};

const newPageByYear = async (year: string): Promise<Page> => {
  try {
    const page = await newHomePage();

    await waitForSelectorPlus(page, '#ContentUsersPage_DdlTkufa');
    await page.select('#ContentUsersPage_DdlTkufa', year);

    return page;
  } catch (e) {
    throw new Error(`newPageByYear - ${e.message}`);
  }
};

const newHomePage = async (): Promise<Page> => {
  try {
    const browser = await puppeteer.launch({
      headless: !_defaultConfig.visibleBrowser,
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

const updateConfig = (config: Partial<Config>): void => {
  if (Object.keys(config).length === 0) {
    return;
  }

  for (const key in config) {
    _defaultConfig[key as keyof Config] = config[
      key as keyof Config
    ] as boolean;
  }
};

const scraper = async (config: Partial<Config> = {}) => {
  try {
    updateConfig(config);

    const reports = await reportsHandler();

    if (reports) {
      console.log('SUCCESS!');
    }
  } catch (e) {
    console.log(e);
    throw new Error(`VatScraper - ${e.message}`);
  }
};

scraper();
