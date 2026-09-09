(function () {
  "use strict";

  /**
   * Content boundary for the site.
   *
   * Today the content is read from the versioned HLS_DATA object. When the
   * Supabase project is ready, replace `getSiteData` with a REST or SDK query
   * and keep the returned object in the same shape. The UI does not need to be
   * rewritten.
   */
  window.HLSContentService = {
    async getSiteData() {
      return window.HLS_DATA;
    },

    async recordVisit() {
      if (location.hostname !== "sora4106.github.io") return null;

      const endpoint = "https://page-views-api.ratneshc.com/api/v1";
      const query = new URLSearchParams({ site: "sora4106.github.io", path: "/hlsfrp/" });
      const tracked = await fetch(`${endpoint}/track?${query}`, {
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      if (!tracked.ok) throw new Error(`Visit tracking failed: ${tracked.status}`);

      const response = await fetch(`${endpoint}/views?${query}`, {
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      if (!response.ok) throw new Error(`Visit count failed: ${response.status}`);
      const result = await response.json();
      return Number.isFinite(Number(result.views)) ? Number(result.views) : null;
    },
  };
})();
