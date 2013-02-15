/*global
YAHOO
*/

(function () {
    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    testOffline.ReconnectTimeline = function () {
        
    };
    
    var wrapDataContextFunctionsOverride = function(o, proto) {
            var item;
            for (var i in o) {
                item = o[i];
                if (YAHOO.lang.isFunction(item) && !proto[i] && (i.charAt(0) != "_")) {
                    console.log("wrapping " + i);
                    this[i] = this._registerWrappingFunction(i, o);
                }

            }
    };

    YAHOO.lang.extend(testOffline.ReconnectTimeline, Toronto.framework.DefaultActionImpl, {
        run: function (state) {

            var me = this;
            var handler = {
                success: function(response) { me.success(response); }
            };
            // This ensures that this request is not considered ajax, and so doesn't return a redirect
            YAHOO.util.Connect.initHeader('X-Requested-With', 'NotAjax');
            var c = new Toronto.internal.ajax.AjaxRequest("GET", 
                                                          function() { return "./?disableappcache=y" }, 
                                                          handler);
            c.send();                                                         
//            YAHOO.util.Connect.initHeader('X-Requested-With', null);
        },
        
        success: function(response) {
            console.log("DONE");
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
            console.log("new KID: " + newKID);
            Toronto.internal.GlobalState.setServerStateKID(newKID);
            console.log("set....");
            
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
                        
            
        }
    });
    
    
})();
