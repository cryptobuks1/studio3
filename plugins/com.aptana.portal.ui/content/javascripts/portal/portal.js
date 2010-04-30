/**
 * This script manages the portal observer-observable event mechanism.
 */
// Constants
var Events = {ERROR : 'error', RECENT_FILES : 'recentFiles', PLUGINS : 'plugins', GEMS : 'gemList'};
var ConfigurationStatus = {UNKNOWN : 'unknown', OK : 'ok', PROCESSING : 'processing', ERROR : 'error'};

/**
 * The Portal class
 */
var Portal = Class.create({
  initialize: function() {
    this.plugins = new Plugins();
    this.files   = new Files();
    this.gems   = new Gems();
    this.plugins.render($('plugins'));
    this.files.render($('recentFiles'));
    this.gems.render($('gems'));
  }
});

var portal;

// Add observers to the dispatcher
eventsDispatcher.addObserver(Events.RECENT_FILES, function(e) { portal.files.render($('recentFiles')); });
eventsDispatcher.addObserver(Events.GEMS, function(e) { portal.gems.render($('gems'), e); });
eventsDispatcher.addObserver(Events.PLUGINS, function(e) { portal.plugins.render($('plugins'), e); });

/**
 * This custom error handler is needed when the Portal is viewed in the 
 * Studio internal browser.
 * The Studio is the one that makes the call to hook the window.onerror event to this handler.
 */
function customErrorHandler(desc,page,line) {
 alert(
  'A JavaScript error occurred! \n'
 +'\nError: \t'+desc
 +'\nURL:      \t'+page
 +'\nLine number:       \t'+line
 );
 // make sure we return false, so the error will also propogate to other
 // error handlers, such as firebug.
 return false;
}

function loadPortal() {
  if (!portal) {
    portal = new Portal();
  }
}

// Returns an element that contains informative text about running this portal outside the studio
function _studioOnlyContent() {
	return Elements.Builder.div({'class' : 'unavailable'}, 'Content only available inside Aptana Studio');
}

// Remove all the descendants from the parent element
function _clearDescendants(parentElement) {
	if (parentElement) {
		var descendants = parentElement.descendants();
		var items_count = descendants.size();
        for( var i = 0; i < items_count; i++ ) {
			descendants[i].remove();
		}
	}
}
function _isErrorStatus(jsonContent) {
	return jsonContent.event == Events.ERROR;
}

/**
 * Returns a DIV with an error details. 
 * The error details will appear only if the jsonError contains an errorDetails in its data hash.
 */
function _errorStatus(jsonError) {
	var d;
	with(Elements.Builder) {
		d = div({'class' : 'errorStatus'}, div({'class' : 'errorTitle'}, 'An error occured'));
		if (jsonError.data.errorDetails) {
			d.appendChild(div({'class' : 'errorDetails'}, jsonError.data.errorDetails));
		}
	}
	return d;
}

/**
 * Show a tooltip for the plug-in details.
 */
function _showTooltip(event) {
  var pid = event.target.getAttribute('pluginId');
  var pMinVersion = event.target.getAttribute('minVersion');
  var pInstalledVersion = event.target.getAttribute('installedVersion');
  var pStatus = event.target.getAttribute('pluginStatus');
  var ttHtml = '<div><b>Plugin-ID:</b> ' + pid + '</div>';
  if (pStatus) {
    switch (pStatus) {
      case 'install':
        ttHtml += '<div><b>Version:</b> ' + pMinVersion + '</div><div><b>Status:</b> This plugins is not installed</div>';
      break;
      case 'ok':
        ttHtml += '<div><b>Version:</b> ' + pInstalledVersion + '</div><div><b>Status:</b> This plugins is installed</div>';
      break;
      case 'update':
        ttHtml += '<div><b>Version:</b> ' + pInstalledVersion + '</div><div><b>Status:</b> This plugins is installed but needs to be updated to version '+pMinVersion+'</div>';
      break;
    }
  }
  tooltip.show(ttHtml);
}

 