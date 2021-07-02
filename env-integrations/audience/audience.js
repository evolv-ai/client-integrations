var audience = {
}
function refreshAudience(){
  window.evolv.context.update(audience);
}

var adapters = {
  expValue(exp){
    var tokens = exp.split('.');
    var result = window;
    
    if (tokens[0] === 'window') tokens = tokens.slice(1);

    while(tokens.length > 0 && result){
      var token = tokens[0];
      tokens = tokens.slice(1)

      if (token.indexOf('(')> 0){
        try{
          token = token.slice(0,-2);
          var fnc = result[token]
          console.info('function', typeof fnc, fnc)
          if (typeof fnc === 'function')
            result = fnc.apply(result, []);
          else
            result = undefined;
        }
        catch{}
      } else {
        result = result[token];
      }
    }
    return result;
  },
  cookieValue: function(name) {
    var cookie = document.cookie.split(';')
        .find(function(item) {return item.trim().split('=')[0] === name })
    if (!cookie) return null;

    return cookie.split('=')[1];
  },
  domValue: function(sel) {
    return document.querySelector(sel)  && 'found';
  },
  jqdomValue: function(sel) {
    return window.$ && ($(sel).length > 0)  && 'found';
  }
}

function getValue(obj){
  if (obj.type === 'expression') return adapters.expValue(obj.value);
  if (obj.type === 'cookie') return adapters.cookieValue(obj.value);
  if (obj.type === 'dom') return adapters.domValue(obj.value);
  if (obj.type === 'jqdom') return adapters.jqdomValue(obj.value);
  return null;
}

function convertValue(val){
  return val.toString();
}

function initConfig(){
  var distributionName = 'evolv:distribution';
  var distribution = window.localStorage.getItem(distributionName);
  if (!distribution) {
    distribution = Math.floor(Math.random()*100);
    window.localStorage.setItem(distributionName, distribution)
  }

  var qaAudienceEnabled = window.localStorage.getItem('evolv:qa_audience_enabled')

  return {
    distribution: distribution,
    qaAudienceEnabled: qaAudienceEnabled
  }
};


function addAudience(topKey, key, obj){
  function bindAudienceValue(val, inc){
    audience[topKey][key] = convertValue(val)
    if (inc){
       audience[topKey][key + '_pollingCount'] = '' + inc;
    }
  }
  try{
    var val = getValue(obj);

    if (val){
      bindAudienceValue(val)
      return;
    }

    if (!obj.poll){
      bindAudienceValue('')
      return;
    }
    var pollingCount = 0;
    var poll = setInterval(function(){
      try{
        var val = getValue(obj);
        pollingCount++;
        
        if (val){
          bindAudienceValue(val, pollingCount);
          refreshAudience();
          clearInterval(poll);
        }
      } catch(e){console.info('audience not processed', obj)}
    }, obj.poll.interval || 50)
    setTimeout(function(){ clearInterval(poll)}, obj.poll.duration || 250)

  } catch(e){
    console.warn('Unable to add audience for', topKey, key, obj, e)
  }
}

function setAudience(json){
  try{
    var topKeys = Object.keys(json);
    topKeys.forEach(function(topKey){
      var namespace = json[topKey];
      if (typeof namespace !== 'object'){
        console.warn('invalid audience namespace for', topKey)
        return;
      }
      
      var variables = Object.keys(namespace);
      if (!audience[topKey]) audience[topKey] = {}
      variables.forEach(function(variable){
        var audObj = namespace[variable]
        if (!audObj.page || new RegExp(audObj.page).test(location.pathname)) {
          addAudience(topKey, variable, audObj)
        }
      })
    })
    refreshAudience();
  } catch(e){}
}

audience.config = initConfig();

module.exports = setAudience;