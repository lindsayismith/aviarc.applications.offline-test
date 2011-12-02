package testoffline.widgets;

import com.aviarc.framework.toronto.widget.DefaultWidgetProviderImpl;
import com.aviarc.framework.toronto.widget.ElementCompilationController;

/**
 * The default implementation of WidgetProvider for the Toronto system.  
 * 
 * The DefaultWidgetProviderImpl uses the system of having an ElementCompilationController and a
 * RenderingController to controller the compilation and rendering process.  Subclasses of this
 * class will typically change the implementations of these to provide the widget customizations.
 * 
 * The makeControllers() method is called during the initialize method and it is expected that
 * the setRenderingController and setElementCompilationHelper methods will be called from this
 * method to provide the implementations of these interfaces.
 * 
 * This class provides the DefaultElementImpl class to screen compilation, which is given a 
 * reference to the ElementCompilationController created during the initialize method.  Typically
 * the ElementCompilationController will itself have a reference to the RenderingController to be
 * used at render time.     
 * 
 * 
 * @author Lindsay Smith 3/04/2009
 *
 */
public class AddCacheManifestWidgetProviderImpl extends DefaultWidgetProviderImpl {
   
   @Override
   protected ElementCompilationController makeElementCompilationController() {        
            return new AddCacheManifestCompilationControllerImpl(getDefaultDefinitionFile(), 
                                                                 this.getInitializationContext().getClassLoader(),
                                                                 this.getRenderingController());                
   }
}

