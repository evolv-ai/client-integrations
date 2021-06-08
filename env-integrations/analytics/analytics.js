
var eventKeys = {
  confirmed: 'experiments.confirmations',
  contaminated: 'experiments.contaminations'
};

var LocalVars = {}

function isLocalVar(key){
  return key.indexOf('@') === 0;
}

function findAllocation(cid) {
  var allocations = window.evolv.context.get('experiments').allocations;
  for (let i = 0; i < allocations.length; i++) {
      if (allocations[i].cid === cid) return allocations[i];
  }
}

function sendAllocations(eventType, emit, sentEventAllocations) {
  var sentAllocations = sentEventAllocations[eventType] || sentEventAllocations.others;
  var eventKey = eventKeys[eventType] || '';
  var candidates = window.evolv.context.get(eventKey) || [];

  for (let i = 0; i < candidates.length; i++) {
    try{
      var cid = candidates[i].cid
      if (!sentAllocations[cid]){
        emit(eventType, findAllocation(cid))
        sentAllocations[cid] = true;
      }
    } catch(e){console.info('analytics not sent for evolv');}
  }
}

function listenToEvents(config){
  var poll = config.poll || {duration: 2000, interval:50};
  var events = config.events || ['confirmed'];
  var sentEventAllocations = {
    confirmed: {},
    contaminated: {},
    others: {}
  };
  var emitCheck = config.check;
  var emit = config.emit;

  function checkEvolv(){ return window.evolv}

  function bindListener() {
    events.forEach(function(eventType){
      function emitAllocations(){
        sendAllocations(eventType, emit, sentEventAllocations)
      }
      window.evolv.client.on(eventType, function (type) {
        waitFor(emitCheck, emitAllocations, poll);
      });
    })
  }

  waitFor(checkEvolv, bindListener, poll);
}

function waitFor(check, invoke, poll){
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
  }, poll.interval)
  setTimeout(function(){ 
      if (!polling) return
      
      clearInterval(polling)     
      console.info('listener timeout')
  }, poll.duration)
}

function tokenizeExp(exp){
  return Array.isArray(exp) ? exp : exp.split('.')
}

function setExpression(exp, values, append){
  var tokens = tokenizeExp(exp)
  var key = tokens.pop();
  var obj = getExpression(tokens);

  if (isLocalVar(key)) obj = LocalVars;

  if (!obj) return;

  if (append){
    obj[key] += values;
  } else{
    obj[key] = values;
  }
}

function invokeExpression(exp, args, init){
  var tokens = tokenizeExp(exp);
  var fncKey = tokens.pop();
  var obj = getExpression(tokens);
  if (typeof obj[fncKey] !== 'function'){
      console.warn('not proper emit function', obj, fncKey)
      return;
  }

  if (init){
    return new (Function.prototype.bind.apply(obj[fncKey], [null].concat(args)))
  } else {
    return obj[fncKey].apply(obj, args)
  }
}

//
function getExpression(exp){
  var tokens = tokenizeExp(exp);
  var result = window;

  if (tokens[0] === 'window') tokens = tokens.slice(1);

  while(tokens.length > 0 && result){
      var token = tokens[0];
      tokens = tokens.slice(1)

      if (token.indexOf('(')> 0){
          try{
          token = token.slice(0,-2);
          var fnc = result[token]
          if (typeof fnc === 'function')
              result = fnc.apply(result, []);
          else
              result = undefined;
          }
          catch(e){}
      } else {
          var newResult = result[token];
          if (typeof newResult === 'function' && tokens.length === 0){
            result = newResult.bind(result);
          } else {
            result = newResult;
          }
      }
  }
  return result;
}

//json config processing
function findMatchingConfig(configs){
  for (var i=0; i< configs.length; i++){
      var config = configs[i]
      if (!config.page || new RegExp(config.page).test(location.pathname)) {
          return config
      }
  }
  return null;
}

//Object to process event values
function EventContext(event){
  this.event = event;
}
EventContext.prototype.eventValue =  function(key){
  var event = this.event;
  switch (key) {
    case 'combination_id':
      return(event.ordinal);
    case 'experiment_id':
      return(event.group_id);
    case 'user_id':
      return(event.uid);    
    default:
      return event[key];
  }
}
EventContext.prototype.parseTemplateString = function(str){
  var tokenize = /((\${([^}]*)})|([^${}])+)/g;
  var extract =  /\${([^}]*)}/;
  var tokens = str.match(tokenize);
  var instantiateTokens = function (accum, str){
    var val = str.match(extract)

    return accum + (val ? this.eventValue(val[1]) : str);
  }.bind(this);

  return tokens.reduce(instantiateTokens, '');
}
EventContext.prototype.extractValue = function(macroValue){
  if (Array.isArray(macroValue)){
    return this.buildArray(macroValue);
  }
  if (typeof macroValue === 'object'){
    return this.buildMap(macroValue);
  }

  if (isLocalVar(macroValue)){
    return LocalVars[macroValue];
  } else {
    return this.parseTemplateString(macroValue)
  }
}

EventContext.prototype.buildMap = function(config){
  var $this = this;
  var keys = Object.keys(config);
  var emitMap = {};
  keys.forEach(function(key){
    emitMap[key] = $this.extractValue(config[key]);
  });
  return emitMap
}
EventContext.prototype.buildArray = function(configArray){
  var $this = this;
  return configArray.map(function(exp){
    return $this.extractValue(exp)
  })
}


function runStatement(statement, eventContext){
    // console.info('running statement', statement, eventContext)
  var values;
  
  if (statement.with){
    values = eventContext.extractValue(statement.with);
  } else {
    values = runStatement(statement.withExpression, eventContext);
  }

  if(statement.bind){
    return setExpression(statement.bind, values)
  }  
  if(statement.append){
    return setExpression(statement.bind, values, true)
  }
  if(statement.invoke){
    return invokeExpression(statement.invoke, values);
  }
  if(statement.init){
    return invokeExpression(statement.init, values, true);
  }

  console.info('nothing to run for', this.statement)
}


function processStatements(pageConfig, eventType, event){
  var statements = pageConfig.statements;
  var eventContext = new EventContext(event);

  try{
  statements.forEach(function(statement){
    runStatement(statement, eventContext);
  })
  } catch(e){console.info('statement failed',e)}
}


function statementTarget(statement){
  return statement.invoke || statement.bind    
      || statement.init || statement.append;
}

function areStatementsReady(config){
  var statements = config.statements

  return statements.every(function(statement){
    if (statement.bind){
      var obj = tokenizeExp(statementTarget(statement)).slice(0,-1);
      if (obj.length === 0) return true
      
      return !!getExpression(obj);
    } else{
      return !!getExpression(statementTarget(statement))
    }
  })
}

function processAnalytics(config){
  var configKeys = Object.keys(config);


  configKeys.forEach(function(key){
    try{
      var pageConfig = findMatchingConfig(config[key] || []);
      if (!pageConfig) return;

      listenToEvents({
        events: pageConfig.events, 
        check: areStatementsReady.bind(null, pageConfig),
        emit: processStatements.bind(null, pageConfig), 
        poll: pageConfig.poll
      });
    } catch(e){console.info('analytics not setup for evolv', key)}
  })
}

module.exports = processAnalytics;
