package testoffline.widgets;

import com.aviarc.framework.toronto.widget.*;
import com.aviarc.framework.toronto.screen.*;
import com.aviarc.framework.xml.compilation.*;
import com.aviarc.core.datatype.AviarcBoolean;

public class AddCacheManifestCompiledWidgetImpl extends DefaultCompiledWidgetImpl  {
    public AddCacheManifestCompiledWidgetImpl(final CompiledElementContext<CompiledWidget> compiledElementContext,
                                     final RenderingController renderingHelper) {
        super(compiledElementContext, renderingHelper); 
    }
    
    public void registerCompileTimeRequirements(CompiledScreenRequirementsCollector requirementsCollector) {                
        super.registerCompileTimeRequirements(requirementsCollector);              
        
        for (CompiledElementContext<CompiledWidget> v : this.getCompiledElementContext().getSubElements("manifest-entry")) {
            CompiledElementAttribute url = v.getAttribute("url");
            String urlValue = url.getRawValue();
            
            CompiledElementAttribute addStaticPrefix = v.getAttribute("add-static-prefix");
            String addStaticPrefixValue = addStaticPrefix.getRawValue();
            
            Boolean blnAddStaticPrefix = AviarcBoolean.valueOf(addStaticPrefixValue ).booleanValue();
            requirementsCollector.requireManifestEntry(urlValue, blnAddStaticPrefix);
        }    
    
        for (CompiledElementContext<CompiledWidget> v : this.getCompiledElementContext().getSubElements("manifest-workflow")) {
            CompiledElementAttribute name = v.getAttribute("name");
            String nameValue = name.getRawValue();
                        
            requirementsCollector.requireManifestWorkflow(nameValue);
        }        
    }
}
