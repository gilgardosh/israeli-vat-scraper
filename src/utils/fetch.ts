import { Page, SerializableOrJSHandle } from 'puppeteer';

export const fetchPostWithinPage = async <TResult>(
  page: Page,
  url: string,
  data: SerializableOrJSHandle,
  extraHeaders = {}
): Promise<TResult | null> => {
  return page.evaluate(
    (url, data, extraHeaders) => {
      return new Promise<TResult | null>((resolve, reject) => {
        fetch(url, {
          method: 'POST',
          body: JSON.stringify(data),
          credentials: 'include',
          headers: new Headers(
            Object.assign(
              {
                'Content-Type':
                  'application/x-www-form-urlencoded; charset=UTF-8',
              },
              extraHeaders
            )
          ),
        })
          .then((result) => {
            if (result.status === 204) {
              // No content response
              resolve(null);
            } else {
              resolve(result.json());
            }
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    url,
    data,
    extraHeaders
  );
};

export const fetchGetWithinPage = async <TResult>(
  page: Page,
  url: string
): Promise<TResult | null> => {
  return page.evaluate((url) => {
    return new Promise<TResult | null>((resolve, reject) => {
      fetch(url, { credentials: 'include' })
        .then((result) => {
          if (result.status === 204) {
            resolve(null);
          } else {
            resolve(result.json());
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }, url);
};
