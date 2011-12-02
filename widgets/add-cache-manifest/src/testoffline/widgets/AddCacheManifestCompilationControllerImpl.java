package testoffline.widgets;

import com.aviarc.framework.toronto.widget.*;
import com.aviarc.framework.toronto.screen.*;
import com.aviarc.framework.xml.compilation.*;

public class AddCacheManifestCompilationControllerImpl extends DefaultElementCompilationControllerImpl {

    public AddCacheManifestCompilationControllerImpl (final DefaultDefinitionFile definitionFile,
                                                   ClassLoader widgetClassLoader,
                                                   final RenderingController renderingHelper) {                                                    
        super(definitionFile, widgetClassLoader, renderingHelper);
    }
    
    public CompiledWidget makeCompiledWidget(CompiledElementContext<CompiledWidget> compiledCtx,
                                             CompilationContext context) {     
        return new AddCacheManifestCompiledWidgetImpl(compiledCtx, getRenderingController());        
    }

}
