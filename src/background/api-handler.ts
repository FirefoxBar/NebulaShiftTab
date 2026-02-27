function execute(request: any) {
  if (request.method === 'notifyBackground') {
    request.method = request.reason;
    delete request.reason;
  }
  switch (request.method) {
    default:
      break;
  }
  return false;
}

export default function createApiHandler() {
  chrome.runtime.onMessage.addListener(request => {
    if (request.method === 'batchExecute') {
      const queue = request.batch.map((item: any) => {
        const res = execute(item);
        if (res) {
          return res;
        }
        return Promise.resolve();
      });
      return Promise.allSettled(queue);
    }
    return execute(request);
  });
}
