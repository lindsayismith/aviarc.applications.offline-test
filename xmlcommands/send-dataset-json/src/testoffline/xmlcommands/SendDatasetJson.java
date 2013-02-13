package testoffline.xmlcommands;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.servlet.http.HttpServletResponse;

import com.aviarc.core.InterfaceQuery;
import com.aviarc.core.UnsupportedInterfaceException;
import com.aviarc.core.command.Command;
import com.aviarc.core.dataset.Dataset;
import com.aviarc.core.dataset.DatasetPermission;
import com.aviarc.core.exceptions.AviarcRuntimeException;
import com.aviarc.core.exceptions.ExecutionException;
import com.aviarc.core.response.HttpResponse;
import com.aviarc.core.response.HttpResponseContent;
import com.aviarc.core.runtimevalues.RuntimeValue;
import com.aviarc.core.serialization.SerializationID;
import com.aviarc.core.state.State;
import com.aviarc.core.util.JavascriptUtils;
import com.aviarc.framework.toronto.screen.ScreenRenderingContext;
import com.aviarc.framework.toronto.screen.TorontoClientSideCapable;
import com.aviarc.framework.toronto.screen.TorontoClientSideCapableCreator;
import com.aviarc.framework.toronto.widget.NameManager;
import com.aviarc.framework.xml.command.AbstractXMLCommand;
import com.aviarc.framework.xml.compilation.CompiledElementContext;

public class SendDatasetJson extends AbstractXMLCommand {
    private static final long serialVersionUID = 0L;
    private List<RuntimeValue<String>> _datasets;
    
    public SendDatasetJson() {}

    @Override
    public void doInitialize(InitializationContext ctx) {
        _datasets = new ArrayList<RuntimeValue<String>>();
        
        // Get the list of 'dataset' subelements
        for (CompiledElementContext<Command> dataset : ctx.getElementContext().getSubElements("dataset")) {
            _datasets.add(dataset.getAttribute("name").getRuntimeValue());
        }
    }

    @Override
    public void run(State s) {
        final String datasetString = makeDatasetsJavascript(s);
        
        
        HttpResponse response = s.getRequestState().getHttpResponse();
        
                
        
        
        response.sendContent(new HttpResponseContent() {

            public String getContentType() {
                return "application/json";
            }

            public String getFilename() {
                return null;
            }

            public void writeContent(OutputStream out, State state) throws IOException {
                out.write(datasetString.getBytes());
            }

            public void setStatusAndHeaders(HttpServletResponse response, State state) {
                // TODO Auto-generated method stub
                
            }
            
        }, s);
        
        response.setSent();
    }
    
    private Set<Dataset> getRequiredDatasets(State s) {
        List<String> datasets = new ArrayList<String>();        
        for (RuntimeValue<String> rv : _datasets) {
            datasets.add(rv.getValue(s));
        }
        
        Set<Dataset> result = new HashSet<Dataset>();
        for (String dsName : datasets) {
            Dataset d = s.getApplicationState().getDatasetStack().findDataset(dsName);
            result.add(d);                       
        }
        return result;
    }
    
    public String makeDatasetsJavascript(final State s) {
        Set<Dataset> requiredDatasets = getRequiredDatasets(s);

        StringBuilder result = new StringBuilder("{");
        for (Dataset dataset : requiredDatasets) {
            
            // Ensure we're a Toronto dataset
            TorontoClientSideCapableCreator clientSideCreator = null;
            TorontoClientSideCapable clientSideDataset = null;
            try {
               clientSideCreator = InterfaceQuery.queryInterface(dataset, TorontoClientSideCapableCreator.class);
               // Null rendering context... not sure if it matters
               ScreenRenderingContext c = new ScreenRenderingContext() {

                public SerializationID getNextKID() { return null; }

                public State getCurrentState() {
                    return s;
                }

                public NameManager getNameManager() { return null; }

                public boolean isEmbeddedScreen() { return false; }

                public String getContainingScreenName() { return "None"; }
                   
               };
               
               clientSideDataset = clientSideCreator.makeClientSideCapable(c);
            } catch (UnsupportedInterfaceException e) {
                throw new ExecutionException(e);
            }
            
            ensureVisibility(dataset); // throws AviarcRuntimeException
            
            result.append('"').append(JavascriptUtils.escapeString(dataset.getName())).append('"');
            result.append(":");
            result.append(clientSideDataset.getJavascriptDeclaration());
            result.append(",");                        
        }
        
        stripLastComma(result);
        
        result.append("}");

        return result.toString();
    }
    
    private void ensureVisibility(Dataset dataset) {
        if (!dataset.getDatasetMetadata().getDatasetPermissions().hasPermission(DatasetPermission.CLIENT_VISIBLE)) {
            throw new AviarcRuntimeException("Tried to write dataset [" + dataset.getName() + "] that is not visible to clients");
        }
    }
    
   

    private void stripLastComma(StringBuilder builder) {
        int lastIndex = builder.length() - 1;
        try {
            if (builder.charAt(lastIndex) == ',') {
                builder.deleteCharAt(lastIndex);
            }
        } catch (IndexOutOfBoundsException ex) {
            // Ignore
        }
    }

}
