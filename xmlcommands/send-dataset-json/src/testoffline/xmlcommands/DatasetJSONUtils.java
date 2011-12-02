package testoffline.xmlcommands;

import org.json.JSONArray;
import org.json.JSONObject;

import com.aviarc.core.dataset.Dataset;
import com.aviarc.core.dataset.DatasetRow;
import com.aviarc.framework.dataset.DatasetImpl;
import com.aviarc.framework.dataset.DatasetRowImpl;

public class DatasetJSONUtils {
    public static String toJSON(Dataset ds) throws Exception {
        JSONObject result = new JSONObject();
        
        DatasetImpl di = (DatasetImpl)ds;
        
        result.put("name", ds.getName());
        result.put("currentRowIndex", ds.getCurrentRowIndex());
                        
        
        JSONArray rows = new JSONArray();
        result.put("rows", rows);
        
        JSONObject rowObject;
        DatasetRowImpl ri;   
        JSONObject fields;
        for (int index = 0; index < ds.getRowCount(); index++) {
            ri = (DatasetRowImpl)ds.getRow(index);
            rowObject = new JSONObject();
            rowObject.put("commitAction", ri.getCommitAction().getActionString());
            rowObject.put("originalIndex", index);
            
            fields = new JSONObject();
            rowObject.put("values", fields);
            
            for (String fieldName : ri.getFieldNames()) {
                fields.put(fieldName, ri.getField(fieldName));
            }            
        }
        
        return result.toString();
    }
}
 
/**

var result = { name: this.getName(),
currentRowIndex: this._currentRowIndex, 
nextRowID: this._currentRowID };
var rows = [];
result.rows = rows;
var row, rowObject, fields, fieldNames;
for (var r = 0; r < this._rows.length; r++) {
row = this._rows[r];
fields = {};

rowObject = { commitAction: row.getCommitAction(),
    rowid: row._rowID,
    originalIndex: row._originalIndex,
     values: fields };

fieldNames = row.getFieldNames();
for (var f = 0; f < fieldNames.length; f++) {
fields[fieldNames[f]] = row.getField(fieldNames[f]);
}
rows.push(rowObject);
}
return result;

**/