/**
 * Wait for {delay} ms
 * @param delay in milliseconds
 */
export const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const retry = (
  task: <T>() => Promise<T>,
  delay: number,
  retries = Number.POSITIVE_INFINITY,
) =>
  new Promise((resolve, reject) =>
    task()
      .then(resolve)
      .catch((reason) =>
        retries > 0
          ? wait(delay)
              .then(retry.bind(null, task, delay, retries - 1))
              .then(resolve)
              .catch(reject)
          : reject(reason),
      ),
  );
