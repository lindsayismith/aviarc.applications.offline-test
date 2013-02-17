/*global
YAHOO
*/

(function () {
    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    var cacheStatusValues = [];
    cacheStatusValues[0] = 'uncached';
    cacheStatusValues[1] = 'idle';
    cacheStatusValues[2] = 'checking';
    cacheStatusValues[3] = 'downloading';
    cacheStatusValues[4] = 'updateready';
    cacheStatusValues[5] = 'obsolete';
    

    testOffline.AppcacheStatus = function() {
        
    };

    YAHOO.lang.extend(testOffline.AppcacheStatus, Toronto.framework.DefaultWidgetImpl, {
        // The 'startup' method may be deleted if it is not required, the method from DefaultWidgetImpl will be used
        // Removing the superclass.startup method call may prevent your widget from functioning
        startup: function (widgetContext) {
            testOffline.AppcacheStatus.superclass.startup.apply(this, arguments);
            
            var applicationCache = window.applicationCache;
            if (YAHOO.lang.isUndefined(applicationCache)) {
                alert("applicationCache is not supported");
            }
            var me = this;
            var eventNames = ['checking', 'noupdate', 'downloading', 'progress', 'cached', 'updateready', 'obsolete', 'error'];
            var eName;
            var bindEvent = function(eName) {
                window.applicationCache.addEventListener(eName, function(e) {
                    if (!YAHOO.lang.isUndefined(me[eName])) {
                        me[eName](e);
                    } else {
                        me.handleEvent(eName, e);
                    }    
                }, false); 
            }
            for (var i = 0; i < eventNames.length; i++) {
                bindEvent(eventNames[i]);                   
            }                        
        },

        // The 'bind' method may be deleted if it is not required, the method from DefaultWidgetImpl will be used
        // Removing the superclass.bind method call may prevent your widget from functioning
        bind: function (dataContext) {
            testOffline.AppcacheStatus.superclass.bind.apply(this, arguments);
        },
        
        handleEvent: function(eName, e) {
            this.addClass(eName);
            
            var online, status, type, message;
            online = (navigator.onLine) ? 'yes' : 'no';
            status = cacheStatusValues[window.applicationCache.status];
            type = e.type;
            message = 'online: ' + online;
            message+= ', event: ' + type;
            message+= ', status: ' + status;
            if (type == 'error' && navigator.onLine) {
                message+= ' (prolly a syntax error in manifest)';
            }
            console.log(message);
        },
        
        refresh: function () {
            
        },
        
        getStyledElements: function () {
            return [
                this.getContainerElement()
            ];
        }
    });
    
    YAHOO.lang.augmentProto(testOffline.AppcacheStatus, Toronto.util.CssUtils);
})();
