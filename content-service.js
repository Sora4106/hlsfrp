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
  };
})();
