/*global
YAHOO
*/

(function () {

    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    testOffline.IsOnline = function () {
        
    };

    YAHOO.lang.extend(testOffline.IsOnline, Toronto.framework.DefaultActionImpl, {

        run: function (state) {
            // if the browser doesn't support the property, say we're online
            var result = YAHOO.lang.isUndefined(navigator.onLine) ? true : navigator.onLine;
            state.getExecutionState().setReturnValue(result);
        }
    });

})();
