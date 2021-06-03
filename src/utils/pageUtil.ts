import { Page } from 'puppeteer';

export const getSelectOptions = async (
  page: Page,
  selector: string
): Promise<
  {
    name: string;
    value: string;
  }[]
> => {
  const options = await page.evaluate((optionSelector) => {
    return Array.from(document.querySelectorAll(optionSelector))
      .filter((o) => o.value)
      .map((o) => {
        return {
          name: o.text,
          value: o.value,
        };
      });
  }, selector);

  return options;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
