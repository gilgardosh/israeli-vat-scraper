import { Page } from 'puppeteer';
import { newPageByYear } from '../utils/browserUtil.js';
import {
  getReportDetails,
  getReportsTable,
} from '../utils/evaluationFunctions.js';
import { waitAndClick, waitForSelectorPlus } from '../utils/pageUtil.js';
import { Config, Report, ReportDetails } from '../utils/types.js';
import { reportExpansionHandler } from './reportExpansionHandler.js';

export const reportsYearHandler = async (
  config: Config,
  year: string
): Promise<Report[]> => {
  try {
    console.log(`Scraping data for year ${year}`);
    const page = await newPageByYear(config, year);

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
          config,
          year,
          i
        );

        // get report expansion
        if (config.expandData) {
          report.reportExpansion = await reportExpansionHandler(
            config,
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
  config: Config,
  year: string,
  index: number
): Promise<ReportDetails> => {
  try {
    console.log('    Fetching details...');

    const page = await newPageByYear(config, year);

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
