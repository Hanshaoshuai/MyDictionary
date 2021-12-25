type Window = Record<string, any>;
declare let window: Window;

enum Status {
  INIT,
  LOADED,
  LOADING,
}

export function loadScript(url: string, nameOnWindow?: string) {
  return new Promise<any>((resolve, reject) => {
    if (!window[url]) {
      window[url] = { status: Status.INIT, callbacks: [] };
    }
    if (window[url].status === Status.LOADED) {
      return resolve(nameOnWindow ? window[nameOnWindow] : undefined);
    }

    if (window[url].status === Status.LOADING) {
      return window[url].callbacks.push(() => {
        resolve(nameOnWindow ? window[nameOnWindow] : undefined);
      });
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onerror = (err) => {
      document.body.removeChild(script);
      reject(err);
    };
    script.onload = () => {
      window[url].status = Status.LOADED;
      window[url].callbacks.forEach((cb: Function) => cb());
      window[url].callbacks = [];

      resolve(nameOnWindow ? window[nameOnWindow] : undefined);
    };

    document.body.appendChild(script);
  });
}
