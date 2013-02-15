/*global
YAHOO
*/

(function () {

    YAHOO.namespace("testOffline");
    var testOffline = YAHOO.testOffline;
    var Toronto = YAHOO.com.aviarc.framework.toronto;

    testOffline.PullDatasetsFromStorage = function () {
        
    };

    YAHOO.lang.extend(testOffline.PullDatasetsFromStorage, Toronto.framework.DefaultActionImpl, {

        run: function (state) {
          if (YAHOO.lang.isUndefined(localStorage)) {
                throw new Error("client-side internalStorage not supported");
            }                
            
            // Might need to be more specific than just 'all datasets' here, but this
            // should do for now.  This is a hack to get at them all, probably not the right list.


            var datasets = localStorage.getItem(this.getStorageKey());
            if (YAHOO.lang.isUndefined(datasets)) {
                throw new Error("No data exists in local storage under key: " + this.getStorageKey());
            }
            datasets = JSON.parse(datasets);
            
            var dataset, datasetJSON;            
            for (var name in datasets) {
                if (YAHOO.lang.hasOwnProperty(datasets, name)) {
                    datasetJSON = datasets[name];
                    dataset = state.getApplicationState().getDatasetStack().findDataset(name);
                    if (dataset !== null) {
                        this.loadDatasetFromJSON(dataset, datasetJSON);
                        //dataset.fromJSON(datasetJSON);            
                    }
                }
            }                                    
        },
        
        
        loadDatasetFromJSON: function(dataset, datasetJSON) {
            // What I want to do here is emulate what happens when you replace the contents
            // of the dataset.  So ideally we would suspend all events, make changes, then 
            // turn them all on again. For now ommitting the suspend stuff
            // Delete all rows
            dataset.deleteAllRows();
            var newCR = datasetJSON.currentRowIndex;
            var rows = datasetJSON.rows;
            var row,values,commitAction, field;
            var newRow;
            for (var i = 0; i < rows.length; i++) {                
                row = rows[i];
                newRow = dataset.createRow();

                commitAction = row.commitAction;
                newRow.setCommitAction(commitAction);

                values = row.values;
                for (var j = 0; j < values.length; j++) {
                    field = values[j];
                    for (name in field) {
                        if (YAHOO.lang.hasOwnProperty(field, name)) {
                            newRow.setField(name, field[name]);
                        }
                    }
                }
            }
            
            dataset.setCurrentRowIndex(parseInt(newCR));
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
