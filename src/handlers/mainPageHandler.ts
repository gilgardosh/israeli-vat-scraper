import { newHomePage } from '../utils/browserUtil.js';
import { parseDate } from '../utils/dates.js';
import { getSelectOptions, waitForSelectorPlus } from '../utils/pageUtil.js';
import { Config, Report } from '../utils/types.js';
import { reportsYearHandler } from './reportHandler.js';

export const homePageHandler = async (config: Config): Promise<Report[]> => {
  try {
    const page = await newHomePage(config);
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
        return await reportsYearHandler(config, year.value);
      })
    ).then((reportsLists) => {
      reportsLists.forEach((list) => {
        reports.push(...list);
      });
    });

    reports.sort(
      (a, b) =>
        (config.sortDescending
          ? parseDate(a.submissionPeriod) < parseDate(b.submissionPeriod) && 1
          : parseDate(a.submissionPeriod) > parseDate(b.submissionPeriod) &&
            1) || -1
    );

    return reports;
  } catch (e) {
    throw new Error(`reportsHandler - ${e.message}`);
  }
};
