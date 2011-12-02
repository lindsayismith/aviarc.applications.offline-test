/*global
YAHOO
*/

(function () {

    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    testOffline.CopyDatasetsToStorage = function () {
        
    };

    YAHOO.lang.extend(testOffline.CopyDatasetsToStorage, Toronto.framework.DefaultActionImpl, {

        run: function (state) {
            if (YAHOO.lang.isUndefined(localStorage)) {
                throw new Error("client-side internalStorage not supported");
            }                
            
            // Might need to be more specific than just 'all datasets' here, but this
            // should do for now.  This is a hack to get at them all, probably not the right list.
            var allDatasets = state.getApplicationState().getDatasetStack()._dataContext.getAllDatasets();

            var datasets = {};
            var dataset;            
            for (var i = 0; i < allDatasets.length; i++) {
                dataset = allDatasets[i];
                datasets[dataset.getName()] = dataset.toJSON();
            }                                    
            
            localStorage.setItem(this.getStorageKey(), JSON.stringify(datasets));                                    
        },
        
        // Create the storage key for this screen of this instance
        // with 'aviarc' as the prefix for good measure
        getStorageKey: function() {
           return "aviarc/" + 
               Toronto.screenMetadata.applicationInstanceID + "/" +
               Toronto.screenMetadata.rootScreenName + "/" +
               "datasets";
        }
        
        
    });

})();
