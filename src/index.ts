import dotenv from 'dotenv';
import { Config, Report, UserCredentials } from './utils/types.js';
import { homePageHandler } from './handlers/mainPageHandler.js';
import {
  getEnvCredentials,
  updateCredentials,
} from './handlers/loginHandler.js';
import { validateSchema } from './utils/schemaValidator.js';
import schema from './vatSchema.json';

dotenv.config();

const _config: Config = {
  visibleBrowser: false,
  expandData: true,
  sortDescending: false,
  validate: true,
};

const updateConfig = (config: Partial<Config>): void => {
  if (Object.keys(config).length === 0) {
    return;
  }

  for (const key in config) {
    _config[key as keyof Config] = config[key as keyof Config] as boolean;
  }
};

const scraper = async (
  credentials?: UserCredentials,
  config: Partial<Config> = {}
): Promise<Report[]> => {
  try {
    updateCredentials(credentials || getEnvCredentials());
    updateConfig(config);

    const reports = await homePageHandler(_config);

    if (_config.validate) {
      const validation = await validateSchema(schema, reports);
      console.log(validation);
    }

    return reports;
  } catch (e) {
    console.log(e);
    throw new Error(`VatScraper - ${e.message}`);
  }
};

export default scraper;
