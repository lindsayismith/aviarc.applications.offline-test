/*global
YAHOO
*/

(function () {
    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;
    
    var INITIAL = "Initial";
    var OFFLINE = "Offline";
    var TESTING = "Testing";
    var ONLINE = "Online";
    
    var INTERNAL_TIMEOUT = 3000;

    testOffline.OfflineStatusDetection = function() {
        this._status = INITIAL;
        
        this.onOnlineDetected = new Toronto.client.Event("offline-status-detection onOnlineDetected");
        this.onOfflineDetected = new Toronto.client.Event("offline-status-detection onOfflineDetected ");
    };
    
    var wrapDataContextFunctionsOverride = function(o, proto) {
            var item;
            for (var i in o) {
                item = o[i];
                if (YAHOO.lang.isFunction(item) && !proto[i] && (i.charAt(0) != "_")) {
                    this[i] = this._registerWrappingFunction(i, o);
                }

            }
    };

    YAHOO.lang.extend(testOffline.OfflineStatusDetection, Toronto.framework.DefaultWidgetImpl, {
        // The 'startup' method may be deleted if it is not required, the method from DefaultWidgetImpl will be used
        // Removing the superclass.startup method call may prevent your widget from functioning
        startup: function (widgetContext) {
            testOffline.OfflineStatusDetection.superclass.startup.apply(this, arguments);
            
            // If navigator says we are offline, then we are.
            if (navigator.onLine) {
                this.setStatus(TESTING);
            } else {
                this.setOffline();                               
            }
            
            // Do an ajax call to our reconnect timeline, if this succeeds, we are online.
            // If it doesn't, we are offline
            this.doReconnect();  
        },
        
        setOnline: function() {
            this.setStatus(ONLINE);  
            this.onOnlineDetected.fireEvent({ widget: this });
        },
                
        setOffline: function() {
            this.setStatus(OFFLINE);  
            this.onOfflineDetected.fireEvent({ widget: this });
        },
        
        setStatus: function(status) {
            
            this.removeClass(this._status);
            
            this._status = status;
            this.getContainerElement().innerHTML = status;
            
            this.addClass(status);
        },

        // The 'bind' method may be deleted if it is not required, the method from DefaultWidgetImpl will be used
        // Removing the superclass.bind method call may prevent your widget from functioning
        bind: function (dataContext) {
            testOffline.OfflineStatusDetection.superclass.bind.apply(this, arguments);
        },

        refresh: function () {
            
        },
    
         getStyledElements: function () {
                return [
                    this.getContainerElement()
                ];
        },
        
        doReconnect: function () {

            var me = this;
            var handler = {
                success: function(response) { me.success(response); },
                failure: function(response) { me.failure(response); },
                timeout: function(response) { me.failure(response); }                
            };
            // This ensures that this request is not considered ajax, and so doesn't return a redirect
            YAHOO.util.Connect.initHeader('X-Requested-With', 'NotAjax');
            var c = new Toronto.internal.ajax.AjaxRequest("GET", 
                                                          function() { return "./?disableappcache=y" }, 
                                                          handler);
                                                          
            // Internal timeout             
            this._timeout = setTimeout(function() { me.failure(); }, INTERNAL_TIMEOUT);                                                                                     
            c.send();                                                         

        },
        
        failure: function(response) {
            clearTimeout(this._timeout);
            //console.log("FAILURE");
            this.setOffline();
        },
        
        success: function(response) {
            clearTimeout(this._timeout);
            //console.log("DONE");
            //console.log(response.responseText);
            /*
             First time we'll get a redirect...
             <ajaxresponse><redirect suppressTimer="n">12A383A1D7956553E2FE19D331B2D26F</redirect></ajaxresponse>
                
             There are a couple of things that we need:
             Toronto.internal.init.setServerStateKID('2660B11E6FE80858A424D8DF7C916FB3');
              
             And possibly the entire datacontext tree:
             <script name="toronto-datacontexts" type="text/javascript"> ... </script>
            */           
            /*var redirectRegexp = new RegExp('<redirect suppressTimer="n">(.*)</redirect>');
            var matches = redirectRegexp.exec(response.responseText);
            if (matches.length !== 0) {
                var redirectURL = matches[1];
                var me = this;
                var handler = {
                    success: function(response) { me.success(response); }
                };
                var c = new Toronto.internal.ajax.AjaxRequest("GET", 
                                                              function() { return "./" + redirectURL; }, 
                                                              handler);
                c.send();
                return;
           }*/
            // otherwise lets carry on
            var kidRegexp = /setServerStateKID\('(.*)'\)/;
            var matches = kidRegexp.exec(response.responseText);
            var newKID;
            if (matches.length === 0) {
                throw new Error("No KID found in response text");
            } else {
                newKID = matches[1];
            }
            //console.log("new KID: " + newKID);
            Toronto.internal.GlobalState.setServerStateKID(newKID);
            //console.log("set....");
            
            // Now we have to take the data context tree and replace the IDs in our own tree with the 
            // ones from le server.  If we dont' do this, then the postback fails as the data context updates
            // are keyed by their id.
            // It looks like this in the page:
            /*
            <script name="toronto-datacontexts" type="text/javascript">(function (Toronto) {
            Toronto.internal.init.setDataContexts([{"id":"DD88C1086E7F","datacontext":new Toronto.framework.RootDataContextImpl("DD88C1086E7F",[Toronto.framework.dataset.stateless.StatelessDatasetImpl.makeFromInlineCode({"childViews":{},"id":"3c98813b-44d5-4821-a571-74c3418c3834","dataRuleContexts":{},"name":"data","childDatasets":{},"currentRowIndex":1,"rows":[{"commitAction":"","values":[{"field1":"value11"},{"field2":"value12"}],"rowid":"a3b666dd"},{"commitAction":"","values":[{"field1":"value21"},{"field2":"value22"}],"rowid":"d89b1304"}]},[])]),"children":[]}]);
            })(YAHOO.com.aviarc.framework.toronto);
            </script>
            */
            var rx = /Toronto.internal.init.setDataContexts\((.*)\);/;
            matches = rx.exec(response.responseText);
            
            newDataContexts = eval(matches[1]);
            
            
            /* We need the rules too.  
                I can't get these from the existing page as they aren't in scope anywhere 
                Looks like this: Toronto.internal.init.setDataRules({ ... });
            */
            var rulesRx = /Toronto.internal.init.setDataRules\((.*)\);/;
            matches = rulesRx.exec(response.responseText);
            
            // This is an object literal, needs brackets
            newRules = eval("(" + matches[1] + ")");
                
                        
            
            var widgetTree = Toronto.internal.GlobalState.getWidgetTree();
            var newRootDataContext = newDataContexts[0].datacontext;
         
           
            
            // Replace the datacontext at the root
            widgetTree._dataContextTree.getRootDataContext()._dataContextImpl = newRootDataContext 
            
            // This is required for the new context to be properly visible
            // Assumes the type of the root context, which is brittle
            wrapDataContextFunctionsOverride.call(widgetTree._dataContextTree.getRootDataContext(), 
                                                  newRootDataContext, 
                                                  Toronto.internal.DataContextTreeNode.prototype);
            // startup the new datacontext
            newRootDataContext.startup(Toronto.internal.GlobalState.getTopLevelSystem(), newRules);


            // widget re-initialization
            Toronto.internal.GlobalState.getWidgetTree().bindFromRoot();
            Toronto.internal.GlobalState.getWidgetTree().refreshFromRoot();            
                        
            this.setOnline();
        },
        
        isOnline: function() {
            return (this._status === ONLINE);
        }
    });
    
    YAHOO.lang.augmentProto(testOffline.OfflineStatusDetection, Toronto.util.CssUtils);
})();
