import { newPageByYear } from '../utils/browserUtil.js';
import { getReportsTable } from '../utils/evaluationFunctions.js';
import { waitForSelectorPlus } from '../utils/pageUtil.js';
import { Config, Report } from '../utils/types.js';
import { UserPrompt } from '../utils/userPrompt.js';
import { MonthHandler } from './monthHandler.js';

export class YearHandler {
  private config: Config;
  private prompt: UserPrompt;
  private location: string[];
  private months: number[] | null = null;

  constructor(
    config: Config,
    prompt: UserPrompt,
    location: string[],
    months: number[] | null = null
  ) {
    this.config = config;
    this.prompt = prompt;
    this.location = location;
    this.months = months;
  }

  public handle = async (): Promise<Report[]> => {
    try {
      this.prompt.update(this.location, 'Scraping');

      const baseYearTable = await this.getReportTable();

      if (!baseYearTable || baseYearTable.length === 0) {
        this.prompt.update(this.location, 'Done - No data found');
        return [];
      }

      const reports: Report[] = [];

      await Promise.all(
        baseYearTable
          .filter(
            (report) =>
              !this.months ||
              this.months.includes(
                parseInt(report.submissionPeriod.substr(0, 2))
              )
          )
          .map(async (report: Report, i: number) => {
            const monthHandler = new MonthHandler(
              this.config,
              this.prompt,
              this.location,
              report,
              i
            );

            report = (await monthHandler.handle()) || report;
            return report;
          })
      ).then((reportsList) => {
        reports.push(...reportsList);
      });

      this.prompt.update(this.location, 'Done');
      return reports;
    } catch (e) {
      this.prompt.addError(this.location, (e as Error)?.message || e);
      return [];
    }
  };

  private getReportTable = async (): Promise<Report[]> => {
    try {
      const page = await newPageByYear(
        this.config.visibleBrowser,
        this.location[0]
      );

      await waitForSelectorPlus(page, '#ContentUsersPage_TblDuhot');

      const tableElement = await page.$('#dgDuchot');

      if (!tableElement) {
        return [];
      }

      const table: Report[] = await page.evaluate(
        getReportsTable,
        tableElement
      );

      await page.browser().close();

      return table;
    } catch (e) {
      throw new Error(`getReportsTable - ${e}`);
    }
  };
}
