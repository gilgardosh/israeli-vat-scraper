import { newHomePage } from '../utils/browserUtil.js';
import { parseDate } from '../utils/dates.js';
import { getSelectOptions, waitForSelectorPlus } from '../utils/pageUtil.js';
import { Config, Report } from '../utils/types.js';
import { UserPrompt } from '../utils/userPrompt.js';
import { YearHandler } from './yearHandler.js';

export const homePageHandler = async (config: Config): Promise<Report[]> => {
  try {
    const prompt = new UserPrompt();

    const page = await newHomePage(config.visibleBrowser);
    console.log('Logged in');

    await waitForSelectorPlus(page, '#ContentUsersPage_DdlTkufa');
    const taxYears = await getSelectOptions(
      page,
      'select#ContentUsersPage_DdlTkufa > option'
    );

    await page.browser().close();

    const reports: Report[] = [];

    const years: Record<number, number[]> = {};
    if (config.years) {
      config.years.forEach((item) => {
        if (typeof item === 'number') {
          years[item] = [];
        } else {
          years[item[0]] = item[1];
        }
      });
    }

    await Promise.all(
      taxYears.map(async (year) => {
        const numYear = parseInt(year.value);
        if (!years || years[numYear]) {
          const months = years[numYear]?.length ? years[numYear] : null;
          const reportsYearHandler = new YearHandler(
            config,
            prompt,
            [year.value],
            months
          );
          return await reportsYearHandler.handle();
        }
        return [];
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

    if (config.printErrors) {
      prompt.printErrors();
    }

    return reports;
  } catch (e) {
    throw new Error(`reportsHandler - ${e}`);
  }
};
