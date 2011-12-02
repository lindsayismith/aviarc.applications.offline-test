/*global
YAHOO
*/

(function () {

    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    testOffline.ClearLocalStorage = function () {
        
    };

    YAHOO.lang.extend(testOffline.ClearLocalStorage, Toronto.framework.DefaultActionImpl, {

        run: function (state) {
            localStorage.clear();
        }

    });

})();
