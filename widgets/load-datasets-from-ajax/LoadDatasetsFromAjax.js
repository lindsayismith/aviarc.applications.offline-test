/*global
YAHOO
*/

(function () {

    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    testOffline.LoadDatasetsFromAjax = function () {
        
    };
    
    
    /**
     * General function for retrieving cookie value.
     * If there is more than one cookie with the same name but different paths, it is unspecified which one
     * will be returned (browser doesn't tell us the paths!)
     *
     * @param unset If true, delete the cookie after retrieval if it is present. This only works for pathless cookies:
     *     for others, the path must be known to delete them - see unset_cookie.
     */
    function get_cookie(cookie_name, unset) {
      var allCookies = document.cookie.split(";");
      var target = null;
      for (var i = 0; i < allCookies.length; i = i + 1) {
          var next = allCookies[i].trim();

          if ((next.indexOf(cookie_name) === 0) && next.indexOf("=") === cookie_name.length) {
              target = next;
          }
      }
      // Target now contains exactly the cookie we want or is empty
      if (target !== null) {
          var index1 = target.indexOf("=");
          var index2 = target.indexOf(";");
          if (index1 === -1) {
              // Malformed cookie - useless so attempt to delete it
              unset_cookie(cookie_name);
              return null;
          }
          if (index2 === -1) {
              index2 = target.length;
          }
          var value = unescape(target.substring(index1 + 1, index2));
          if (unset) {
              unset_cookie(cookie_name);
          }
          return value;
      }
      return null;
    };
    
    function getClientID() {
        return get_cookie("client");
    };    
    
    

    YAHOO.lang.extend(testOffline.LoadDatasetsFromAjax, Toronto.framework.DefaultActionImpl, {

        run: function (state) {
            var url = this.getAttribute("url", state);
            console.log("url: " + url);
            var me = this;
            var successFunc = function() { 
                var response = arguments[0];
                me.handleSuccess(response, state)                 
            };
            
            var failureFunc = function() { console.log("failure"); 
                                            console.log(arguments) };
            
           
            var ajaxRequest = new Toronto.internal.ajax.AjaxRequest('POST', function() { return url }, {
                success: successFunc,
                failure: failureFunc        
            }, "Aviarc.clientID=" + getClientID() );
            
            Toronto.internal.ajax.AjaxConnectionManager.doAjaxRequest(ajaxRequest);
                        
        },
        
        handleSuccess: function(response, state) {
            console.log("new success"); 
            console.log(response)
            
            var responseText = response.responseText;
            
            console.log(responseText);
            var resultObject
            var result = eval("resultObject = " + responseText);
            console.log(resultObject);
            
            // Each dataset..
            var ds, name, ourDs;
            for (i in resultObject) {
                if (YAHOO.lang.hasOwnProperty(resultObject, i)) {
                    ds = resultObject[i];
                    name = i;
                    console.log("processing ds: " + name);
                    ourDs = state.getApplicationState().getDatasetStack().findDataset(name);
                    console.log("ourDs: " + ourDs);                    
                    ourDs.fromJSON(ds.toJSON());
                }   
            }
        }

    });

})();


