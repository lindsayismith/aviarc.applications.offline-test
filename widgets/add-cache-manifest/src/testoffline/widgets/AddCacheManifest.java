package testoffline.widgets;
 
import org.w3c.dom.Element;
import org.w3c.dom.Node;
 
import com.aviarc.core.dataset.DatasetFieldName;
import com.aviarc.core.dataset.DatasetStack;
import com.aviarc.framework.toronto.screen.CompiledWidget;
import com.aviarc.framework.toronto.screen.RenderedNode;
import com.aviarc.framework.toronto.screen.ScreenRenderingContext;
import com.aviarc.framework.toronto.widget.DefaultDefinitionFile;
import com.aviarc.framework.toronto.widget.DefaultRenderedNodeFactory;
import com.aviarc.framework.toronto.widget.DefaultRenderedWidgetImpl;
import com.aviarc.framework.xml.compilation.ResolvedElementContext;
import com.aviarc.framework.toronto.screen.ScreenRequirementsCollector;
 
public class AddCacheManifest implements DefaultRenderedNodeFactory {   
    private DefaultDefinitionFile _definition;
  
    /*
     * (non-Javadoc)
     * @see com.aviarc.framework.toronto.widget.DefaultRenderedNodeFactory#initialize(com.aviarc.framework.toronto.widget.DefaultDefinitionFile)
     */
    public void initialize(DefaultDefinitionFile definitionFile) {
        // Store the definition - our rendered node class requires it as it derives from DefaultRenderedNodeImpl
        this._definition = definitionFile;        
    }
 
    /*
     * (non-Javadoc)
     * @see com.aviarc.framework.toronto.widget.RenderedNodeFactory#createRenderedNode(com.aviarc.framework.xml.compilation.ResolvedElementContext, com.aviarc.framework.toronto.screen.ScreenRenderingContext)
     */
    public RenderedNode createRenderedNode(ResolvedElementContext<CompiledWidget> elementContext,
                                           ScreenRenderingContext renderingContext) {          
        return new AddCacheManifestImpl(elementContext, renderingContext, _definition);            
    }
 
    /**
     * Our custom implementation of RenderedNode.  
     * 
     * It derives from DefaultRenderedNodeImpl so that all the normal behaviour for widgets, e.g. javascript
     * constructors, requirements registering, required datasets etc are taken from the definition file.
     * 
     * We override the HTML generation method to provide our own markup.
     * 
     */
    public static class AddCacheManifestImpl extends DefaultRenderedWidgetImpl {
 
        private String _disableAppCache;

        public AddCacheManifestImpl(ResolvedElementContext<CompiledWidget> resolvedContext,
                                            ScreenRenderingContext renderingContext, 
                                            DefaultDefinitionFile definition) {
            super(resolvedContext, renderingContext, definition);             
            this._disableAppCache = renderingContext.getCurrentState().getRequestState().getCurrentRequest().getParameterValue("disableappcache");
            
        }
 
 
        /**
         * Overridden to generate custom markup.
         */
        @Override
        public Node createXHTML(XHTMLCreationContext context) {
            // Use the current document to create an element
            Element div = context.getCurrentDocument().createElement("DIV");            
            div.setAttribute("id", String.format("%1$s:container", getAttributeValue("name")));
            return div;
        }
        
        @Override
        public void registerRequirements(ScreenRequirementsCollector collector) {
            super.registerRequirements(collector);
            
            if ("y".equals(this._disableAppCache)) {
                return;            
            }
            collector.requireManifest();
            
            String name, value;
            for (ResolvedElementContext<CompiledWidget> e : 
                    this.getResolvedElementContext().getSubElements("manifest-parameter")) {
                name = e.getAttribute("name").getResolvedValue();
                value = e.getAttribute("value").getResolvedValue();
                collector.requireManifestParameter(name, value);
            }
            
            
        }

    }
}

