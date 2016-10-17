var globals = require('./globals'),
    utils = require('./utils'),
    Helpers = require('./helpers'),
    Plumbing = require('./plumbing');

var instanceId = 0;    
    
/**
 * @ngdoc function
 * @name familysearch.types:constructor.FamilySearch
 *
 * @description
 * Initialize the FamilySearch object
 *
 * **Options**
 *
 * - `client_id` - the developer key you received from FamilySearch
 * - `environment` - sandbox, staging, or production
 * - `redirect_uri` - the OAuth2 redirect uri you registered with FamilySearch.  Does not need to exist,
 * but must have the same host and port as the server running your script;
 * however, it must exist for mobile safari - see the Overview section of the documentation
 * - `pending_modifications` - an array of pending modifications that should be enabled for all requests. 
 * __Warning__: When pending modifications are enabled on the client, all requests will require a preflight request.
 * See the [CORS spec](http://www.w3.org/TR/cors/#cors-api-specifiation-request) for more details.
 * - `auto_expire` - set to true if you want to the system to clear the access token when it has expired
 * (after one hour of inactivity or 24 hours, whichever comes first; should probably be false for node.js)
 * - `auto_signin` - set to true if you want the user to be prompted to sign in whenever you call an API function
 * without an access token; must be false for node.js, and may result in a blocked pop-up if the API call is
 * not in direct response to a user-initiated action; because of the blocked pop-up issue, you may want to use `expire_callback` instead
 * - `expire_callback` - pass in a function that will be called when the access token expires
 * - `save_access_token` - set to true if you want the access token to be saved and re-read in future init calls
 * (uses a session cookie, must be false for node.js) - *setting `save_access_token` along with `auto_signin` and
 * `auto_expire` is very convenient*
 * - `access_token` - pass this in if you already have an access token
 * - `debug` - set to true to turn on console logging during development
 *
 * @param {Object} opts opts
 */
var FS = module.exports = function(opts){

  var self = this;
  self.settings = utils.extend(self.settings, globals);
  self.settings.instanceId = ++instanceId;

  self.helpers = new Helpers(self);
  self.plumbing = new Plumbing(self);
  
  opts = opts || {};

  if(!opts['client_id'] && !opts['app_key']) {
    throw 'client_id must be set';
  }
  self.settings.clientId = opts['client_id'] || opts['app_key']; //app_key is deprecated

  if(!opts['environment']) {
    throw 'environment must be set';
  }
  
  self.settings.environment = opts['environment'];
  self.settings.redirectUri = opts['redirect_uri'] || opts['auth_callback']; // auth_callback is deprecated
  self.settings.autoSignin = opts['auto_signin'];
  self.settings.autoExpire = opts['auto_expire'];

  if(opts['save_access_token']) {
    self.settings.saveAccessToken = true;
    self.helpers.readAccessToken();
  }

  if(opts['access_token']) {
    self.settings.accessToken = opts['access_token'];
  }
  
  if(opts['pending_modifications'] && utils.isArray(opts['pending_modifications'])){
    self.settings.pendingModifications = opts['pending_modifications'].join(',');
  }

  self.settings.debug = opts['debug'];
  
  self.settings.collectionsPromises = {
    collections: self.plumbing.get(self.settings.collectionsUrl)
  };

  self.settings.expireCallback = opts['expire_callback'];

};
    
// These modules contain functions which extend 
// the FamilySearch prototype to provide api functionality
require('./modules/authorities');
require('./modules/authentication');
require('./modules/changeHistory');
require('./modules/discussions');
require('./modules/memories');
require('./modules/notes');
require('./modules/ordinances');
require('./modules/parentsAndChildren');
require('./modules/pedigree');
require('./modules/persons');
require('./modules/places');
require('./modules/searchAndMatch');
require('./modules/sourceBox');
require('./modules/sources');
require('./modules/spouses');
require('./modules/users');
require('./modules/utilities');

// These files contain class definitions
require('./classes/base');
require('./classes/agent');
require('./classes/attribution');
require('./classes/change');
require('./classes/childAndParents');
require('./classes/collection');
require('./classes/comment');
require('./classes/couple');
require('./classes/date');
require('./classes/discussion');
require('./classes/discussionRef');
require('./classes/fact');
require('./classes/gender');
require('./classes/memoryArtifactRef');
require('./classes/memoryPersona');
require('./classes/memoryPersonaRef');
require('./classes/memory');
require('./classes/name');
require('./classes/note');
require('./classes/person');
require('./classes/placeDescription');
require('./classes/placeReference');
require('./classes/placesSearchResult');
require('./classes/searchResult');
require('./classes/sourceDescription');
require('./classes/sourceRef');
require('./classes/textValue');
require('./classes/user');
require('./classes/vocabularyElement');
require('./classes/vocabularyList');

// Plumbing
extendFSPrototype('plumbing', 'del');
extendFSPrototype('plumbing', 'get');
extendFSPrototype('plumbing', 'getTotalProcessingTime');
extendFSPrototype('plumbing', 'getUrl');
extendFSPrototype('plumbing', 'http');
extendFSPrototype('plumbing', 'post');
extendFSPrototype('plumbing', 'put');
extendFSPrototype('plumbing', 'setTotalProcessingTime');

function extendFSPrototype(moduleName, functionName){
  FS.prototype[functionName] = function(){
    return this[moduleName][functionName].apply(this[moduleName], arguments);
  };
}
