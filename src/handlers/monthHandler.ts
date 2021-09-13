import { Page } from 'puppeteer';
import { newPageByYear } from '../utils/browserUtil.js';
import {
  getReportDetails,
  getReportExpansionTitle,
} from '../utils/evaluationFunctions.js';
import { waitAndClick, waitForSelectorPlus } from '../utils/pageUtil.js';
import {
  Config,
  Report,
  ReportDetails,
  ReportExpansion,
} from '../utils/types.js';
import { UserPrompt } from '../utils/userPrompt.js';
import { MonthDealsHandler } from './monthDealsHandler.js';
import { MonthFixesHandler } from './monthFixesHandler.js';
import { MonthInputsHandler } from './monthInputsHandler.js';

export class MonthHandler {
  private config: Config;
  private prompt: UserPrompt;
  private location: string[];
  private report: Report;
  private index: number;

  constructor(
    config: Config,
    prompt: UserPrompt,
    location: string[],
    report: Report,
    index: number
  ) {
    this.config = config;
    this.prompt = prompt;
    this.location = [...location, report.submissionPeriod.substr(0, 2)];
    this.report = report;
    this.index = index;
  }

  public handle = async (): Promise<Report | undefined> => {
    try {
      // get report details
      this.prompt.update(this.location, 'Fetching details');
      this.report.additionalDetails =
        await this.getReportAdditionalDetails().catch((e: Error) => {
          this.prompt.addError(this.location, e.message);
          return undefined;
        });

      // get report expansion
      if (this.config.expandData) {
        this.prompt.update(this.location, 'Fetching expanded data');
        this.report.reportExpansion = await this.getExpansions();
      }

      this.prompt.update(this.location, 'Done');
      return this.report;
    } catch (e) {
      this.prompt.addError(this.location, (e as Error)?.message || e);
      return;
    }
  };

  private getReportAdditionalDetails = async (): Promise<ReportDetails> => {
    const page = await newPageByYear(
      this.config.visibleBrowser,
      this.location[0]
    );

    const selector = `#dgDuchot > tbody > tr:nth-child(${
      this.index + 2
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
  };

  private getExpansions = async () => {
    try {
      this.prompt.update(this.location, 'Fetching expansion');

      const page = await newPageByYear(
        this.config.visibleBrowser,
        this.location[0]
      );

      const reportExpansion = await this.getReportExpansion(page);
      if (!reportExpansion) {
        return;
      }

      // get inputs
      reportExpansion.inputs = await new MonthInputsHandler(
        this.config,
        this.prompt,
        this.location,
        this.index
      ).handle();

      // get deals
      reportExpansion.deals = await new MonthDealsHandler(
        this.config,
        this.prompt,
        this.location,
        this.index
      ).handle();

      // get fixes
      reportExpansion.fixedInvoices = await new MonthFixesHandler(
        this.config,
        this.prompt,
        this.location,
        this.index
      ).handle();

      // await waitAndClick(page, '#ContentUsersPage_btnGoBack');

      await page.browser().close();

      return reportExpansion;
    } catch (e) {
      this.prompt.addError(
        [...this.location, 'Expansions'],
        (e as Error)?.message || e
      );
      return;
    }
  };

  private getReportExpansion = async (
    page: Page
  ): Promise<ReportExpansion | undefined> => {
    const location = [...this.location, 'Title'];
    try {
      const selector = `#dgDuchot > tbody > tr:nth-child(${
        this.index + 2
      }) > td:nth-child(1) > a`;
      await waitAndClick(page, selector);

      // get title
      this.prompt.update(location, 'Fetching title...');
      await waitForSelectorPlus(page, '#shaamcontent');

      const titleTable = await waitForSelectorPlus(
        page,
        '#shaamcontent > table > tbody > tr:nth-child(2) > td > table'
      );
      if (!titleTable) {
        this.prompt.addError(location, 'Error fetching title');
        return;
      }

      const reportExpansion: ReportExpansion = await page.evaluate(
        getReportExpansionTitle,
        titleTable
      );

      this.prompt.update(location, 'Done');
      return reportExpansion;
    } catch (e) {
      this.prompt.addError(location, (e as Error)?.message || e);
      return;
    }
  };
}
