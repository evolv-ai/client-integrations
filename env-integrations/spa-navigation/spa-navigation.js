

function waitFor(check, invoke, poll){
  if (!poll){
      poll = {}
  }
  if (check()){
      invoke();
      return;
  }
  var polling = setInterval(function(){
    try{
      if (check()){
        invoke();
        clearInterval(polling);
        polling = null;
      }
    } catch(e){console.info('listener not processed')}
  }, poll.interval || 50)
  setTimeout(function(){ 
      if (!polling) return
      
      clearInterval(polling)     
      console.info('listener timeout')
  }, poll.duration || 2000)
}


function handlePushState(client, renderDelay) {
	const pushStateOrig = history.pushState;
	const replaceStateOrig = history.replaceState;

	function updateContext() {
	    setTimeout(function(){
		client.context.set('web.url', window.location.href);
	    }, renderDelay || 0)
	}

	function handler(orig) {
		const args = Array.prototype.slice.call(arguments, 1);
		orig.apply(history, args);

		let event;
		const eventType = 'stateupdate_evolv';
		if (Event.prototype.constructor) {
			event = new CustomEvent(eventType, {});
		} else { // For IE Compatibility
			event = document.createEvent('Event');
			event.initEvent(eventType);
		}

		window.dispatchEvent(event);
	}

	history.pushState = handler.bind(this, pushStateOrig);
	history.replaceState = handler.bind(this, replaceStateOrig);

	window.addEventListener('popstate', updateContext);
	window.addEventListener('stateupdate_evolv', updateContext);
}

function pageMatch(page){
  if (!page) return false;

  return new RegExp(page).test(location.pathname);
}

function getEvolv(){
  return window.evolv;
}

function processNav(config){
  var pages = config.pages || [];
  var matches = pages.some(pageMatch);
  var renderDelay = config.renderDelay || 0;

  if (matches){
    waitFor(getEvolv, function(){handlePushState(window.evolv.client, renderDelay)}, config.poll);
  }
}

module.exports = processNav;