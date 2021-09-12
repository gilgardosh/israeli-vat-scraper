import { newPageByMonth } from '../utils/browserUtil.js';
import { getReportExpansionDeals } from '../utils/evaluationFunctions.js';
import { waitAndClick, waitForSelectorPlus } from '../utils/pageUtil.js';
import { Config, ReportDeals } from '../utils/types.js';
import { UserPrompt } from '../utils/userPrompt.js';
import { monthExpansionTransactionsHandler } from './monthExpansionTransactionsHandler.js';

export class MonthDealsHandler {
  private config: Config;
  private prompt: UserPrompt;
  private location: string[];
  private index: number;

  constructor(
    config: Config,
    prompt: UserPrompt,
    location: string[],
    index: number
  ) {
    this.config = config;
    this.prompt = prompt;
    this.location = [...location, 'Deals'];
    this.index = index;
  }

  public handle = async (): Promise<ReportDeals | undefined> => {
    this.prompt.update(this.location, 'Fetching...');
    try {
      const page = await newPageByMonth(
        this.config.visibleBrowser,
        this.location[0],
        this.index
      );

      await waitAndClick(page, '#ContentUsersPage_TabMenu1_LinkButton1');

      const dealsTable = await waitForSelectorPlus(page, '#tblSikum');
      const dealsData = await page.evaluate(
        getReportExpansionDeals,
        dealsTable
      );

      // get income transactions
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
            const transactionsHandler = new monthExpansionTransactionsHandler(
              this.prompt,
              this.location,
              page,
              index
            );
            dealsData[key as keyof ReportDeals].received.transactions =
              await transactionsHandler.handle();
            [];
          }
        }
      }

      this.prompt.update(this.location, 'Done');
      return dealsData;
    } catch (e) {
      this.prompt.addError(this.location, e);
      return;
    }
  };
}
