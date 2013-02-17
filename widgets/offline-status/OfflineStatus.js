/*global
YAHOO
*/

(function () {
    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    testOffline.OfflineStatus = function() {
        
    };

    YAHOO.lang.extend(testOffline.OfflineStatus, Toronto.framework.DefaultWidgetImpl, {
        // The 'startup' method may be deleted if it is not required, the method from DefaultWidgetImpl will be used
        // Removing the superclass.startup method call may prevent your widget from functioning
        startup: function (widgetContext) {
            testOffline.OfflineStatus.superclass.startup.apply(this, arguments);
            
            if (navigator.onLine) {
                this.addClass("online");
            } else {
                this.addClass("offline");
            }
        },

        // The 'bind' method may be deleted if it is not required, the method from DefaultWidgetImpl will be used
        // Removing the superclass.bind method call may prevent your widget from functioning
        bind: function (dataContext) {
            testOffline.OfflineStatus.superclass.bind.apply(this, arguments);
        },

        refresh: function () {
            
        },
        
        getStyledElements: function () {
            return [
                this.getContainerElement()
            ];
        }
    });
    
    YAHOO.lang.augmentProto(testOffline.OfflineStatus, Toronto.util.CssUtils);
})();
