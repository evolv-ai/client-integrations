module.exports = function (config) {
  const paramNames = config.paramNameValues;
  const audienceValue = config.audienceValue;
  const keyPrefix = 'evolvParamStore';

  const checkParamExists = (params) => {
    const urlParams = window.location.search;
    let paramFound = false;
    params.forEach((p) => {
      if (urlParams.search(p) > 0) {
        paramFound = true;
      }
    })
    return paramFound;
  }

  const checkLocalStorage = () => {
    return localStorage.getItem(keyPrefix) === audienceValue ? true : false;
  }

  const updateContext = () => {
    let localStorageItem = checkLocalStorage();

    if (!localStorageItem) {
      const hasParam = checkParamExists(paramNames);

      if (hasParam) {
        localStorage.setItem(keyPrefix, audienceValue);
        localStorageItem = checkLocalStorage();
      }
    }

    if (localStorageItem) {
      console.info('[EVOLV] Local storage item FOUND: ' + keyPrefix);
      evolv.context.set(keyPrefix, audienceValue);
    }
  }

  const checkUrlChange = (topic, key) => {
    if (key === 'web.url') {
      updateContext();
    }
  }

  try {
    if (evolv && evolv.client) {
      updateContext();
      evolv.client.on("context.value.added", checkUrlChange);
    }
  } catch (err) {
    console.info('[EVOLV] The Evolv snippet is not available')
  }
}
