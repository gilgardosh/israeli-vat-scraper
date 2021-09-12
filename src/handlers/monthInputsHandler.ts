import { newPageByMonth } from '../utils/browserUtil.js';
import { getReportExpansionInputs } from '../utils/evaluationFunctions.js';
import { waitAndClick, waitForSelectorPlus } from '../utils/pageUtil.js';
import { Config, ReportInputs } from '../utils/types.js';
import { UserPrompt } from '../utils/userPrompt.js';
import { monthExpansionTransactionsHandler } from './monthExpansionTransactionsHandler.js';

export class MonthInputsHandler {
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
    this.location = [...location, 'Inputs'];
    this.index = index;
  }

  public handle = async (): Promise<ReportInputs | undefined> => {
    this.prompt.update(this.location, 'Fetching...');
    try {
      const page = await newPageByMonth(
        this.config.visibleBrowser,
        this.location[0],
        this.index
      );

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
        if (
          inputsData[key as keyof ReportInputs].received.transactionsNum > 0
        ) {
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
            const transactionsHandler = new monthExpansionTransactionsHandler(
              this.prompt,
              this.location,
              page,
              index
            );
            inputsData[key as keyof ReportInputs].received.transactions =
              await transactionsHandler.handle();
            [];
          }
        }
      }

      this.prompt.update(this.location, 'Done');
      return inputsData;
    } catch (e) {
      this.prompt.addError(this.location, e);
      return;
    }
  };
}
