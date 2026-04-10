(function () {
  const analyticsId = "0316938315b20fac72ca0ca7d0a7d8aa";
  const stateKey = "__baiduAnalyticsLoaded";
  const delayMs = 1500;

  function loadAnalytics() {
    if (window[stateKey]) return;
    window[stateKey] = true;
    window._hmt = window._hmt || [];
    const script = document.createElement("script");
    script.src = `https://hm.baidu.com/hm.js?${analyticsId}`;
    script.async = true;
    document.head.appendChild(script);
  }

  function scheduleAnalytics() {
    window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadAnalytics, { timeout: 4000 });
        return;
      }
      loadAnalytics();
    }, delayMs);
  }

  if (document.readyState === "complete") {
    scheduleAnalytics();
  } else {
    window.addEventListener("load", scheduleAnalytics, { once: true });
  }
})();
