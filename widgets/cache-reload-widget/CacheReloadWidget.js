/*global
YAHOO
*/

(function () {

    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    testOffline.CacheReloadWidget = function () {
        
    };

    YAHOO.lang.extend(testOffline.CacheReloadWidget, Toronto.framework.DefaultWidgetImpl, {

        // The 'startup' method may be deleted if it is not required, the method from DefaultWidgetImpl will be used
        // Removing the superclass.startup method call may prevent your widget from functioning
        startup: function (widgetContext) {
            
            testOffline.CacheReloadWidget.superclass.startup.apply(this, arguments);
            
            // Check if a new cache is available on page load.
            window.addEventListener('load', function(e) {

              window.applicationCache.addEventListener('updateready', function(e) {
                if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                  // Browser downloaded a new app cache.
                  // Swap it in and reload the page to get the new hotness.
                  window.applicationCache.swapCache();
                  if (confirm('A new version of this site is available. Load it?')) {
                    window.location.reload();
                  }
                } else {
                  // Manifest didn't changed. Nothing new to server.
                }
              }, false);

            }, false);
            
        },

        // The 'bind' method may be deleted if it is not required, the method from DefaultWidgetImpl will be used
        // Removing the superclass.bind method call may prevent your widget from functioning
        bind: function (dataContext) {
            
            testOffline.CacheReloadWidget.superclass.bind.apply(this, arguments);
        },

        refresh: function () {
            
        }

    });

})();
