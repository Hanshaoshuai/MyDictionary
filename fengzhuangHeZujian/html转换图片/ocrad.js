var OCRAD = (function(){
  function createOcradInstance(){
  
  
  // The Module object: Our interface to the outside world. We import
  // and export values on it, and do the work to get that through
  // closure compiler if necessary. There are various ways Module can be used:
  // 1. Not defined. We create it here
  // 2. A function parameter, function(Module) { ..generated code.. }
  // 3. pre-run appended it, var Module = {}; ..generated code..
  // 4. External script tag defines var Module.
  // We need to do an eval in order to handle the closure compiler
  // case, where this code here is minified but Module was defined
  // elsewhere (e.g. case 4 above). We also need to check if Module
  // already exists (e.g. case 3 above).
  // Note that if you want to run closure, and also to use Module
  // after the generated code, you will need to define   var Module = {};
  // before the code. Then that object will be used in the code, and you
  // can continue to use Module afterwards as well.
  var Module;
  if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};
  
  // Sometimes an existing Module object exists with properties
  // meant to overwrite the default module functionality. Here
  // we collect those properties and reapply _after_ we configure
  // the current environment's defaults to avoid having to be so
  // defensive during initialization.
  var moduleOverrides = {};
  for (var key in Module) {
    if (Module.hasOwnProperty(key)) {
      moduleOverrides[key] = Module[key];
    }
  }
  
  // The environment setup code below is customized to use Module.
  // *** Environment setup code ***
  var ENVIRONMENT_IS_WEB = false;
  var ENVIRONMENT_IS_WORKER = false;
  var ENVIRONMENT_IS_NODE = false;
  var ENVIRONMENT_IS_SHELL = false;
  
  // Three configurations we can be running in:
  // 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
  // 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
  // 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)
  
  if (Module['ENVIRONMENT']) {
    if (Module['ENVIRONMENT'] === 'WEB') {
      ENVIRONMENT_IS_WEB = true;
    } else if (Module['ENVIRONMENT'] === 'WORKER') {
      ENVIRONMENT_IS_WORKER = true;
    } else if (Module['ENVIRONMENT'] === 'NODE') {
      ENVIRONMENT_IS_NODE = true;
    } else if (Module['ENVIRONMENT'] === 'SHELL') {
      ENVIRONMENT_IS_SHELL = true;
    } else {
      throw new Error('The provided Module[\'ENVIRONMENT\'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.');
    }
  } else {
    ENVIRONMENT_IS_WEB = typeof window === 'object';
    ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
    ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
    ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
  }
  
  
  if (ENVIRONMENT_IS_NODE) {
    // Expose functionality in the same simple way that the shells work
    // Note that we pollute the global namespace here, otherwise we break in node
    if (!Module['print']) Module['print'] = console.log;
    if (!Module['printErr']) Module['printErr'] = console.warn;
  
    var nodeFS;
    var nodePath;
  
    Module['read'] = function read(filename, binary) {
      if (!nodeFS) nodeFS = require('fs');
      if (!nodePath) nodePath = require('path');
  
      filename = nodePath['normalize'](filename);
      var ret = nodeFS['readFileSync'](filename);
      // The path is absolute if the normalized version is the same as the resolved.
      if (!ret && filename != nodePath['resolve'](filename)) {
        filename = path.join(__dirname, '..', 'src', filename);
        ret = nodeFS['readFileSync'](filename);
      }
      if (ret && !binary) ret = ret.toString();
      return ret;
    };
  
    Module['readBinary'] = function readBinary(filename) {
      var ret = Module['read'](filename, true);
      if (!ret.buffer) {
        ret = new Uint8Array(ret);
      }
      assert(ret.buffer);
      return ret;
    };
  
    Module['load'] = function load(f) {
      globalEval(read(f));
    };
  
    if (!Module['thisProgram']) {
      if (process['argv'].length > 1) {
        Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
      } else {
        Module['thisProgram'] = 'unknown-program';
      }
    }
  
    Module['arguments'] = process['argv'].slice(2);
  
    if (typeof module !== 'undefined') {
      module['exports'] = Module;
    }
  
    process['on']('uncaughtException', function(ex) {
      // suppress ExitStatus exceptions from showing an error
      if (!(ex instanceof ExitStatus)) {
        throw ex;
      }
    });
  
    Module['inspect'] = function () { return '[Emscripten Module object]'; };
  }
  else if (ENVIRONMENT_IS_SHELL) {
    if (!Module['print']) Module['print'] = print;
    if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  
    if (typeof read != 'undefined') {
      Module['read'] = read;
    } else {
      Module['read'] = function read() { throw 'no read() available (jsc?)' };
    }
  
    Module['readBinary'] = function readBinary(f) {
      if (typeof readbuffer === 'function') {
        return new Uint8Array(readbuffer(f));
      }
      var data = read(f, 'binary');
      assert(typeof data === 'object');
      return data;
    };
  
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  
  }
  else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module['read'] = function read(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    };
  
    Module['readAsync'] = function readAsync(url, onload, onerror) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function xhr_onload() {
        if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
          onload(xhr.response);
        } else {
          onerror();
        }
      };
      xhr.onerror = onerror;
      xhr.send(null);
    };
  
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  
    if (typeof console !== 'undefined') {
      if (!Module['print']) Module['print'] = function print(x) {
        console.log(x);
      };
      if (!Module['printErr']) Module['printErr'] = function printErr(x) {
        console.warn(x);
      };
    } else {
      // Probably a worker, and without console.log. We can do very little here...
      var TRY_USE_DUMP = false;
      if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
        dump(x);
      }) : (function(x) {
        // self.postMessage(x); // enable this if you want stdout to be sent as messages
      }));
    }
  
    if (ENVIRONMENT_IS_WORKER) {
      Module['load'] = importScripts;
    }
  
    if (typeof Module['setWindowTitle'] === 'undefined') {
      Module['setWindowTitle'] = function(title) { document.title = title };
    }
  }
  else {
    // Unreachable because SHELL is dependant on the others
    throw 'Unknown runtime environment. Where are we?';
  }
  
  function globalEval(x) {
    eval.call(null, x);
  }
  if (!Module['load'] && Module['read']) {
    Module['load'] = function load(f) {
      globalEval(Module['read'](f));
    };
  }
  if (!Module['print']) {
    Module['print'] = function(){};
  }
  if (!Module['printErr']) {
    Module['printErr'] = Module['print'];
  }
  if (!Module['arguments']) {
    Module['arguments'] = [];
  }
  if (!Module['thisProgram']) {
    Module['thisProgram'] = './this.program';
  }
  
  // *** Environment setup code ***
  
  // Closure helpers
  Module.print = Module['print'];
  Module.printErr = Module['printErr'];
  
  // Callbacks
  Module['preRun'] = [];
  Module['postRun'] = [];
  
  // Merge back in the overrides
  for (var key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
      Module[key] = moduleOverrides[key];
    }
  }
  // Free the object hierarchy contained in the overrides, this lets the GC
  // reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
  moduleOverrides = undefined;
  
  
  
  // {{PREAMBLE_ADDITIONS}}
  
  // === Preamble library stuff ===
  
  // Documentation for the public APIs defined in this file must be updated in: 
  //    site/source/docs/api_reference/preamble.js.rst
  // A prebuilt local version of the documentation is available at: 
  //    site/build/text/docs/api_reference/preamble.js.txt
  // You can also build docs locally as HTML or other formats in site/
  // An online HTML version (which may be of a different version of Emscripten)
  //    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
  
  //========================================
  // Runtime code shared with compiler
  //========================================
  
  var Runtime = {
    setTempRet0: function (value) {
      tempRet0 = value;
    },
    getTempRet0: function () {
      return tempRet0;
    },
    stackSave: function () {
      return STACKTOP;
    },
    stackRestore: function (stackTop) {
      STACKTOP = stackTop;
    },
    getNativeTypeSize: function (type) {
      switch (type) {
        case 'i1': case 'i8': return 1;
        case 'i16': return 2;
        case 'i32': return 4;
        case 'i64': return 8;
        case 'float': return 4;
        case 'double': return 8;
        default: {
          if (type[type.length-1] === '*') {
            return Runtime.QUANTUM_SIZE; // A pointer
          } else if (type[0] === 'i') {
            var bits = parseInt(type.substr(1));
            assert(bits % 8 === 0);
            return bits/8;
          } else {
            return 0;
          }
        }
      }
    },
    getNativeFieldSize: function (type) {
      return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
    },
    STACK_ALIGN: 16,
    prepVararg: function (ptr, type) {
      if (type === 'double' || type === 'i64') {
        // move so the load is aligned
        if (ptr & 7) {
          assert((ptr & 7) === 4);
          ptr += 4;
        }
      } else {
        assert((ptr & 3) === 0);
      }
      return ptr;
    },
    getAlignSize: function (type, size, vararg) {
      // we align i64s and doubles on 64-bit boundaries, unlike x86
      if (!vararg && (type == 'i64' || type == 'double')) return 8;
      if (!type) return Math.min(size, 8); // align structures internally to 64 bits
      return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
    },
    dynCall: function (sig, ptr, args) {
      if (args && args.length) {
        assert(args.length == sig.length-1);
        if (!args.splice) args = Array.prototype.slice.call(args);
        args.splice(0, 0, ptr);
        assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
        return Module['dynCall_' + sig].apply(null, args);
      } else {
        assert(sig.length == 1);
        assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
        return Module['dynCall_' + sig].call(null, ptr);
      }
    },
    functionPointers: [],
    addFunction: function (func) {
      for (var i = 0; i < Runtime.functionPointers.length; i++) {
        if (!Runtime.functionPointers[i]) {
          Runtime.functionPointers[i] = func;
          return 2*(1 + i);
        }
      }
      throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
    },
    removeFunction: function (index) {
      Runtime.functionPointers[(index-2)/2] = null;
    },
    warnOnce: function (text) {
      if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
      if (!Runtime.warnOnce.shown[text]) {
        Runtime.warnOnce.shown[text] = 1;
        Module.printErr(text);
      }
    },
    funcWrappers: {},
    getFuncWrapper: function (func, sig) {
      assert(sig);
      if (!Runtime.funcWrappers[sig]) {
        Runtime.funcWrappers[sig] = {};
      }
      var sigCache = Runtime.funcWrappers[sig];
      if (!sigCache[func]) {
        sigCache[func] = function dynCall_wrapper() {
          return Runtime.dynCall(sig, func, arguments);
        };
      }
      return sigCache[func];
    },
    getCompilerSetting: function (name) {
      throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
    },
    stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+15)&-16);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
    staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+15)&-16); return ret; },
    dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+15)&-16); if (DYNAMICTOP >= TOTAL_MEMORY) { var success = enlargeMemory(); if (!success) { DYNAMICTOP = ret;  return 0; } }; return ret; },
    alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 16))*(quantum ? quantum : 16); return ret; },
    makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
    GLOBAL_BASE: 8,
    QUANTUM_SIZE: 4,
    __dummy__: 0
  }
  
  
  
  Module["Runtime"] = Runtime;
  
  
  
  //========================================
  // Runtime essentials
  //========================================
  
  var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
  var EXITSTATUS = 0;
  
  function assert(condition, text) {
    if (!condition) {
      abort('Assertion failed: ' + text);
    }
  }
  
  var globalScope = this;
  
  // Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
  function getCFunc(ident) {
    var func = Module['_' + ident]; // closure exported function
    if (!func) {
      try { func = eval('_' + ident); } catch(e) {}
    }
    assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
    return func;
  }
  
  var cwrap, ccall;
  (function(){
    var JSfuncs = {
      // Helpers for cwrap -- it can't refer to Runtime directly because it might
      // be renamed by closure, instead it calls JSfuncs['stackSave'].body to find
      // out what the minified function name is.
      'stackSave': function() {
        Runtime.stackSave()
      },
      'stackRestore': function() {
        Runtime.stackRestore()
      },
      // type conversion from js to c
      'arrayToC' : function(arr) {
        var ret = Runtime.stackAlloc(arr.length);
        writeArrayToMemory(arr, ret);
        return ret;
      },
      'stringToC' : function(str) {
        var ret = 0;
        if (str !== null && str !== undefined && str !== 0) { // null string
          // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
          ret = Runtime.stackAlloc((str.length << 2) + 1);
          writeStringToMemory(str, ret);
        }
        return ret;
      }
    };
    // For fast lookup of conversion functions
    var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};
  
    // C calling interface. 
    ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      assert(returnType !== 'array', 'Return type should not be "array".');
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = Runtime.stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      if ((!opts || !opts.async) && typeof EmterpreterAsync === 'object') {
        assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling ccall');
      }
      if (opts && opts.async) assert(!returnType, 'async ccalls cannot return values');
      if (returnType === 'string') ret = Pointer_stringify(ret);
      if (stack !== 0) {
        if (opts && opts.async) {
          EmterpreterAsync.asyncFinalizers.push(function() {
            Runtime.stackRestore(stack);
          });
          return;
        }
        Runtime.stackRestore(stack);
      }
      return ret;
    }
  
    var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
    function parseJSFunc(jsfunc) {
      // Match the body and the return value of a javascript function source
      var parsed = jsfunc.toString().match(sourceRegex).slice(1);
      return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
    }
  
    // sources of useful functions. we create this lazily as it can trigger a source decompression on this entire file
    var JSsource = null;
    function ensureJSsource() {
      if (!JSsource) {
        JSsource = {};
        for (var fun in JSfuncs) {
          if (JSfuncs.hasOwnProperty(fun)) {
            // Elements of toCsource are arrays of three items:
            // the code, and the return value
            JSsource[fun] = parseJSFunc(JSfuncs[fun]);
          }
        }
      }
    }
    
    cwrap = function cwrap(ident, returnType, argTypes) {
      argTypes = argTypes || [];
      var cfunc = getCFunc(ident);
      // When the function takes numbers and returns a number, we can just return
      // the original function
      var numericArgs = argTypes.every(function(type){ return type === 'number'});
      var numericRet = (returnType !== 'string');
      if ( numericRet && numericArgs) {
        return cfunc;
      }
      // Creation of the arguments list (["$1","$2",...,"$nargs"])
      var argNames = argTypes.map(function(x,i){return '$'+i});
      var funcstr = "(function(" + argNames.join(',') + ") {";
      var nargs = argTypes.length;
      if (!numericArgs) {
        // Generate the code needed to convert the arguments from javascript
        // values to pointers
        ensureJSsource();
        funcstr += 'var stack = ' + JSsource['stackSave'].body + ';';
        for (var i = 0; i < nargs; i++) {
          var arg = argNames[i], type = argTypes[i];
          if (type === 'number') continue;
          var convertCode = JSsource[type + 'ToC']; // [code, return]
          funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
          funcstr += convertCode.body + ';';
          funcstr += arg + '=(' + convertCode.returnValue + ');';
        }
      }
  
      // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
      var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
      // Call the function
      funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
      if (!numericRet) { // Return type can only by 'string' or 'number'
        // Convert the result to a string
        var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
        funcstr += 'ret = ' + strgfy + '(ret);';
      }
      funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
      if (!numericArgs) {
        // If we had a stack, restore it
        ensureJSsource();
        funcstr += JSsource['stackRestore'].body.replace('()', '(stack)') + ';';
      }
      funcstr += 'return ret})';
      return eval(funcstr);
    };
  })();
  Module["ccall"] = ccall;
  Module["cwrap"] = cwrap;
  
  function setValue(ptr, value, type, noSafe) {
    type = type || 'i8';
    if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
      switch(type) {
        case 'i1': HEAP8[((ptr)>>0)]=value; break;
        case 'i8': HEAP8[((ptr)>>0)]=value; break;
        case 'i16': HEAP16[((ptr)>>1)]=value; break;
        case 'i32': HEAP32[((ptr)>>2)]=value; break;
        case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
        case 'float': HEAPF32[((ptr)>>2)]=value; break;
        case 'double': HEAPF64[((ptr)>>3)]=value; break;
        default: abort('invalid type for setValue: ' + type);
      }
  }
  Module["setValue"] = setValue;
  
  
  function getValue(ptr, type, noSafe) {
    type = type || 'i8';
    if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
      switch(type) {
        case 'i1': return HEAP8[((ptr)>>0)];
        case 'i8': return HEAP8[((ptr)>>0)];
        case 'i16': return HEAP16[((ptr)>>1)];
        case 'i32': return HEAP32[((ptr)>>2)];
        case 'i64': return HEAP32[((ptr)>>2)];
        case 'float': return HEAPF32[((ptr)>>2)];
        case 'double': return HEAPF64[((ptr)>>3)];
        default: abort('invalid type for setValue: ' + type);
      }
    return null;
  }
  Module["getValue"] = getValue;
  
  var ALLOC_NORMAL = 0; // Tries to use _malloc()
  var ALLOC_STACK = 1; // Lives for the duration of the current function call
  var ALLOC_STATIC = 2; // Cannot be freed
  var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
  var ALLOC_NONE = 4; // Do not allocate
  Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
  Module["ALLOC_STACK"] = ALLOC_STACK;
  Module["ALLOC_STATIC"] = ALLOC_STATIC;
  Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
  Module["ALLOC_NONE"] = ALLOC_NONE;
  
  // allocate(): This is for internal use. You can use it yourself as well, but the interface
  //             is a little tricky (see docs right below). The reason is that it is optimized
  //             for multiple syntaxes to save space in generated code. So you should
  //             normally not use allocate(), and instead allocate memory using _malloc(),
  //             initialize it with setValue(), and so forth.
  // @slab: An array of data, or a number. If a number, then the size of the block to allocate,
  //        in *bytes* (note that this is sometimes confusing: the next parameter does not
  //        affect this!)
  // @types: Either an array of types, one for each byte (or 0 if no type at that position),
  //         or a single type which is used for the entire block. This only matters if there
  //         is initial data - if @slab is a number, then this does not matter at all and is
  //         ignored.
  // @allocator: How to allocate memory, see ALLOC_*
  function allocate(slab, types, allocator, ptr) {
    var zeroinit, size;
    if (typeof slab === 'number') {
      zeroinit = true;
      size = slab;
    } else {
      zeroinit = false;
      size = slab.length;
    }
  
    var singleType = typeof types === 'string' ? types : null;
  
    var ret;
    if (allocator == ALLOC_NONE) {
      ret = ptr;
    } else {
      ret = [typeof _malloc === 'function' ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
    }
  
    if (zeroinit) {
      var ptr = ret, stop;
      assert((ret & 3) == 0);
      stop = ret + (size & ~3);
      for (; ptr < stop; ptr += 4) {
        HEAP32[((ptr)>>2)]=0;
      }
      stop = ret + size;
      while (ptr < stop) {
        HEAP8[((ptr++)>>0)]=0;
      }
      return ret;
    }
  
    if (singleType === 'i8') {
      if (slab.subarray || slab.slice) {
        HEAPU8.set(slab, ret);
      } else {
        HEAPU8.set(new Uint8Array(slab), ret);
      }
      return ret;
    }
  
    var i = 0, type, typeSize, previousType;
    while (i < size) {
      var curr = slab[i];
  
      if (typeof curr === 'function') {
        curr = Runtime.getFunctionIndex(curr);
      }
  
      type = singleType || types[i];
      if (type === 0) {
        i++;
        continue;
      }
      assert(type, 'Must know what type to store in allocate!');
  
      if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
  
      setValue(ret+i, curr, type);
  
      // no need to look up size unless type changes, so cache it
      if (previousType !== type) {
        typeSize = Runtime.getNativeTypeSize(type);
        previousType = type;
      }
      i += typeSize;
    }
  
    return ret;
  }
  Module["allocate"] = allocate;
  
  // Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
  function getMemory(size) {
    if (!staticSealed) return Runtime.staticAlloc(size);
    if ((typeof _sbrk !== 'undefined' && !_sbrk.called) || !runtimeInitialized) return Runtime.dynamicAlloc(size);
    return _malloc(size);
  }
  Module["getMemory"] = getMemory;
  
  function Pointer_stringify(ptr, /* optional */ length) {
    if (length === 0 || !ptr) return '';
    // TODO: use TextDecoder
    // Find the length, and check for UTF while doing so
    var hasUtf = 0;
    var t;
    var i = 0;
    while (1) {
      assert(ptr + i < TOTAL_MEMORY);
      t = HEAPU8[(((ptr)+(i))>>0)];
      hasUtf |= t;
      if (t == 0 && !length) break;
      i++;
      if (length && i == length) break;
    }
    if (!length) length = i;
  
    var ret = '';
  
    if (hasUtf < 128) {
      var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
      var curr;
      while (length > 0) {
        curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
        ret = ret ? ret + curr : curr;
        ptr += MAX_CHUNK;
        length -= MAX_CHUNK;
      }
      return ret;
    }
    return Module['UTF8ToString'](ptr);
  }
  Module["Pointer_stringify"] = Pointer_stringify;
  
  // Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
  // a copy of that string as a Javascript String object.
  
  function AsciiToString(ptr) {
    var str = '';
    while (1) {
      var ch = HEAP8[((ptr++)>>0)];
      if (!ch) return str;
      str += String.fromCharCode(ch);
    }
  }
  Module["AsciiToString"] = AsciiToString;
  
  // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
  // null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.
  
  function stringToAscii(str, outPtr) {
    return writeAsciiToMemory(str, outPtr, false);
  }
  Module["stringToAscii"] = stringToAscii;
  
  // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
  // a copy of that string as a Javascript String object.
  
  function UTF8ArrayToString(u8Array, idx) {
    var u0, u1, u2, u3, u4, u5;
  
    var str = '';
    while (1) {
      // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
      u0 = u8Array[idx++];
      if (!u0) return str;
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      u1 = u8Array[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      u2 = u8Array[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u3 = u8Array[idx++] & 63;
        if ((u0 & 0xF8) == 0xF0) {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
        } else {
          u4 = u8Array[idx++] & 63;
          if ((u0 & 0xFC) == 0xF8) {
            u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
          } else {
            u5 = u8Array[idx++] & 63;
            u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
          }
        }
      }
      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  Module["UTF8ArrayToString"] = UTF8ArrayToString;
  
  // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns
  // a copy of that string as a Javascript String object.
  
  function UTF8ToString(ptr) {
    return UTF8ArrayToString(HEAPU8,ptr);
  }
  Module["UTF8ToString"] = UTF8ToString;
  
  // Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
  // encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
  // Use the function lengthBytesUTF8() to compute the exact number of bytes (excluding null terminator) that this function will write.
  // Parameters:
  //   str: the Javascript string to copy.
  //   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
  //   outIdx: The starting offset in the array to begin the copying.
  //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
  //                    terminator, i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
  //                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
  // Returns the number of bytes written, EXCLUDING the null terminator.
  
  function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
      return 0;
  
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
    for (var i = 0; i < str.length; ++i) {
      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
      // See http://unicode.org/faq/utf_bom.html#utf16-3
      // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
      var u = str.charCodeAt(i); // possibly a lead surrogate
      if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
      if (u <= 0x7F) {
        if (outIdx >= endIdx) break;
        outU8Array[outIdx++] = u;
      } else if (u <= 0x7FF) {
        if (outIdx + 1 >= endIdx) break;
        outU8Array[outIdx++] = 0xC0 | (u >> 6);
        outU8Array[outIdx++] = 0x80 | (u & 63);
      } else if (u <= 0xFFFF) {
        if (outIdx + 2 >= endIdx) break;
        outU8Array[outIdx++] = 0xE0 | (u >> 12);
        outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
        outU8Array[outIdx++] = 0x80 | (u & 63);
      } else if (u <= 0x1FFFFF) {
        if (outIdx + 3 >= endIdx) break;
        outU8Array[outIdx++] = 0xF0 | (u >> 18);
        outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
        outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
        outU8Array[outIdx++] = 0x80 | (u & 63);
      } else if (u <= 0x3FFFFFF) {
        if (outIdx + 4 >= endIdx) break;
        outU8Array[outIdx++] = 0xF8 | (u >> 24);
        outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
        outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
        outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
        outU8Array[outIdx++] = 0x80 | (u & 63);
      } else {
        if (outIdx + 5 >= endIdx) break;
        outU8Array[outIdx++] = 0xFC | (u >> 30);
        outU8Array[outIdx++] = 0x80 | ((u >> 24) & 63);
        outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
        outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
        outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
        outU8Array[outIdx++] = 0x80 | (u & 63);
      }
    }
    // Null-terminate the pointer to the buffer.
    outU8Array[outIdx] = 0;
    return outIdx - startIdx;
  }
  Module["stringToUTF8Array"] = stringToUTF8Array;
  
  // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
  // null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
  // Use the function lengthBytesUTF8() to compute the exact number of bytes (excluding null terminator) that this function will write.
  // Returns the number of bytes written, EXCLUDING the null terminator.
  
  function stringToUTF8(str, outPtr, maxBytesToWrite) {
    assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
    return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
  }
  Module["stringToUTF8"] = stringToUTF8;
  
  // Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
  
  function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
      // See http://unicode.org/faq/utf_bom.html#utf16-3
      var u = str.charCodeAt(i); // possibly a lead surrogate
      if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
      if (u <= 0x7F) {
        ++len;
      } else if (u <= 0x7FF) {
        len += 2;
      } else if (u <= 0xFFFF) {
        len += 3;
      } else if (u <= 0x1FFFFF) {
        len += 4;
      } else if (u <= 0x3FFFFFF) {
        len += 5;
      } else {
        len += 6;
      }
    }
    return len;
  }
  Module["lengthBytesUTF8"] = lengthBytesUTF8;
  
  // Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
  // a copy of that string as a Javascript String object.
  
  function UTF16ToString(ptr) {
    var i = 0;
  
    var str = '';
    while (1) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0)
        return str;
      ++i;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }
  }
  
  
  // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
  // null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
  // Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
  // Parameters:
  //   str: the Javascript string to copy.
  //   outPtr: Byte address in Emscripten HEAP where to write the string to.
  //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
  //                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
  //                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
  // Returns the number of bytes written, EXCLUDING the null terminator.
  
  function stringToUTF16(str, outPtr, maxBytesToWrite) {
    assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
    // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
    if (maxBytesToWrite === undefined) {
      maxBytesToWrite = 0x7FFFFFFF;
    }
    if (maxBytesToWrite < 2) return 0;
    maxBytesToWrite -= 2; // Null terminator.
    var startPtr = outPtr;
    var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
    for (var i = 0; i < numCharsToWrite; ++i) {
      // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
      var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
      HEAP16[((outPtr)>>1)]=codeUnit;
      outPtr += 2;
    }
    // Null-terminate the pointer to the HEAP.
    HEAP16[((outPtr)>>1)]=0;
    return outPtr - startPtr;
  }
  
  
  // Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.
  
  function lengthBytesUTF16(str) {
    return str.length*2;
  }
  
  
  function UTF32ToString(ptr) {
    var i = 0;
  
    var str = '';
    while (1) {
      var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
      if (utf32 == 0)
        return str;
      ++i;
      // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
      // See http://unicode.org/faq/utf_bom.html#utf16-3
      if (utf32 >= 0x10000) {
        var ch = utf32 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      } else {
        str += String.fromCharCode(utf32);
      }
    }
  }
  
  
  // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
  // null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
  // Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
  // Parameters:
  //   str: the Javascript string to copy.
  //   outPtr: Byte address in Emscripten HEAP where to write the string to.
  //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
  //                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
  //                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
  // Returns the number of bytes written, EXCLUDING the null terminator.
  
  function stringToUTF32(str, outPtr, maxBytesToWrite) {
    assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
    // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
    if (maxBytesToWrite === undefined) {
      maxBytesToWrite = 0x7FFFFFFF;
    }
    if (maxBytesToWrite < 4) return 0;
    var startPtr = outPtr;
    var endPtr = startPtr + maxBytesToWrite - 4;
    for (var i = 0; i < str.length; ++i) {
      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
      // See http://unicode.org/faq/utf_bom.html#utf16-3
      var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
      if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
        var trailSurrogate = str.charCodeAt(++i);
        codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
      }
      HEAP32[((outPtr)>>2)]=codeUnit;
      outPtr += 4;
      if (outPtr + 4 > endPtr) break;
    }
    // Null-terminate the pointer to the HEAP.
    HEAP32[((outPtr)>>2)]=0;
    return outPtr - startPtr;
  }
  
  
  // Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.
  
  function lengthBytesUTF32(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
      // See http://unicode.org/faq/utf_bom.html#utf16-3
      var codeUnit = str.charCodeAt(i);
      if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
      len += 4;
    }
  
    return len;
  }
  
  
  function demangle(func) {
    var hasLibcxxabi = !!Module['___cxa_demangle'];
    if (hasLibcxxabi) {
      try {
        var buf = _malloc(func.length);
        writeStringToMemory(func.substr(1), buf);
        var status = _malloc(4);
        var ret = Module['___cxa_demangle'](buf, 0, 0, status);
        if (getValue(status, 'i32') === 0 && ret) {
          return Pointer_stringify(ret);
        }
        // otherwise, libcxxabi failed, we can try ours which may return a partial result
      } catch(e) {
        // failure when using libcxxabi, we can try ours which may return a partial result
        return func;
      } finally {
        if (buf) _free(buf);
        if (status) _free(status);
        if (ret) _free(ret);
      }
    }
    Runtime.warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
    return func;
  }
  
  function demangleAll(text) {
    return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
  }
  
  function jsStackTrace() {
    var err = new Error();
    if (!err.stack) {
      // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
      // so try that as a special-case.
      try {
        throw new Error(0);
      } catch(e) {
        err = e;
      }
      if (!err.stack) {
        return '(no stack trace available)';
      }
    }
    return err.stack.toString();
  }
  
  function stackTrace() {
    return demangleAll(jsStackTrace());
  }
  Module["stackTrace"] = stackTrace;
  
  // Memory management
  
  var PAGE_SIZE = 4096;
  
  function alignMemoryPage(x) {
    if (x % 4096 > 0) {
      x += (4096 - (x % 4096));
    }
    return x;
  }
  
  var HEAP;
  var buffer;
  var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
  
  function updateGlobalBuffer(buf) {
    Module['buffer'] = buffer = buf;
  }
  
  function updateGlobalBufferViews() {
    Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
    Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
    Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
    Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
    Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
    Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
    Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
    Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
  }
  
  var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
  var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
  var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
  
  
  function abortOnCannotGrowMemory() {
    abort('Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
  }
  
  function enlargeMemory() {
    abortOnCannotGrowMemory();
  }
  
  
  var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
  var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 33554432;
  
  var totalMemory = 64*1024;
  while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
    if (totalMemory < 16*1024*1024) {
      totalMemory *= 2;
    } else {
      totalMemory += 16*1024*1024
    }
  }
  if (totalMemory !== TOTAL_MEMORY) {
    Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be compliant with the asm.js spec (and given that TOTAL_STACK=' + TOTAL_STACK + ')');
    TOTAL_MEMORY = totalMemory;
  }
  
  // Initialize the runtime's memory
  // check for full engine support (use string 'subarray' to avoid closure compiler confusion)
  assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
         'JS engine does not provide full typed array support');
  
  
  
  // Use a provided buffer, if there is one, or else allocate a new one
  if (Module['buffer']) {
    buffer = Module['buffer'];
    assert(buffer.byteLength === TOTAL_MEMORY, 'provided buffer should be ' + TOTAL_MEMORY + ' bytes, but it is ' + buffer.byteLength);
  } else {
    buffer = new ArrayBuffer(TOTAL_MEMORY);
  }
  updateGlobalBufferViews();
  
  
  // Endianness check (note: assumes compiler arch was little-endian)
  HEAP32[0] = 255;
  if (HEAPU8[0] !== 255 || HEAPU8[3] !== 0) throw 'Typed arrays 2 must be run on a little-endian system';
  
  Module['HEAP'] = HEAP;
  Module['buffer'] = buffer;
  Module['HEAP8'] = HEAP8;
  Module['HEAP16'] = HEAP16;
  Module['HEAP32'] = HEAP32;
  Module['HEAPU8'] = HEAPU8;
  Module['HEAPU16'] = HEAPU16;
  Module['HEAPU32'] = HEAPU32;
  Module['HEAPF32'] = HEAPF32;
  Module['HEAPF64'] = HEAPF64;
  
  function callRuntimeCallbacks(callbacks) {
    while(callbacks.length > 0) {
      var callback = callbacks.shift();
      if (typeof callback == 'function') {
        callback();
        continue;
      }
      var func = callback.func;
      if (typeof func === 'number') {
        if (callback.arg === undefined) {
          Runtime.dynCall('v', func);
        } else {
          Runtime.dynCall('vi', func, [callback.arg]);
        }
      } else {
        func(callback.arg === undefined ? null : callback.arg);
      }
    }
  }
  
  var __ATPRERUN__  = []; // functions called before the runtime is initialized
  var __ATINIT__    = []; // functions called during startup
  var __ATMAIN__    = []; // functions called when main() is to be run
  var __ATEXIT__    = []; // functions called during shutdown
  var __ATPOSTRUN__ = []; // functions called after the runtime has exited
  
  var runtimeInitialized = false;
  var runtimeExited = false;
  
  
  function preRun() {
    // compatibility - merge in anything from Module['preRun'] at this time
    if (Module['preRun']) {
      if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
      while (Module['preRun'].length) {
        addOnPreRun(Module['preRun'].shift());
      }
    }
    callRuntimeCallbacks(__ATPRERUN__);
  }
  
  function ensureInitRuntime() {
    if (runtimeInitialized) return;
    runtimeInitialized = true;
    callRuntimeCallbacks(__ATINIT__);
  }
  
  function preMain() {
    callRuntimeCallbacks(__ATMAIN__);
  }
  
  function exitRuntime() {
    callRuntimeCallbacks(__ATEXIT__);
    runtimeExited = true;
  }
  
  function postRun() {
    // compatibility - merge in anything from Module['postRun'] at this time
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length) {
        addOnPostRun(Module['postRun'].shift());
      }
    }
    callRuntimeCallbacks(__ATPOSTRUN__);
  }
  
  function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb);
  }
  Module["addOnPreRun"] = addOnPreRun;
  
  function addOnInit(cb) {
    __ATINIT__.unshift(cb);
  }
  Module["addOnInit"] = addOnInit;
  
  function addOnPreMain(cb) {
    __ATMAIN__.unshift(cb);
  }
  Module["addOnPreMain"] = addOnPreMain;
  
  function addOnExit(cb) {
    __ATEXIT__.unshift(cb);
  }
  Module["addOnExit"] = addOnExit;
  
  function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb);
  }
  Module["addOnPostRun"] = addOnPostRun;
  
  // Tools
  
  
  function intArrayFromString(stringy, dontAddNull, length /* optional */) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
  }
  Module["intArrayFromString"] = intArrayFromString;
  
  function intArrayToString(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      var chr = array[i];
      if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
        chr &= 0xFF;
      }
      ret.push(String.fromCharCode(chr));
    }
    return ret.join('');
  }
  Module["intArrayToString"] = intArrayToString;
  
  function writeStringToMemory(string, buffer, dontAddNull) {
    var array = intArrayFromString(string, dontAddNull);
    var i = 0;
    while (i < array.length) {
      var chr = array[i];
      HEAP8[(((buffer)+(i))>>0)]=chr;
      i = i + 1;
    }
  }
  Module["writeStringToMemory"] = writeStringToMemory;
  
  function writeArrayToMemory(array, buffer) {
    for (var i = 0; i < array.length; i++) {
      HEAP8[((buffer++)>>0)]=array[i];
    }
  }
  Module["writeArrayToMemory"] = writeArrayToMemory;
  
  function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
      assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
      HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
    }
    // Null-terminate the pointer to the HEAP.
    if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
  }
  Module["writeAsciiToMemory"] = writeAsciiToMemory;
  
  function unSign(value, bits, ignore) {
    if (value >= 0) {
      return value;
    }
    return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                      : Math.pow(2, bits)         + value;
  }
  function reSign(value, bits, ignore) {
    if (value <= 0) {
      return value;
    }
    var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                          : Math.pow(2, bits-1);
    if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                         // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                         // TODO: In i64 mode 1, resign the two parts separately and safely
      value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
    }
    return value;
  }
  
  
  // check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
  if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
    var ah  = a >>> 16;
    var al = a & 0xffff;
    var bh  = b >>> 16;
    var bl = b & 0xffff;
    return (al*bl + ((ah*bl + al*bh) << 16))|0;
  };
  Math.imul = Math['imul'];
  
  
  if (!Math['clz32']) Math['clz32'] = function(x) {
    x = x >>> 0;
    for (var i = 0; i < 32; i++) {
      if (x & (1 << (31 - i))) return i;
    }
    return 32;
  };
  Math.clz32 = Math['clz32']
  
  var Math_abs = Math.abs;
  var Math_cos = Math.cos;
  var Math_sin = Math.sin;
  var Math_tan = Math.tan;
  var Math_acos = Math.acos;
  var Math_asin = Math.asin;
  var Math_atan = Math.atan;
  var Math_atan2 = Math.atan2;
  var Math_exp = Math.exp;
  var Math_log = Math.log;
  var Math_sqrt = Math.sqrt;
  var Math_ceil = Math.ceil;
  var Math_floor = Math.floor;
  var Math_pow = Math.pow;
  var Math_imul = Math.imul;
  var Math_fround = Math.fround;
  var Math_min = Math.min;
  var Math_clz32 = Math.clz32;
  
  // A counter of dependencies for calling run(). If we need to
  // do asynchronous work before running, increment this and
  // decrement it. Incrementing must happen in a place like
  // PRE_RUN_ADDITIONS (used by emcc to add file preloading).
  // Note that you can add dependencies in preRun, even though
  // it happens right before run - run will be postponed until
  // the dependencies are met.
  var runDependencies = 0;
  var runDependencyWatcher = null;
  var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
  var runDependencyTracking = {};
  
  function getUniqueRunDependency(id) {
    var orig = id;
    while (1) {
      if (!runDependencyTracking[id]) return id;
      id = orig + Math.random();
    }
    return id;
  }
  
  function addRunDependency(id) {
    runDependencies++;
    if (Module['monitorRunDependencies']) {
      Module['monitorRunDependencies'](runDependencies);
    }
    if (id) {
      assert(!runDependencyTracking[id]);
      runDependencyTracking[id] = 1;
      if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
        // Check for missing dependencies every few seconds
        runDependencyWatcher = setInterval(function() {
          if (ABORT) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
            return;
          }
          var shown = false;
          for (var dep in runDependencyTracking) {
            if (!shown) {
              shown = true;
              Module.printErr('still waiting on run dependencies:');
            }
            Module.printErr('dependency: ' + dep);
          }
          if (shown) {
            Module.printErr('(end of list)');
          }
        }, 10000);
      }
    } else {
      Module.printErr('warning: run dependency added without ID');
    }
  }
  Module["addRunDependency"] = addRunDependency;
  
  function removeRunDependency(id) {
    runDependencies--;
    if (Module['monitorRunDependencies']) {
      Module['monitorRunDependencies'](runDependencies);
    }
    if (id) {
      assert(runDependencyTracking[id]);
      delete runDependencyTracking[id];
    } else {
      Module.printErr('warning: run dependency removed without ID');
    }
    if (runDependencies == 0) {
      if (runDependencyWatcher !== null) {
        clearInterval(runDependencyWatcher);
        runDependencyWatcher = null;
      }
      if (dependenciesFulfilled) {
        var callback = dependenciesFulfilled;
        dependenciesFulfilled = null;
        callback(); // can add another dependenciesFulfilled
      }
    }
  }
  Module["removeRunDependency"] = removeRunDependency;
  
  Module["preloadedImages"] = {}; // maps url to image data
  Module["preloadedAudios"] = {}; // maps url to audio data
  
  
  
  var memoryInitializer = null;
  
  
  
  
  // === Body ===
  
  var ASM_CONSTS = [];
  
  
  
  
  STATIC_BASE = 8;
  
  STATICTOP = STATIC_BASE + 9456;
    /* global initializers */  __ATINIT__.push();
    
  
  /* memory initializer */ allocate([212,2,0,0,134,3,0,0,212,2,0,0,17,25,0,0,252,2,0,0,239,24,0,0,56,0,0,0,0,0,0,0,252,2,0,0,156,24,0,0,24,0,0,0,0,0,0,0,252,2,0,0,193,24,0,0,72,0,0,0,0,0,0,0,212,2,0,0,226,24,0,0,252,2,0,0,9,26,0,0,16,0,0,0,0,0,0,0,252,2,0,0,37,26,0,0,16,0,0,0,0,0,0,0,252,2,0,0,53,26,0,0,96,0,0,0,0,0,0,0,252,2,0,0,106,26,0,0,56,0,0,0,0,0,0,0,252,2,0,0,70,26,0,0,128,0,0,0,0,0,0,0,150,13,0,0,0,0,0,0,155,13,0,0,1,0,0,0,164,13,0,0,2,0,0,0,174,13,0,0,3,0,0,0,184,13,0,0,4,0,0,0,194,13,0,0,5,0,0,0,204,13,0,0,6,0,0,0,214,13,0,0,7,0,0,0,0,0,0,0,0,0,0,0,224,13,0,0,0,0,0,0,232,13,0,0,1,0,0,0,245,13,0,0,2,0,0,0,253,13,0,0,3,0,0,0,10,14,0,0,4,0,0,0,22,14,0,0,5,0,0,0,33,14,0,0,6,0,0,0,43,14,0,0,7,0,0,0,58,14,0,0,8,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,108,1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,208,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,216,28,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,1,0,0,88,2,0,0,9,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,3,0,0,0,224,32,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,24,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,0,0,0,0,40,0,0,0,7,0,0,0,15,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,30,25,0,0,0,0,0,0,80,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,0,0,0,0,96,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,0,0,0,0,112,0,0,0,22,0,0,0,25,0,0,0,24,0,0,0,45,0,114,98,0,119,0,48,46,50,53,0,101,110,100,45,111,102,45,102,105,108,101,32,114,101,97,100,105,110,103,32,112,110,109,32,102,105,108,101,46,0,78,49,48,80,97,103,101,95,105,109,97,103,101,53,69,114,114,111,114,69,0,106,117,110,107,32,105,110,32,112,98,109,32,102,105,108,101,32,119,104,101,114,101,32,98,105,116,115,32,115,104,111,117,108,100,32,98,101,46,0,106,117,110,107,32,105,110,32,112,110,109,32,102,105,108,101,32,119,104,101,114,101,32,97,110,32,105,110,116,101,103,101,114,32,115,104,111,117,108,100,32,98,101,46,0,110,117,109,98,101,114,32,116,111,111,32,98,105,103,32,105,110,32,112,110,109,32,102,105,108,101,46,0,122,101,114,111,32,109,97,120,118,97,108,32,105,110,32,112,103,109,32,102,105,108,101,46,0,118,97,108,117,101,32,62,32,109,97,120,118,97,108,32,105,110,32,112,103,109,32,102,105,108,101,46,0,109,97,120,118,97,108,32,62,32,50,53,53,32,105,110,32,112,103,109,32,34,80,53,34,32,102,105,108,101,46,0,122,101,114,111,32,109,97,120,118,97,108,32,105,110,32,112,112,109,32,102,105,108,101,46,0,118,97,108,117,101,32,62,32,109,97,120,118,97,108,32,105,110,32,112,112,109,32,102,105,108,101,46,0,109,97,120,118,97,108,32,62,32,50,53,53,32,105,110,32,112,112,109,32,34,80,54,34,32,102,105,108,101,46,0,98,97,100,32,109,97,103,105,99,32,110,117,109,98,101,114,32,45,32,110,111,116,32,97,32,112,98,109,44,32,112,103,109,32,111,114,32,112,112,109,32,102,105,108,101,46,0,122,101,114,111,32,119,105,100,116,104,32,105,110,32,112,110,109,32,102,105,108,101,46,0,122,101,114,111,32,104,101,105,103,104,116,32,105,110,32,112,110,109,32,102,105,108,101,46,0,105,109,97,103,101,32,116,111,111,32,115,109,97,108,108,46,32,77,105,110,105,109,117,109,32,115,105,122,101,32,105,115,32,51,120,51,46,0,105,109,97,103,101,32,116,111,111,32,98,105,103,46,32,39,105,110,116,39,32,119,105,108,108,32,111,118,101,114,102,108,111,119,46,0,102,105,108,101,32,116,121,112,101,32,105,115,32,80,37,99,10,0,102,105,108,101,32,115,105,122,101,32,105,115,32,37,100,119,32,120,32,37,100,104,10,0,80,37,99,10,37,100,32,37,100,10,0,37,100,10,0,37,100,32,0,37,100,32,37,100,32,37,100,10,0,37,100,32,37,100,32,37,100,32,0,37,99,32,37,99,32,37,99,32,0,98,97,100,32,112,97,114,97,109,101,116,101,114,32,98,117,105,108,100,105,110,103,32,97,32,114,101,100,117,99,101,100,32,80,97,103,101,95,105,109,97,103,101,46,0,115,99,97,108,101,32,102,97,99,116,111,114,32,116,111,111,32,98,105,103,46,32,39,105,110,116,39,32,119,105,108,108,32,111,118,101,114,102,108,111,119,46,0,108,32,61,32,37,100,44,32,116,32,61,32,37,100,44,32,114,32,61,32,37,100,44,32,98,32,61,32,37,100,10,0,98,97,100,32,112,97,114,97,109,101,116,101,114,32,98,117,105,108,100,105,110,103,32,97,32,82,101,99,116,97,110,103,108,101,46,0,108,101,102,116,44,32,98,97,100,32,112,97,114,97,109,101,116,101,114,32,114,101,115,105,122,105,110,103,32,97,32,82,101,99,116,97,110,103,108,101,46,0,116,111,112,44,32,98,97,100,32,112,97,114,97,109,101,116,101,114,32,114,101,115,105,122,105,110,103,32,97,32,82,101,99,116,97,110,103,108,101,46,0,114,105,103,104,116,44,32,98,97,100,32,112,97,114,97,109,101,116,101,114,32,114,101,115,105,122,105,110,103,32,97,32,82,101,99,116,97,110,103,108,101,46,0,98,111,116,116,111,109,44,32,98,97,100,32,112,97,114,97,109,101,116,101,114,32,114,101,115,105,122,105,110,103,32,97,32,82,101,99,116,97,110,103,108,101,46,0,104,101,105,103,104,116,44,32,98,97,100,32,112,97,114,97,109,101,116,101,114,32,114,101,115,105,122,105,110,103,32,97,32,82,101,99,116,97,110,103,108,101,46,0,119,105,100,116,104,44,32,98,97,100,32,112,97,114,97,109,101,116,101,114,32,114,101,115,105,122,105,110,103,32,97,32,82,101,99,116,97,110,103,108,101,46,0,106,111,105,110,95,98,108,111,98,115,44,32,108,111,115,116,32,98,108,111,98,46,0,110,117,109,98,101,114,32,111,102,32,116,101,120,116,32,98,108,111,99,107,115,32,61,32,37,100,10,0,116,111,116,97,108,32,122,111,110,101,115,32,105,110,32,112,97,103,101,32,37,100,10,0,116,111,116,97,108,32,98,108,111,98,115,32,105,110,32,112,97,103,101,32,37,100,10,10,0,122,111,110,101,32,37,100,32,111,102,32,37,100,10,0,122,111,110,101,32,115,105,122,101,32,37,100,119,32,120,32,37,100,104,10,0,116,111,116,97,108,32,98,108,111,98,115,32,105,110,32,122,111,110,101,32,37,117,10,10,0,84,101,120,116,112,97,103,101,58,58,116,101,120,116,98,108,111,99,107,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0,115,111,117,114,99,101,32,102,105,108,101,32,37,115,10,0,116,111,116,97,108,32,116,101,120,116,32,98,108,111,99,107,115,32,37,100,10,0,116,101,120,116,32,98,108,111,99,107,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,98,97,100,32,112,97,114,97,109,101,116,101,114,32,98,117,105,108,100,105,110,103,32,97,32,66,105,116,109,97,112,32,102,114,111,109,32,112,97,114,116,32,111,102,32,97,110,111,116,104,101,114,32,111,110,101,46,0,104,111,108,101,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0,32,79,0,32,46,0,102,105,108,108,95,104,111,108,101,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0,100,101,108,101,116,101,95,104,111,108,101,44,32,108,111,115,116,32,104,111,108,101,46,0,106,111,105,110,95,104,111,108,101,115,44,32,108,111,115,116,32,104,111,108,101,46,0,108,105,110,101,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0,37,100,32,108,105,110,101,115,10,10,0,37,100,32,99,104,97,114,97,99,116,101,114,115,32,105,110,32,108,105,110,101,32,37,100,10,0,108,105,110,101,115,32,37,100,10,0,108,105,110,101,32,37,100,32,99,104,97,114,115,32,37,100,32,104,101,105,103,104,116,32,37,100,10,0,99,111,110,115,116,32,98,108,111,98,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,98,108,111,98,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,105,110,115,101,114,116,95,103,117,101,115,115,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,115,119,97,112,95,103,117,101,115,115,101,115,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,103,117,101,115,115,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,95,0,37,100,32,103,117,101,115,115,101,115,32,32,32,32,0,103,117,101,115,115,32,39,37,115,39,44,32,99,111,110,102,105,100,101,110,99,101,32,37,100,32,32,32,32,0,103,117,101,115,115,32,39,37,99,39,44,32,99,111,110,102,105,100,101,110,99,101,32,37,100,32,32,32,32,0,103,117,101,115,115,32,39,92,116,39,44,32,99,111,110,102,105,100,101,110,99,101,32,37,100,32,32,32,32,0,108,101,102,116,32,61,32,37,100,44,32,116,111,112,32,61,32,37,100,44,32,114,105,103,104,116,32,61,32,37,100,44,32,98,111,116,116,111,109,32,61,32,37,100,10,0,119,105,100,116,104,32,61,32,37,100,44,32,104,101,105,103,104,116,32,61,32,37,100,44,32,104,99,101,110,116,101,114,32,61,32,37,100,44,32,118,99,101,110,116,101,114,32,61,32,37,100,44,32,98,108,97,99,107,32,97,114,101,97,32,61,32,37,100,37,37,10,0,104,98,97,114,115,32,61,32,37,100,44,32,118,98,97,114,115,32,61,32,37,100,10,0,10,10,0,32,37,99,0,32,32,116,111,112,40,37,100,41,0,32,32,118,99,101,110,116,101,114,40,37,100,41,0,32,32,98,111,116,116,111,109,40,37,100,41,0,32,32,98,111,120,46,116,111,112,40,37,100,41,0,32,32,98,111,120,46,118,99,101,110,116,101,114,40,37,100,41,0,32,32,98,111,120,46,98,111,116,116,111,109,40,37,100,41,0,32,32,104,49,46,116,111,112,40,37,100,41,0,32,32,104,49,46,98,111,116,116,111,109,40,37,100,41,0,32,32,104,50,46,116,111,112,40,37,100,41,0,32,32,104,50,46,98,111,116,116,111,109,40,37,100,41,0,37,51,100,32,37,51,100,32,37,50,100,32,37,50,100,59,32,37,100,0,44,32,39,37,99,39,37,100,0,44,32,39,37,115,39,37,100,0,99,104,97,114,97,99,116,101,114,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0,105,115,95,107,101,121,95,99,104,97,114,97,99,116,101,114,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0,100,101,108,101,116,101,95,99,104,97,114,97,99,116,101,114,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0,105,110,115,101,114,116,95,115,112,97,99,101,44,32,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0,105,110,115,101,114,116,95,115,112,97,99,101,44,32,116,114,97,99,107,32,110,111,116,32,115,101,116,32,121,101,116,46,0,109,101,97,110,32,104,101,105,103,104,116,32,61,32,37,100,44,32,109,101,100,105,97,110,32,104,101,105,103,104,116,32,61,32,37,100,44,32,116,114,97,99,107,32,115,101,103,109,101,110,116,115,32,61,32,37,100,44,32,98,105,103,32,105,110,105,116,105,97,108,115,32,61,32,37,100,10,0,108,32,61,32,37,100,44,32,108,99,32,61,32,37,100,44,32,114,32,61,32,37,100,44,32,114,99,32,61,32,37,100,44,32,104,32,61,32,37,100,10,0,98,97,100,32,112,97,114,97,109,101,116,101,114,32,98,117,105,108,100,105,110,103,32,97,32,86,114,104,111,109,98,111,105,100,46,0,101,120,116,101,110,100,95,108,101,102,116,44,32,98,97,100,32,112,97,114,97,109,101,116,101,114,32,114,101,115,105,122,105,110,103,32,97,32,86,114,104,111,109,98,111,105,100,46,0,101,120,116,101,110,100,95,114,105,103,104,116,44,32,98,97,100,32,112,97,114,97,109,101,116,101,114,32,114,101,115,105,122,105,110,103,32,97,32,86,114,104,111,109,98,111,105,100,46,0,111,99,114,97,100,58,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,37,115,10,0,104,101,108,112,0,32,32,37,115,0,110,111,110,101,0,114,111,116,97,116,101,57,48,0,114,111,116,97,116,101,49,56,48,0,114,111,116,97,116,101,50,55,48,0,109,105,114,114,111,114,95,108,114,0,109,105,114,114,111,114,95,116,98,0,109,105,114,114,111,114,95,100,49,0,109,105,114,114,111,114,95,100,50,0,108,101,116,116,101,114,115,0,108,101,116,116,101,114,115,95,111,110,108,121,0,110,117,109,98,101,114,115,0,110,117,109,98,101,114,115,95,111,110,108,121,0,115,97,109,101,95,104,101,105,103,104,116,0,116,101,120,116,95,98,108,111,99,107,0,117,112,112,101,114,95,110,117,109,0,117,112,112,101,114,95,110,117,109,95,109,97,114,107,0,117,112,112,101,114,95,110,117,109,95,111,110,108,121,0,37,115,58,32,98,97,100,32,102,105,108,116,101,114,32,39,37,115,39,10,0,86,97,108,105,100,32,102,105,108,116,101,114,32,110,97,109,101,115,58,0,84,33,34,25,13,1,2,3,17,75,28,12,16,4,11,29,18,30,39,104,110,111,112,113,98,32,5,6,15,19,20,21,26,8,22,7,40,36,23,24,9,10,14,27,31,37,35,131,130,125,38,42,43,60,61,62,63,67,71,74,77,88,89,90,91,92,93,94,95,96,97,99,100,101,102,103,105,106,107,108,114,115,116,121,122,123,124,0,73,108,108,101,103,97,108,32,98,121,116,101,32,115,101,113,117,101,110,99,101,0,68,111,109,97,105,110,32,101,114,114,111,114,0,82,101,115,117,108,116,32,110,111,116,32,114,101,112,114,101,115,101,110,116,97,98,108,101,0,78,111,116,32,97,32,116,116,121,0,80,101,114,109,105,115,115,105,111,110,32,100,101,110,105,101,100,0,79,112,101,114,97,116,105,111,110,32,110,111,116,32,112,101,114,109,105,116,116,101,100,0,78,111,32,115,117,99,104,32,102,105,108,101,32,111,114,32,100,105,114,101,99,116,111,114,121,0,78,111,32,115,117,99,104,32,112,114,111,99,101,115,115,0,70,105,108,101,32,101,120,105,115,116,115,0,86,97,108,117,101,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,100,97,116,97,32,116,121,112,101,0,78,111,32,115,112,97,99,101,32,108,101,102,116,32,111,110,32,100,101,118,105,99,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,115,111,117,114,99,101,32,98,117,115,121,0,73,110,116,101,114,114,117,112,116,101,100,32,115,121,115,116,101,109,32,99,97,108,108,0,82,101,115,111,117,114,99,101,32,116,101,109,112,111,114,97,114,105,108,121,32,117,110,97,118,97,105,108,97,98,108,101,0,73,110,118,97,108,105,100,32,115,101,101,107,0,67,114,111,115,115,45,100,101,118,105,99,101,32,108,105,110,107,0,82,101,97,100,45,111,110,108,121,32,102,105,108,101,32,115,121,115,116,101,109,0,68,105,114,101,99,116,111,114,121,32,110,111,116,32,101,109,112,116,121,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,112,101,101,114,0,79,112,101,114,97,116,105,111,110,32,116,105,109,101,100,32,111,117,116,0,67,111,110,110,101,99,116,105,111,110,32,114,101,102,117,115,101,100,0,72,111,115,116,32,105,115,32,100,111,119,110,0,72,111,115,116,32,105,115,32,117,110,114,101,97,99,104,97,98,108,101,0,65,100,100,114,101,115,115,32,105,110,32,117,115,101,0,66,114,111,107,101,110,32,112,105,112,101,0,73,47,79,32,101,114,114,111,114,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,32,111,114,32,97,100,100,114,101,115,115,0,66,108,111,99,107,32,100,101,118,105,99,101,32,114,101,113,117,105,114,101,100,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,0,78,111,116,32,97,32,100,105,114,101,99,116,111,114,121,0,73,115,32,97,32,100,105,114,101,99,116,111,114,121,0,84,101,120,116,32,102,105,108,101,32,98,117,115,121,0,69,120,101,99,32,102,111,114,109,97,116,32,101,114,114,111,114,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,0,65,114,103,117,109,101,110,116,32,108,105,115,116,32,116,111,111,32,108,111,110,103,0,83,121,109,98,111,108,105,99,32,108,105,110,107,32,108,111,111,112,0,70,105,108,101,110,97,109,101,32,116,111,111,32,108,111,110,103,0,84,111,111,32,109,97,110,121,32,111,112,101,110,32,102,105,108,101,115,32,105,110,32,115,121,115,116,101,109,0,78,111,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,115,32,97,118,97,105,108,97,98,108,101,0,66,97,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,0,78,111,32,99,104,105,108,100,32,112,114,111,99,101,115,115,0,66,97,100,32,97,100,100,114,101,115,115,0,70,105,108,101,32,116,111,111,32,108,97,114,103,101,0,84,111,111,32,109,97,110,121,32,108,105,110,107,115,0,78,111,32,108,111,99,107,115,32,97,118,97,105,108,97,98,108,101,0,82,101,115,111,117,114,99,101,32,100,101,97,100,108,111,99,107,32,119,111,117,108,100,32,111,99,99,117,114,0,83,116,97,116,101,32,110,111,116,32,114,101,99,111,118,101,114,97,98,108,101,0,80,114,101,118,105,111,117,115,32,111,119,110,101,114,32,100,105,101,100,0,79,112,101,114,97,116,105,111,110,32,99,97,110,99,101,108,101,100,0,70,117,110,99,116,105,111,110,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,78,111,32,109,101,115,115,97,103,101,32,111,102,32,100,101,115,105,114,101,100,32,116,121,112,101,0,73,100,101,110,116,105,102,105,101,114,32,114,101,109,111,118,101,100,0,68,101,118,105,99,101,32,110,111,116,32,97,32,115,116,114,101,97,109,0,78,111,32,100,97,116,97,32,97,118,97,105,108,97,98,108,101,0,68,101,118,105,99,101,32,116,105,109,101,111,117,116,0,79,117,116,32,111,102,32,115,116,114,101,97,109,115,32,114,101,115,111,117,114,99,101,115,0,76,105,110,107,32,104,97,115,32,98,101,101,110,32,115,101,118,101,114,101,100,0,80,114,111,116,111,99,111,108,32,101,114,114,111,114,0,66,97,100,32,109,101,115,115,97,103,101,0,70,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,32,98,97,100,32,115,116,97,116,101,0,78,111,116,32,97,32,115,111,99,107,101,116,0,68,101,115,116,105,110,97,116,105,111,110,32,97,100,100,114,101,115,115,32,114,101,113,117,105,114,101,100,0,77,101,115,115,97,103,101,32,116,111,111,32,108,97,114,103,101,0,80,114,111,116,111,99,111,108,32,119,114,111,110,103,32,116,121,112,101,32,102,111,114,32,115,111,99,107,101,116,0,80,114,111,116,111,99,111,108,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,80,114,111,116,111,99,111,108,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,83,111,99,107,101,116,32,116,121,112,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,78,111,116,32,115,117,112,112,111,114,116,101,100,0,80,114,111,116,111,99,111,108,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,100,100,114,101,115,115,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,98,121,32,112,114,111,116,111,99,111,108,0,65,100,100,114,101,115,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,101,116,119,111,114,107,32,105,115,32,100,111,119,110,0,78,101,116,119,111,114,107,32,117,110,114,101,97,99,104,97,98,108,101,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,110,101,116,119,111,114,107,0,67,111,110,110,101,99,116,105,111,110,32,97,98,111,114,116,101,100,0,78,111,32,98,117,102,102,101,114,32,115,112,97,99,101,32,97,118,97,105,108,97,98,108,101,0,83,111,99,107,101,116,32,105,115,32,99,111,110,110,101,99,116,101,100,0,83,111,99,107,101,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,67,97,110,110,111,116,32,115,101,110,100,32,97,102,116,101,114,32,115,111,99,107,101,116,32,115,104,117,116,100,111,119,110,0,79,112,101,114,97,116,105,111,110,32,97,108,114,101,97,100,121,32,105,110,32,112,114,111,103,114,101,115,115,0,79,112,101,114,97,116,105,111,110,32,105,110,32,112,114,111,103,114,101,115,115,0,83,116,97,108,101,32,102,105,108,101,32,104,97,110,100,108,101,0,82,101,109,111,116,101,32,73,47,79,32,101,114,114,111,114,0,81,117,111,116,97,32,101,120,99,101,101,100,101,100,0,78,111,32,109,101,100,105,117,109,32,102,111,117,110,100,0,87,114,111,110,103,32,109,101,100,105,117,109,32,116,121,112,101,0,78,111,32,101,114,114,111,114,32,105,110,102,111,114,109,97,116,105,111,110,0,0,114,119,97,0,17,0,10,0,17,17,17,0,0,0,0,5,0,0,0,0,0,0,9,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,15,10,17,17,17,3,10,7,0,1,19,9,11,11,0,0,9,6,11,0,0,11,0,6,17,0,0,0,17,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,10,10,17,17,17,0,10,0,0,2,0,9,11,0,0,0,9,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,13,0,0,0,0,9,14,0,0,0,0,0,14,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,15,0,0,0,0,9,16,0,0,0,0,0,16,0,0,16,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,10,0,0,0,0,9,11,0,0,0,0,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,45,43,32,32,32,48,88,48,120,0,40,110,117,108,108,41,0,45,48,88,43,48,88,32,48,88,45,48,120,43,48,120,32,48,120,0,105,110,102,0,73,78,70,0,110,97,110,0,78,65,78,0,46,0,98,97,115,105,99,95,115,116,114,105,110,103,0,118,101,99,116,111,114,0,99,97,110,110,111,116,32,122,101,114,111,32,111,117,116,32,116,104,114,101,97,100,32,118,97,108,117,101,32,102,111,114,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,40,41,0,99,97,110,110,111,116,32,99,114,101,97,116,101,32,112,116,104,114,101,97,100,32,107,101,121,32,102,111,114,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,40,41,0,112,116,104,114,101,97,100,95,111,110,99,101,32,102,97,105,108,117,114,101,32,105,110,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,95,102,97,115,116,40,41,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,83,116,57,116,121,112,101,95,105,110,102,111,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,83,116,57,101,120,99,101,112,116,105,111,110,0,117,110,99,97,117,103,104,116,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,101,120,99,101,112,116,105,111,110,32,111,102,32,116,121,112,101,32,37,115,58,32,37,115,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,101,120,99,101,112,116,105,111,110,32,111,102,32,116,121,112,101,32,37,115,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,102,111,114,101,105,103,110,32,101,120,99,101,112,116,105,111,110,0,116,101,114,109,105,110,97,116,105,110,103,0,116,101,114,109,105,110,97,116,101,95,104,97,110,100,108,101,114,32,117,110,101,120,112,101,99,116,101,100,108,121,32,114,101,116,117,114,110,101,100,0,116,101,114,109,105,110,97,116,101,95,104,97,110,100,108,101,114,32,117,110,101,120,112,101,99,116,101,100,108,121,32,116,104,114,101,119,32,97,110,32,101,120,99,101,112,116,105,111,110,0,83,116,57,98,97,100,95,97,108,108,111,99,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
  
  
  
  
  
  /* no memory initializer */
  var tempDoublePtr = STATICTOP; STATICTOP += 16;
  
  assert(tempDoublePtr % 8 == 0);
  
  function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  
    HEAP8[tempDoublePtr] = HEAP8[ptr];
  
    HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  
    HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  
    HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  
  }
  
  function copyTempDouble(ptr) {
  
    HEAP8[tempDoublePtr] = HEAP8[ptr];
  
    HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  
    HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  
    HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  
    HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  
    HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  
    HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  
    HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
  
  }
  
  // {{PRE_LIBRARY}}
  
  
     
    Module["_i64Subtract"] = _i64Subtract;
  
    
    function ___setErrNo(value) {
        if (Module['___errno_location']) HEAP32[((Module['___errno_location']())>>2)]=value;
        else Module.printErr('failed to set errno from JS');
        return value;
      }
    
    var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
        // long sysconf(int name);
        // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
        switch(name) {
          case 30: return PAGE_SIZE;
          case 85: return totalMemory / PAGE_SIZE;
          case 132:
          case 133:
          case 12:
          case 137:
          case 138:
          case 15:
          case 235:
          case 16:
          case 17:
          case 18:
          case 19:
          case 20:
          case 149:
          case 13:
          case 10:
          case 236:
          case 153:
          case 9:
          case 21:
          case 22:
          case 159:
          case 154:
          case 14:
          case 77:
          case 78:
          case 139:
          case 80:
          case 81:
          case 82:
          case 68:
          case 67:
          case 164:
          case 11:
          case 29:
          case 47:
          case 48:
          case 95:
          case 52:
          case 51:
          case 46:
            return 200809;
          case 79:
            return 0;
          case 27:
          case 246:
          case 127:
          case 128:
          case 23:
          case 24:
          case 160:
          case 161:
          case 181:
          case 182:
          case 242:
          case 183:
          case 184:
          case 243:
          case 244:
          case 245:
          case 165:
          case 178:
          case 179:
          case 49:
          case 50:
          case 168:
          case 169:
          case 175:
          case 170:
          case 171:
          case 172:
          case 97:
          case 76:
          case 32:
          case 173:
          case 35:
            return -1;
          case 176:
          case 177:
          case 7:
          case 155:
          case 8:
          case 157:
          case 125:
          case 126:
          case 92:
          case 93:
          case 129:
          case 130:
          case 131:
          case 94:
          case 91:
            return 1;
          case 74:
          case 60:
          case 69:
          case 70:
          case 4:
            return 1024;
          case 31:
          case 42:
          case 72:
            return 32;
          case 87:
          case 26:
          case 33:
            return 2147483647;
          case 34:
          case 1:
            return 47839;
          case 38:
          case 36:
            return 99;
          case 43:
          case 37:
            return 2048;
          case 0: return 2097152;
          case 3: return 65536;
          case 28: return 32768;
          case 44: return 32767;
          case 75: return 16384;
          case 39: return 1000;
          case 89: return 700;
          case 71: return 256;
          case 40: return 255;
          case 2: return 100;
          case 180: return 64;
          case 25: return 20;
          case 5: return 16;
          case 6: return 6;
          case 73: return 4;
          case 84: {
            if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
            return 1;
          }
        }
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      }
  
    
    function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
        return !!__ZSt18uncaught_exceptionv.uncaught_exception;
      }
    
    
    
    var EXCEPTIONS={last:0,caught:[],infos:{},deAdjust:function (adjusted) {
          if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
          for (var ptr in EXCEPTIONS.infos) {
            var info = EXCEPTIONS.infos[ptr];
            if (info.adjusted === adjusted) {
              return ptr;
            }
          }
          return adjusted;
        },addRef:function (ptr) {
          if (!ptr) return;
          var info = EXCEPTIONS.infos[ptr];
          info.refcount++;
        },decRef:function (ptr) {
          if (!ptr) return;
          var info = EXCEPTIONS.infos[ptr];
          assert(info.refcount > 0);
          info.refcount--;
          if (info.refcount === 0) {
            if (info.destructor) {
              Runtime.dynCall('vi', info.destructor, [ptr]);
            }
            delete EXCEPTIONS.infos[ptr];
            ___cxa_free_exception(ptr);
          }
        },clearRef:function (ptr) {
          if (!ptr) return;
          var info = EXCEPTIONS.infos[ptr];
          info.refcount = 0;
        }};
    function ___resumeException(ptr) {
        if (!EXCEPTIONS.last) { EXCEPTIONS.last = ptr; }
        EXCEPTIONS.clearRef(EXCEPTIONS.deAdjust(ptr)); // exception refcount should be cleared, but don't free it
        throw ptr;
      }function ___cxa_find_matching_catch() {
        var thrown = EXCEPTIONS.last;
        if (!thrown) {
          // just pass through the null ptr
          return ((asm["setTempRet0"](0),0)|0);
        }
        var info = EXCEPTIONS.infos[thrown];
        var throwntype = info.type;
        if (!throwntype) {
          // just pass through the thrown ptr
          return ((asm["setTempRet0"](0),thrown)|0);
        }
        var typeArray = Array.prototype.slice.call(arguments);
    
        var pointer = Module['___cxa_is_pointer_type'](throwntype);
        // can_catch receives a **, add indirection
        if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
        HEAP32[((___cxa_find_matching_catch.buffer)>>2)]=thrown;
        thrown = ___cxa_find_matching_catch.buffer;
        // The different catch blocks are denoted by different types.
        // Due to inheritance, those types may not precisely match the
        // type of the thrown object. Find one which matches, and
        // return the type of the catch block which should be called.
        for (var i = 0; i < typeArray.length; i++) {
          if (typeArray[i] && Module['___cxa_can_catch'](typeArray[i], throwntype, thrown)) {
            thrown = HEAP32[((thrown)>>2)]; // undo indirection
            info.adjusted = thrown;
            return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
          }
        }
        // Shouldn't happen unless we have bogus data in typeArray
        // or encounter a type for which emscripten doesn't have suitable
        // typeinfo defined. Best-efforts match just in case.
        thrown = HEAP32[((thrown)>>2)]; // undo indirection
        return ((asm["setTempRet0"](throwntype),thrown)|0);
      }function ___cxa_throw(ptr, type, destructor) {
        EXCEPTIONS.infos[ptr] = {
          ptr: ptr,
          adjusted: ptr,
          type: type,
          destructor: destructor,
          refcount: 0
        };
        EXCEPTIONS.last = ptr;
        if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
          __ZSt18uncaught_exceptionv.uncaught_exception = 1;
        } else {
          __ZSt18uncaught_exceptionv.uncaught_exception++;
        }
        throw ptr;
      }
  
     
    Module["_memset"] = _memset;
  
    function ___gxx_personality_v0() {
      }
  
     
    Module["_bitshift64Shl"] = _bitshift64Shl;
  
    function _abort() {
        Module['abort']();
      }
  
    
    
    function _free() {
    }
    Module["_free"] = _free;function ___cxa_free_exception(ptr) {
        try {
          return _free(ptr);
        } catch(e) { // XXX FIXME
          Module.printErr('exception during cxa_free_exception: ' + e);
        }
      }function ___cxa_end_catch() {
        if (___cxa_end_catch.rethrown) {
          ___cxa_end_catch.rethrown = false;
          return;
        }
        // Clear state flag.
        asm['setThrew'](0);
        // Call destructor if one is registered then clear it.
        var ptr = EXCEPTIONS.caught.pop();
        if (ptr) {
          EXCEPTIONS.decRef(EXCEPTIONS.deAdjust(ptr));
          EXCEPTIONS.last = 0; // XXX in decRef?
        }
      }
  
  
    function _pthread_once(ptr, func) {
        if (!_pthread_once.seen) _pthread_once.seen = {};
        if (ptr in _pthread_once.seen) return;
        Runtime.dynCall('v', func);
        _pthread_once.seen[ptr] = 1;
      }
  
    function ___lock() {}
  
    function ___unlock() {}
  
    
    var PTHREAD_SPECIFIC={};function _pthread_getspecific(key) {
        return PTHREAD_SPECIFIC[key] || 0;
      }
  
     
    Module["_i64Add"] = _i64Add;
  
    
    var PTHREAD_SPECIFIC_NEXT_KEY=1;function _pthread_key_create(key, destructor) {
        if (key == 0) {
          return ERRNO_CODES.EINVAL;
        }
        HEAP32[((key)>>2)]=PTHREAD_SPECIFIC_NEXT_KEY;
        // values start at 0
        PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
        PTHREAD_SPECIFIC_NEXT_KEY++;
        return 0;
      }
  
    
    function __exit(status) {
        // void _exit(int status);
        // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
        Module['exit'](status);
      }function _exit(status) {
        __exit(status);
      }
  
    function _pthread_setspecific(key, value) {
        if (!(key in PTHREAD_SPECIFIC)) {
          return ERRNO_CODES.EINVAL;
        }
        PTHREAD_SPECIFIC[key] = value;
        return 0;
      }
  
    
    function _malloc(bytes) {
        /* Over-allocate to make sure it is byte-aligned by 8.
         * This will leak memory, but this is only the dummy
         * implementation (replaced by dlmalloc normally) so
         * not an issue.
         */
        var ptr = Runtime.dynamicAlloc(bytes + 8);
        return (ptr+8) & 0xFFFFFFF8;
      }
    Module["_malloc"] = _malloc;function ___cxa_allocate_exception(size) {
        return _malloc(size);
      }
  
    
    
    
    var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
    
    var PATH={splitPath:function (filename) {
          var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
          return splitPathRe.exec(filename).slice(1);
        },normalizeArray:function (parts, allowAboveRoot) {
          // if the path tries to go above the root, `up` ends up > 0
          var up = 0;
          for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === '.') {
              parts.splice(i, 1);
            } else if (last === '..') {
              parts.splice(i, 1);
              up++;
            } else if (up) {
              parts.splice(i, 1);
              up--;
            }
          }
          // if the path is allowed to go above the root, restore leading ..s
          if (allowAboveRoot) {
            for (; up--; up) {
              parts.unshift('..');
            }
          }
          return parts;
        },normalize:function (path) {
          var isAbsolute = path.charAt(0) === '/',
              trailingSlash = path.substr(-1) === '/';
          // Normalize the path
          path = PATH.normalizeArray(path.split('/').filter(function(p) {
            return !!p;
          }), !isAbsolute).join('/');
          if (!path && !isAbsolute) {
            path = '.';
          }
          if (path && trailingSlash) {
            path += '/';
          }
          return (isAbsolute ? '/' : '') + path;
        },dirname:function (path) {
          var result = PATH.splitPath(path),
              root = result[0],
              dir = result[1];
          if (!root && !dir) {
            // No dirname whatsoever
            return '.';
          }
          if (dir) {
            // It has a dirname, strip trailing slash
            dir = dir.substr(0, dir.length - 1);
          }
          return root + dir;
        },basename:function (path) {
          // EMSCRIPTEN return '/'' for '/', not an empty string
          if (path === '/') return '/';
          var lastSlash = path.lastIndexOf('/');
          if (lastSlash === -1) return path;
          return path.substr(lastSlash+1);
        },extname:function (path) {
          return PATH.splitPath(path)[3];
        },join:function () {
          var paths = Array.prototype.slice.call(arguments, 0);
          return PATH.normalize(paths.join('/'));
        },join2:function (l, r) {
          return PATH.normalize(l + '/' + r);
        },resolve:function () {
          var resolvedPath = '',
            resolvedAbsolute = false;
          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = (i >= 0) ? arguments[i] : FS.cwd();
            // Skip empty and invalid entries
            if (typeof path !== 'string') {
              throw new TypeError('Arguments to path.resolve must be strings');
            } else if (!path) {
              return ''; // an invalid portion invalidates the whole thing
            }
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = path.charAt(0) === '/';
          }
          // At this point the path should be resolved to a full absolute path, but
          // handle relative paths to be safe (might happen when process.cwd() fails)
          resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
            return !!p;
          }), !resolvedAbsolute).join('/');
          return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
        },relative:function (from, to) {
          from = PATH.resolve(from).substr(1);
          to = PATH.resolve(to).substr(1);
          function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
              if (arr[start] !== '') break;
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
              if (arr[end] !== '') break;
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1);
          }
          var fromParts = trim(from.split('/'));
          var toParts = trim(to.split('/'));
          var length = Math.min(fromParts.length, toParts.length);
          var samePartsLength = length;
          for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
              samePartsLength = i;
              break;
            }
          }
          var outputParts = [];
          for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push('..');
          }
          outputParts = outputParts.concat(toParts.slice(samePartsLength));
          return outputParts.join('/');
        }};
    
    var TTY={ttys:[],init:function () {
          // https://github.com/kripken/emscripten/pull/1555
          // if (ENVIRONMENT_IS_NODE) {
          //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
          //   // device, it always assumes it's a TTY device. because of this, we're forcing
          //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
          //   // with text files until FS.init can be refactored.
          //   process['stdin']['setEncoding']('utf8');
          // }
        },shutdown:function () {
          // https://github.com/kripken/emscripten/pull/1555
          // if (ENVIRONMENT_IS_NODE) {
          //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
          //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
          //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
          //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
          //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
          //   process['stdin']['pause']();
          // }
        },register:function (dev, ops) {
          TTY.ttys[dev] = { input: [], output: [], ops: ops };
          FS.registerDevice(dev, TTY.stream_ops);
        },stream_ops:{open:function (stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
              throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            }
            stream.tty = tty;
            stream.seekable = false;
          },close:function (stream) {
            // flush any pending line data
            stream.tty.ops.flush(stream.tty);
          },flush:function (stream) {
            stream.tty.ops.flush(stream.tty);
          },read:function (stream, buffer, offset, length, pos /* ignored */) {
            if (!stream.tty || !stream.tty.ops.get_char) {
              throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = stream.tty.ops.get_char(stream.tty);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },write:function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
              throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
            }
            for (var i = 0; i < length; i++) {
              try {
                stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }},default_tty_ops:{get_char:function (tty) {
            if (!tty.input.length) {
              var result = null;
              if (ENVIRONMENT_IS_NODE) {
                // we will read data by chunks of BUFSIZE
                var BUFSIZE = 256;
                var buf = new Buffer(BUFSIZE);
                var bytesRead = 0;
    
                var fd = process.stdin.fd;
                // Linux and Mac cannot use process.stdin.fd (which isn't set up as sync)
                var usingDevice = false;
                try {
                  fd = fs.openSync('/dev/stdin', 'r');
                  usingDevice = true;
                } catch (e) {}
    
                bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
    
                if (usingDevice) { fs.closeSync(fd); }
                if (bytesRead > 0) {
                  result = buf.slice(0, bytesRead).toString('utf-8');
                } else {
                  result = null;
                }
    
              } else if (typeof window != 'undefined' &&
                typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');  // returns null on cancel
                if (result !== null) {
                  result += '\n';
                }
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
                if (result !== null) {
                  result += '\n';
                }
              }
              if (!result) {
                return null;
              }
              tty.input = intArrayFromString(result, true);
            }
            return tty.input.shift();
          },put_char:function (tty, val) {
            if (val === null || val === 10) {
              Module['print'](UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
            }
          },flush:function (tty) {
            if (tty.output && tty.output.length > 0) {
              Module['print'](UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          }},default_tty1_ops:{put_char:function (tty, val) {
            if (val === null || val === 10) {
              Module['printErr'](UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },flush:function (tty) {
            if (tty.output && tty.output.length > 0) {
              Module['printErr'](UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          }}};
    
    var MEMFS={ops_table:null,mount:function (mount) {
          return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
        },createNode:function (parent, name, mode, dev) {
          if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            // no supported
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
              dir: {
                node: {
                  getattr: MEMFS.node_ops.getattr,
                  setattr: MEMFS.node_ops.setattr,
                  lookup: MEMFS.node_ops.lookup,
                  mknod: MEMFS.node_ops.mknod,
                  rename: MEMFS.node_ops.rename,
                  unlink: MEMFS.node_ops.unlink,
                  rmdir: MEMFS.node_ops.rmdir,
                  readdir: MEMFS.node_ops.readdir,
                  symlink: MEMFS.node_ops.symlink
                },
                stream: {
                  llseek: MEMFS.stream_ops.llseek
                }
              },
              file: {
                node: {
                  getattr: MEMFS.node_ops.getattr,
                  setattr: MEMFS.node_ops.setattr
                },
                stream: {
                  llseek: MEMFS.stream_ops.llseek,
                  read: MEMFS.stream_ops.read,
                  write: MEMFS.stream_ops.write,
                  allocate: MEMFS.stream_ops.allocate,
                  mmap: MEMFS.stream_ops.mmap,
                  msync: MEMFS.stream_ops.msync
                }
              },
              link: {
                node: {
                  getattr: MEMFS.node_ops.getattr,
                  setattr: MEMFS.node_ops.setattr,
                  readlink: MEMFS.node_ops.readlink
                },
                stream: {}
              },
              chrdev: {
                node: {
                  getattr: MEMFS.node_ops.getattr,
                  setattr: MEMFS.node_ops.setattr
                },
                stream: FS.chrdev_stream_ops
              }
            };
          }
          var node = FS.createNode(parent, name, mode, dev);
          if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {};
          } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
            // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
            // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
            // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
            node.contents = null; 
          } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream;
          } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream;
          }
          node.timestamp = Date.now();
          // add the new node to the parent
          if (parent) {
            parent.contents[name] = node;
          }
          return node;
        },getFileDataAsRegularArray:function (node) {
          if (node.contents && node.contents.subarray) {
            var arr = [];
            for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
            return arr; // Returns a copy of the original data.
          }
          return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
        },getFileDataAsTypedArray:function (node) {
          if (!node.contents) return new Uint8Array;
          if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
          return new Uint8Array(node.contents);
        },expandFileStorage:function (node, newCapacity) {
          // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
          // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
          // increase the size.
          if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
            node.contents = MEMFS.getFileDataAsRegularArray(node);
            node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
          }
    
          if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
            var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
            if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
            // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
            // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
            // avoid overshooting the allocation cap by a very large margin.
            var CAPACITY_DOUBLING_MAX = 1024 * 1024;
            newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
            if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
            var oldContents = node.contents;
            node.contents = new Uint8Array(newCapacity); // Allocate new storage.
            if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
            return;
          }
          // Not using a typed array to back the file storage. Use a standard JS array instead.
          if (!node.contents && newCapacity > 0) node.contents = [];
          while (node.contents.length < newCapacity) node.contents.push(0);
        },resizeFileStorage:function (node, newSize) {
          if (node.usedBytes == newSize) return;
          if (newSize == 0) {
            node.contents = null; // Fully decommit when requesting a resize to zero.
            node.usedBytes = 0;
            return;
          }
          if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
            var oldContents = node.contents;
            node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
            if (oldContents) {
              node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
            }
            node.usedBytes = newSize;
            return;
          }
          // Backing with a JS array.
          if (!node.contents) node.contents = [];
          if (node.contents.length > newSize) node.contents.length = newSize;
          else while (node.contents.length < newSize) node.contents.push(0);
          node.usedBytes = newSize;
        },node_ops:{getattr:function (node) {
            var attr = {};
            // device numbers reuse inode numbers.
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
              attr.size = 4096;
            } else if (FS.isFile(node.mode)) {
              attr.size = node.usedBytes;
            } else if (FS.isLink(node.mode)) {
              attr.size = node.link.length;
            } else {
              attr.size = 0;
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
            //       but this is not required by the standard.
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr;
          },setattr:function (node, attr) {
            if (attr.mode !== undefined) {
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              node.timestamp = attr.timestamp;
            }
            if (attr.size !== undefined) {
              MEMFS.resizeFileStorage(node, attr.size);
            }
          },lookup:function (parent, name) {
            throw FS.genericErrors[ERRNO_CODES.ENOENT];
          },mknod:function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
          },rename:function (old_node, new_dir, new_name) {
            // if we're overwriting a directory at new_name, make sure it's empty.
            if (FS.isDir(old_node.mode)) {
              var new_node;
              try {
                new_node = FS.lookupNode(new_dir, new_name);
              } catch (e) {
              }
              if (new_node) {
                for (var i in new_node.contents) {
                  throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
                }
              }
            }
            // do the internal rewiring
            delete old_node.parent.contents[old_node.name];
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            old_node.parent = new_dir;
          },unlink:function (parent, name) {
            delete parent.contents[name];
          },rmdir:function (parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
            }
            delete parent.contents[name];
          },readdir:function (node) {
            var entries = ['.', '..']
            for (var key in node.contents) {
              if (!node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            return entries;
          },symlink:function (parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
            node.link = oldpath;
            return node;
          },readlink:function (node) {
            if (!FS.isLink(node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            return node.link;
          }},stream_ops:{read:function (stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            assert(size >= 0);
            if (size > 8 && contents.subarray) { // non-trivial, and typed array
              buffer.set(contents.subarray(position, position + size), offset);
            } else {
              for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
            }
            return size;
          },write:function (stream, buffer, offset, length, position, canOwn) {
            if (!length) return 0;
            var node = stream.node;
            node.timestamp = Date.now();
    
            if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
              if (canOwn) { // Can we just reuse the buffer we are given?
                assert(position === 0, 'canOwn must imply no weird position inside the file');
                node.contents = buffer.subarray(offset, offset + length);
                node.usedBytes = length;
                return length;
              } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
                node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
                node.usedBytes = length;
                return length;
              } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
                node.contents.set(buffer.subarray(offset, offset + length), position);
                return length;
              }
            }
    
            // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
            MEMFS.expandFileStorage(node, position+length);
            if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
            else {
              for (var i = 0; i < length; i++) {
               node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
              }
            }
            node.usedBytes = Math.max(node.usedBytes, position+length);
            return length;
          },llseek:function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {  // SEEK_CUR.
              position += stream.position;
            } else if (whence === 2) {  // SEEK_END.
              if (FS.isFile(stream.node.mode)) {
                position += stream.node.usedBytes;
              }
            }
            if (position < 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            return position;
          },allocate:function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
          },mmap:function (stream, buffer, offset, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            // Only make a new copy when MAP_PRIVATE is specified.
            if ( !(flags & 2) &&
                  (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
              // We can't emulate MAP_SHARED when the file is not backed by the buffer
              // we're mapping to (e.g. the HEAP buffer).
              allocated = false;
              ptr = contents.byteOffset;
            } else {
              // Try to avoid unnecessary slices.
              if (position > 0 || position + length < stream.node.usedBytes) {
                if (contents.subarray) {
                  contents = contents.subarray(position, position + length);
                } else {
                  contents = Array.prototype.slice.call(contents, position, position + length);
                }
              }
              allocated = true;
              ptr = _malloc(length);
              if (!ptr) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
              }
              buffer.set(contents, ptr);
            }
            return { ptr: ptr, allocated: allocated };
          },msync:function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            }
            if (mmapFlags & 2) {
              // MAP_PRIVATE calls need not to be synced back to underlying fs
              return 0;
            }
    
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            // should we check if bytesWritten and length are the same?
            return 0;
          }}};
    
    var IDBFS={dbs:{},indexedDB:function () {
          if (typeof indexedDB !== 'undefined') return indexedDB;
          var ret = null;
          if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
          assert(ret, 'IDBFS used, but indexedDB not supported');
          return ret;
        },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
          // reuse all of the core MEMFS functionality
          return MEMFS.mount.apply(null, arguments);
        },syncfs:function (mount, populate, callback) {
          IDBFS.getLocalSet(mount, function(err, local) {
            if (err) return callback(err);
    
            IDBFS.getRemoteSet(mount, function(err, remote) {
              if (err) return callback(err);
    
              var src = populate ? remote : local;
              var dst = populate ? local : remote;
    
              IDBFS.reconcile(src, dst, callback);
            });
          });
        },getDB:function (name, callback) {
          // check the cache first
          var db = IDBFS.dbs[name];
          if (db) {
            return callback(null, db);
          }
    
          var req;
          try {
            req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
          } catch (e) {
            return callback(e);
          }
          req.onupgradeneeded = function(e) {
            var db = e.target.result;
            var transaction = e.target.transaction;
    
            var fileStore;
    
            if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
              fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
            } else {
              fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
            }
    
            if (!fileStore.indexNames.contains('timestamp')) {
              fileStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
          };
          req.onsuccess = function() {
            db = req.result;
    
            // add to the cache
            IDBFS.dbs[name] = db;
            callback(null, db);
          };
          req.onerror = function(e) {
            callback(this.error);
            e.preventDefault();
          };
        },getLocalSet:function (mount, callback) {
          var entries = {};
    
          function isRealDir(p) {
            return p !== '.' && p !== '..';
          };
          function toAbsolute(root) {
            return function(p) {
              return PATH.join2(root, p);
            }
          };
    
          var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
    
          while (check.length) {
            var path = check.pop();
            var stat;
    
            try {
              stat = FS.stat(path);
            } catch (e) {
              return callback(e);
            }
    
            if (FS.isDir(stat.mode)) {
              check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
            }
    
            entries[path] = { timestamp: stat.mtime };
          }
    
          return callback(null, { type: 'local', entries: entries });
        },getRemoteSet:function (mount, callback) {
          var entries = {};
    
          IDBFS.getDB(mount.mountpoint, function(err, db) {
            if (err) return callback(err);
    
            var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
            transaction.onerror = function(e) {
              callback(this.error);
              e.preventDefault();
            };
    
            var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
            var index = store.index('timestamp');
    
            index.openKeyCursor().onsuccess = function(event) {
              var cursor = event.target.result;
    
              if (!cursor) {
                return callback(null, { type: 'remote', db: db, entries: entries });
              }
    
              entries[cursor.primaryKey] = { timestamp: cursor.key };
    
              cursor.continue();
            };
          });
        },loadLocalEntry:function (path, callback) {
          var stat, node;
    
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
    
          if (FS.isDir(stat.mode)) {
            return callback(null, { timestamp: stat.mtime, mode: stat.mode });
          } else if (FS.isFile(stat.mode)) {
            // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
            // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
            node.contents = MEMFS.getFileDataAsTypedArray(node);
            return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
          } else {
            return callback(new Error('node type not supported'));
          }
        },storeLocalEntry:function (path, entry, callback) {
          try {
            if (FS.isDir(entry.mode)) {
              FS.mkdir(path, entry.mode);
            } else if (FS.isFile(entry.mode)) {
              FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
            } else {
              return callback(new Error('node type not supported'));
            }
    
            FS.chmod(path, entry.mode);
            FS.utime(path, entry.timestamp, entry.timestamp);
          } catch (e) {
            return callback(e);
          }
    
          callback(null);
        },removeLocalEntry:function (path, callback) {
          try {
            var lookup = FS.lookupPath(path);
            var stat = FS.stat(path);
    
            if (FS.isDir(stat.mode)) {
              FS.rmdir(path);
            } else if (FS.isFile(stat.mode)) {
              FS.unlink(path);
            }
          } catch (e) {
            return callback(e);
          }
    
          callback(null);
        },loadRemoteEntry:function (store, path, callback) {
          var req = store.get(path);
          req.onsuccess = function(event) { callback(null, event.target.result); };
          req.onerror = function(e) {
            callback(this.error);
            e.preventDefault();
          };
        },storeRemoteEntry:function (store, path, entry, callback) {
          var req = store.put(entry, path);
          req.onsuccess = function() { callback(null); };
          req.onerror = function(e) {
            callback(this.error);
            e.preventDefault();
          };
        },removeRemoteEntry:function (store, path, callback) {
          var req = store.delete(path);
          req.onsuccess = function() { callback(null); };
          req.onerror = function(e) {
            callback(this.error);
            e.preventDefault();
          };
        },reconcile:function (src, dst, callback) {
          var total = 0;
    
          var create = [];
          Object.keys(src.entries).forEach(function (key) {
            var e = src.entries[key];
            var e2 = dst.entries[key];
            if (!e2 || e.timestamp > e2.timestamp) {
              create.push(key);
              total++;
            }
          });
    
          var remove = [];
          Object.keys(dst.entries).forEach(function (key) {
            var e = dst.entries[key];
            var e2 = src.entries[key];
            if (!e2) {
              remove.push(key);
              total++;
            }
          });
    
          if (!total) {
            return callback(null);
          }
    
          var errored = false;
          var completed = 0;
          var db = src.type === 'remote' ? src.db : dst.db;
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
    
          function done(err) {
            if (err) {
              if (!done.errored) {
                done.errored = true;
                return callback(err);
              }
              return;
            }
            if (++completed >= total) {
              return callback(null);
            }
          };
    
          transaction.onerror = function(e) {
            done(this.error);
            e.preventDefault();
          };
    
          // sort paths in ascending order so directory entries are created
          // before the files inside them
          create.sort().forEach(function (path) {
            if (dst.type === 'local') {
              IDBFS.loadRemoteEntry(store, path, function (err, entry) {
                if (err) return done(err);
                IDBFS.storeLocalEntry(path, entry, done);
              });
            } else {
              IDBFS.loadLocalEntry(path, function (err, entry) {
                if (err) return done(err);
                IDBFS.storeRemoteEntry(store, path, entry, done);
              });
            }
          });
    
          // sort paths in descending order so files are deleted before their
          // parent directories
          remove.sort().reverse().forEach(function(path) {
            if (dst.type === 'local') {
              IDBFS.removeLocalEntry(path, done);
            } else {
              IDBFS.removeRemoteEntry(store, path, done);
            }
          });
        }};
    
    var NODEFS={isWindows:false,staticInit:function () {
          NODEFS.isWindows = !!process.platform.match(/^win/);
        },mount:function (mount) {
          assert(ENVIRONMENT_IS_NODE);
          return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
        },createNode:function (parent, name, mode, dev) {
          if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var node = FS.createNode(parent, name, mode);
          node.node_ops = NODEFS.node_ops;
          node.stream_ops = NODEFS.stream_ops;
          return node;
        },getMode:function (path) {
          var stat;
          try {
            stat = fs.lstatSync(path);
            if (NODEFS.isWindows) {
              // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so
              // propagate write bits to execute bits.
              stat.mode = stat.mode | ((stat.mode & 146) >> 1);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return stat.mode;
        },realPath:function (node) {
          var parts = [];
          while (node.parent !== node) {
            parts.push(node.name);
            node = node.parent;
          }
          parts.push(node.mount.opts.root);
          parts.reverse();
          return PATH.join.apply(null, parts);
        },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
          flags &= ~0100000 /*O_LARGEFILE*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
          flags &= ~02000000 /*O_CLOEXEC*/; // Some applications may pass it; it makes no sense for a single process.
          if (flags in NODEFS.flagsToPermissionStringMap) {
            return NODEFS.flagsToPermissionStringMap[flags];
          } else {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },node_ops:{getattr:function (node) {
            var path = NODEFS.realPath(node);
            var stat;
            try {
              stat = fs.lstatSync(path);
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
            // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
            // See http://support.microsoft.com/kb/140365
            if (NODEFS.isWindows && !stat.blksize) {
              stat.blksize = 4096;
            }
            if (NODEFS.isWindows && !stat.blocks) {
              stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
            }
            return {
              dev: stat.dev,
              ino: stat.ino,
              mode: stat.mode,
              nlink: stat.nlink,
              uid: stat.uid,
              gid: stat.gid,
              rdev: stat.rdev,
              size: stat.size,
              atime: stat.atime,
              mtime: stat.mtime,
              ctime: stat.ctime,
              blksize: stat.blksize,
              blocks: stat.blocks
            };
          },setattr:function (node, attr) {
            var path = NODEFS.realPath(node);
            try {
              if (attr.mode !== undefined) {
                fs.chmodSync(path, attr.mode);
                // update the common node structure mode as well
                node.mode = attr.mode;
              }
              if (attr.timestamp !== undefined) {
                var date = new Date(attr.timestamp);
                fs.utimesSync(path, date, date);
              }
              if (attr.size !== undefined) {
                fs.truncateSync(path, attr.size);
              }
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          },lookup:function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            var mode = NODEFS.getMode(path);
            return NODEFS.createNode(parent, name, mode);
          },mknod:function (parent, name, mode, dev) {
            var node = NODEFS.createNode(parent, name, mode, dev);
            // create the backing node for this in the fs root as well
            var path = NODEFS.realPath(node);
            try {
              if (FS.isDir(node.mode)) {
                fs.mkdirSync(path, node.mode);
              } else {
                fs.writeFileSync(path, '', { mode: node.mode });
              }
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
            return node;
          },rename:function (oldNode, newDir, newName) {
            var oldPath = NODEFS.realPath(oldNode);
            var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
            try {
              fs.renameSync(oldPath, newPath);
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          },unlink:function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            try {
              fs.unlinkSync(path);
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          },rmdir:function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            try {
              fs.rmdirSync(path);
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          },readdir:function (node) {
            var path = NODEFS.realPath(node);
            try {
              return fs.readdirSync(path);
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          },symlink:function (parent, newName, oldPath) {
            var newPath = PATH.join2(NODEFS.realPath(parent), newName);
            try {
              fs.symlinkSync(oldPath, newPath);
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          },readlink:function (node) {
            var path = NODEFS.realPath(node);
            try {
              path = fs.readlinkSync(path);
              path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
              return path;
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          }},stream_ops:{open:function (stream) {
            var path = NODEFS.realPath(stream.node);
            try {
              if (FS.isFile(stream.node.mode)) {
                stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
              }
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          },close:function (stream) {
            try {
              if (FS.isFile(stream.node.mode) && stream.nfd) {
                fs.closeSync(stream.nfd);
              }
            } catch (e) {
              if (!e.code) throw e;
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
          },read:function (stream, buffer, offset, length, position) {
            if (length === 0) return 0; // node errors on 0 length reads
            // FIXME this is terrible.
            var nbuffer = new Buffer(length);
            var res;
            try {
              res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
            if (res > 0) {
              for (var i = 0; i < res; i++) {
                buffer[offset + i] = nbuffer[i];
              }
            }
            return res;
          },write:function (stream, buffer, offset, length, position) {
            // FIXME this is terrible.
            var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
            var res;
            try {
              res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            }
            return res;
          },llseek:function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {  // SEEK_CUR.
              position += stream.position;
            } else if (whence === 2) {  // SEEK_END.
              if (FS.isFile(stream.node.mode)) {
                try {
                  var stat = fs.fstatSync(stream.nfd);
                  position += stat.size;
                } catch (e) {
                  throw new FS.ErrnoError(ERRNO_CODES[e.code]);
                }
              }
            }
    
            if (position < 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
    
            return position;
          }}};
    
    var WORKERFS={DIR_MODE:16895,FILE_MODE:33279,reader:null,mount:function (mount) {
          assert(ENVIRONMENT_IS_WORKER);
          if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
          var root = WORKERFS.createNode(null, '/', WORKERFS.DIR_MODE, 0);
          var createdParents = {};
          function ensureParent(path) {
            // return the parent node, creating subdirs as necessary
            var parts = path.split('/');
            var parent = root;
            for (var i = 0; i < parts.length-1; i++) {
              var curr = parts.slice(0, i+1).join('/');
              if (!createdParents[curr]) {
                createdParents[curr] = WORKERFS.createNode(parent, curr, WORKERFS.DIR_MODE, 0);
              }
              parent = createdParents[curr];
            }
            return parent;
          }
          function base(path) {
            var parts = path.split('/');
            return parts[parts.length-1];
          }
          // We also accept FileList here, by using Array.prototype
          Array.prototype.forEach.call(mount.opts["files"] || [], function(file) {
            WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
          });
          (mount.opts["blobs"] || []).forEach(function(obj) {
            WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]);
          });
          (mount.opts["packages"] || []).forEach(function(pack) {
            pack['metadata'].files.forEach(function(file) {
              var name = file.filename.substr(1); // remove initial slash
              WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack['blob'].slice(file.start, file.end));
            });
          });
          return root;
        },createNode:function (parent, name, mode, dev, contents, mtime) {
          var node = FS.createNode(parent, name, mode);
          node.mode = mode;
          node.node_ops = WORKERFS.node_ops;
          node.stream_ops = WORKERFS.stream_ops;
          node.timestamp = (mtime || new Date).getTime();
          assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
          if (mode === WORKERFS.FILE_MODE) {
            node.size = contents.size;
            node.contents = contents;
          } else {
            node.size = 4096;
            node.contents = {};
          }
          if (parent) {
            parent.contents[name] = node;
          }
          return node;
        },node_ops:{getattr:function (node) {
            return {
              dev: 1,
              ino: undefined,
              mode: node.mode,
              nlink: 1,
              uid: 0,
              gid: 0,
              rdev: undefined,
              size: node.size,
              atime: new Date(node.timestamp),
              mtime: new Date(node.timestamp),
              ctime: new Date(node.timestamp),
              blksize: 4096,
              blocks: Math.ceil(node.size / 4096),
            };
          },setattr:function (node, attr) {
            if (attr.mode !== undefined) {
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              node.timestamp = attr.timestamp;
            }
          },lookup:function (parent, name) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
          },mknod:function (parent, name, mode, dev) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          },rename:function (oldNode, newDir, newName) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          },unlink:function (parent, name) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          },rmdir:function (parent, name) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          },readdir:function (node) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          },symlink:function (parent, newName, oldPath) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          },readlink:function (node) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }},stream_ops:{read:function (stream, buffer, offset, length, position) {
            if (position >= stream.node.size) return 0;
            var chunk = stream.node.contents.slice(position, position + length);
            var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
            buffer.set(new Uint8Array(ab), offset);
            return chunk.size;
          },write:function (stream, buffer, offset, length, position) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          },llseek:function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {  // SEEK_CUR.
              position += stream.position;
            } else if (whence === 2) {  // SEEK_END.
              if (FS.isFile(stream.node.mode)) {
                position += stream.node.size;
              }
            }
            if (position < 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            }
            return position;
          }}};
    
    var _stdin=STATICTOP; STATICTOP += 16;;
    
    var _stdout=STATICTOP; STATICTOP += 16;;
    
    var _stderr=STATICTOP; STATICTOP += 16;;var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,handleFSError:function (e) {
          if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
          return ___setErrNo(e.errno);
        },lookupPath:function (path, opts) {
          path = PATH.resolve(FS.cwd(), path);
          opts = opts || {};
    
          if (!path) return { path: '', node: null };
    
          var defaults = {
            follow_mount: true,
            recurse_count: 0
          };
          for (var key in defaults) {
            if (opts[key] === undefined) {
              opts[key] = defaults[key];
            }
          }
    
          if (opts.recurse_count > 8) {  // max recursive lookup of 8
            throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
          }
    
          // split the path
          var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
            return !!p;
          }), false);
    
          // start at the root
          var current = FS.root;
          var current_path = '/';
    
          for (var i = 0; i < parts.length; i++) {
            var islast = (i === parts.length-1);
            if (islast && opts.parent) {
              // stop resolving
              break;
            }
    
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
    
            // jump to the mount's root node if this is a mountpoint
            if (FS.isMountpoint(current)) {
              if (!islast || (islast && opts.follow_mount)) {
                current = current.mounted.root;
              }
            }
    
            // by default, lookupPath will not follow a symlink if it is the final path component.
            // setting opts.follow = true will override this behavior.
            if (!islast || opts.follow) {
              var count = 0;
              while (FS.isLink(current.mode)) {
                var link = FS.readlink(current_path);
                current_path = PATH.resolve(PATH.dirname(current_path), link);
    
                var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
                current = lookup.node;
    
                if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                  throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
                }
              }
            }
          }
    
          return { path: current_path, node: current };
        },getPath:function (node) {
          var path;
          while (true) {
            if (FS.isRoot(node)) {
              var mount = node.mount.mountpoint;
              if (!path) return mount;
              return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
            }
            path = path ? node.name + '/' + path : node.name;
            node = node.parent;
          }
        },hashName:function (parentid, name) {
          var hash = 0;
    
    
          for (var i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
          }
          return ((parentid + hash) >>> 0) % FS.nameTable.length;
        },hashAddNode:function (node) {
          var hash = FS.hashName(node.parent.id, node.name);
          node.name_next = FS.nameTable[hash];
          FS.nameTable[hash] = node;
        },hashRemoveNode:function (node) {
          var hash = FS.hashName(node.parent.id, node.name);
          if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next;
          } else {
            var current = FS.nameTable[hash];
            while (current) {
              if (current.name_next === node) {
                current.name_next = node.name_next;
                break;
              }
              current = current.name_next;
            }
          }
        },lookupNode:function (parent, name) {
          var err = FS.mayLookup(parent);
          if (err) {
            throw new FS.ErrnoError(err, parent);
          }
          var hash = FS.hashName(parent.id, name);
          for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
              return node;
            }
          }
          // if we failed to find it in the cache, call into the VFS
          return FS.lookup(parent, name);
        },createNode:function (parent, name, mode, rdev) {
          if (!FS.FSNode) {
            FS.FSNode = function(parent, name, mode, rdev) {
              if (!parent) {
                parent = this;  // root node sets parent to itself
              }
              this.parent = parent;
              this.mount = parent.mount;
              this.mounted = null;
              this.id = FS.nextInode++;
              this.name = name;
              this.mode = mode;
              this.node_ops = {};
              this.stream_ops = {};
              this.rdev = rdev;
            };
    
            FS.FSNode.prototype = {};
    
            // compatibility
            var readMode = 292 | 73;
            var writeMode = 146;
    
            // NOTE we must use Object.defineProperties instead of individual calls to
            // Object.defineProperty in order to make closure compiler happy
            Object.defineProperties(FS.FSNode.prototype, {
              read: {
                get: function() { return (this.mode & readMode) === readMode; },
                set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
              },
              write: {
                get: function() { return (this.mode & writeMode) === writeMode; },
                set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
              },
              isFolder: {
                get: function() { return FS.isDir(this.mode); }
              },
              isDevice: {
                get: function() { return FS.isChrdev(this.mode); }
              }
            });
          }
    
          var node = new FS.FSNode(parent, name, mode, rdev);
    
          FS.hashAddNode(node);
    
          return node;
        },destroyNode:function (node) {
          FS.hashRemoveNode(node);
        },isRoot:function (node) {
          return node === node.parent;
        },isMountpoint:function (node) {
          return !!node.mounted;
        },isFile:function (mode) {
          return (mode & 61440) === 32768;
        },isDir:function (mode) {
          return (mode & 61440) === 16384;
        },isLink:function (mode) {
          return (mode & 61440) === 40960;
        },isChrdev:function (mode) {
          return (mode & 61440) === 8192;
        },isBlkdev:function (mode) {
          return (mode & 61440) === 24576;
        },isFIFO:function (mode) {
          return (mode & 61440) === 4096;
        },isSocket:function (mode) {
          return (mode & 49152) === 49152;
        },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
          var flags = FS.flagModes[str];
          if (typeof flags === 'undefined') {
            throw new Error('Unknown file open mode: ' + str);
          }
          return flags;
        },flagsToPermissionString:function (flag) {
          var perms = ['r', 'w', 'rw'][flag & 3];
          if ((flag & 512)) {
            perms += 'w';
          }
          return perms;
        },nodePermissions:function (node, perms) {
          if (FS.ignorePermissions) {
            return 0;
          }
          // return 0 if any user, group or owner bits are set.
          if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
            return ERRNO_CODES.EACCES;
          } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
            return ERRNO_CODES.EACCES;
          } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
            return ERRNO_CODES.EACCES;
          }
          return 0;
        },mayLookup:function (dir) {
          var err = FS.nodePermissions(dir, 'x');
          if (err) return err;
          if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
          return 0;
        },mayCreate:function (dir, name) {
          try {
            var node = FS.lookupNode(dir, name);
            return ERRNO_CODES.EEXIST;
          } catch (e) {
          }
          return FS.nodePermissions(dir, 'wx');
        },mayDelete:function (dir, name, isdir) {
          var node;
          try {
            node = FS.lookupNode(dir, name);
          } catch (e) {
            return e.errno;
          }
          var err = FS.nodePermissions(dir, 'wx');
          if (err) {
            return err;
          }
          if (isdir) {
            if (!FS.isDir(node.mode)) {
              return ERRNO_CODES.ENOTDIR;
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
              return ERRNO_CODES.EBUSY;
            }
          } else {
            if (FS.isDir(node.mode)) {
              return ERRNO_CODES.EISDIR;
            }
          }
          return 0;
        },mayOpen:function (node, flags) {
          if (!node) {
            return ERRNO_CODES.ENOENT;
          }
          if (FS.isLink(node.mode)) {
            return ERRNO_CODES.ELOOP;
          } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
                (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
              return ERRNO_CODES.EISDIR;
            }
          }
          return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
        },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
          fd_start = fd_start || 0;
          fd_end = fd_end || FS.MAX_OPEN_FDS;
          for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
              return fd;
            }
          }
          throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
        },getStream:function (fd) {
          return FS.streams[fd];
        },createStream:function (stream, fd_start, fd_end) {
          if (!FS.FSStream) {
            FS.FSStream = function(){};
            FS.FSStream.prototype = {};
            // compatibility
            Object.defineProperties(FS.FSStream.prototype, {
              object: {
                get: function() { return this.node; },
                set: function(val) { this.node = val; }
              },
              isRead: {
                get: function() { return (this.flags & 2097155) !== 1; }
              },
              isWrite: {
                get: function() { return (this.flags & 2097155) !== 0; }
              },
              isAppend: {
                get: function() { return (this.flags & 1024); }
              }
            });
          }
          // clone it, so we can return an instance of FSStream
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
          var fd = FS.nextfd(fd_start, fd_end);
          stream.fd = fd;
          FS.streams[fd] = stream;
          return stream;
        },closeStream:function (fd) {
          FS.streams[fd] = null;
        },chrdev_stream_ops:{open:function (stream) {
            var device = FS.getDevice(stream.node.rdev);
            // override node's stream ops with the device's
            stream.stream_ops = device.stream_ops;
            // forward the open call
            if (stream.stream_ops.open) {
              stream.stream_ops.open(stream);
            }
          },llseek:function () {
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
          }},major:function (dev) {
          return ((dev) >> 8);
        },minor:function (dev) {
          return ((dev) & 0xff);
        },makedev:function (ma, mi) {
          return ((ma) << 8 | (mi));
        },registerDevice:function (dev, ops) {
          FS.devices[dev] = { stream_ops: ops };
        },getDevice:function (dev) {
          return FS.devices[dev];
        },getMounts:function (mount) {
          var mounts = [];
          var check = [mount];
    
          while (check.length) {
            var m = check.pop();
    
            mounts.push(m);
    
            check.push.apply(check, m.mounts);
          }
    
          return mounts;
        },syncfs:function (populate, callback) {
          if (typeof(populate) === 'function') {
            callback = populate;
            populate = false;
          }
    
          FS.syncFSRequests++;
    
          if (FS.syncFSRequests > 1) {
            console.log('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
          }
    
          var mounts = FS.getMounts(FS.root.mount);
          var completed = 0;
    
          function doCallback(err) {
            assert(FS.syncFSRequests > 0);
            FS.syncFSRequests--;
            return callback(err);
          }
    
          function done(err) {
            if (err) {
              if (!done.errored) {
                done.errored = true;
                return doCallback(err);
              }
              return;
            }
            if (++completed >= mounts.length) {
              doCallback(null);
            }
          };
    
          // sync all mounts
          mounts.forEach(function (mount) {
            if (!mount.type.syncfs) {
              return done(null);
            }
            mount.type.syncfs(mount, populate, done);
          });
        },mount:function (type, opts, mountpoint) {
          var root = mountpoint === '/';
          var pseudo = !mountpoint;
          var node;
    
          if (root && FS.root) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
    
            mountpoint = lookup.path;  // use the absolute path
            node = lookup.node;
    
            if (FS.isMountpoint(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            }
    
            if (!FS.isDir(node.mode)) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
            }
          }
    
          var mount = {
            type: type,
            opts: opts,
            mountpoint: mountpoint,
            mounts: []
          };
    
          // create a root node for the fs
          var mountRoot = type.mount(mount);
          mountRoot.mount = mount;
          mount.root = mountRoot;
    
          if (root) {
            FS.root = mountRoot;
          } else if (node) {
            // set as a mountpoint
            node.mounted = mount;
    
            // add the new mount to the current mount's children
            if (node.mount) {
              node.mount.mounts.push(mount);
            }
          }
    
          return mountRoot;
        },unmount:function (mountpoint) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
    
          if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
    
          // destroy the nodes for this mount, and all its child mounts
          var node = lookup.node;
          var mount = node.mounted;
          var mounts = FS.getMounts(mount);
    
          Object.keys(FS.nameTable).forEach(function (hash) {
            var current = FS.nameTable[hash];
    
            while (current) {
              var next = current.name_next;
    
              if (mounts.indexOf(current.mount) !== -1) {
                FS.destroyNode(current);
              }
    
              current = next;
            }
          });
    
          // no longer a mountpoint
          node.mounted = null;
    
          // remove this mount from the child mounts
          var idx = node.mount.mounts.indexOf(mount);
          assert(idx !== -1);
          node.mount.mounts.splice(idx, 1);
        },lookup:function (parent, name) {
          return parent.node_ops.lookup(parent, name);
        },mknod:function (path, mode, dev) {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          if (!name || name === '.' || name === '..') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var err = FS.mayCreate(parent, name);
          if (err) {
            throw new FS.ErrnoError(err);
          }
          if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          return parent.node_ops.mknod(parent, name, mode, dev);
        },create:function (path, mode) {
          mode = mode !== undefined ? mode : 438 /* 0666 */;
          mode &= 4095;
          mode |= 32768;
          return FS.mknod(path, mode, 0);
        },mkdir:function (path, mode) {
          mode = mode !== undefined ? mode : 511 /* 0777 */;
          mode &= 511 | 512;
          mode |= 16384;
          return FS.mknod(path, mode, 0);
        },mkdev:function (path, mode, dev) {
          if (typeof(dev) === 'undefined') {
            dev = mode;
            mode = 438 /* 0666 */;
          }
          mode |= 8192;
          return FS.mknod(path, mode, dev);
        },symlink:function (oldpath, newpath) {
          if (!PATH.resolve(oldpath)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
          }
          var lookup = FS.lookupPath(newpath, { parent: true });
          var parent = lookup.node;
          if (!parent) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
          }
          var newname = PATH.basename(newpath);
          var err = FS.mayCreate(parent, newname);
          if (err) {
            throw new FS.ErrnoError(err);
          }
          if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          return parent.node_ops.symlink(parent, newname, oldpath);
        },rename:function (old_path, new_path) {
          var old_dirname = PATH.dirname(old_path);
          var new_dirname = PATH.dirname(new_path);
          var old_name = PATH.basename(old_path);
          var new_name = PATH.basename(new_path);
          // parents must exist
          var lookup, old_dir, new_dir;
          try {
            lookup = FS.lookupPath(old_path, { parent: true });
            old_dir = lookup.node;
            lookup = FS.lookupPath(new_path, { parent: true });
            new_dir = lookup.node;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
          if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
          // need to be part of the same mount
          if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
          }
          // source must exist
          var old_node = FS.lookupNode(old_dir, old_name);
          // old path should not be an ancestor of the new path
          var relative = PATH.relative(old_path, new_dirname);
          if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          // new path should not be an ancestor of the old path
          relative = PATH.relative(new_path, old_dirname);
          if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          // see if the new path already exists
          var new_node;
          try {
            new_node = FS.lookupNode(new_dir, new_name);
          } catch (e) {
            // not fatal
          }
          // early out if nothing needs to change
          if (old_node === new_node) {
            return;
          }
          // we'll need to delete the old entry
          var isdir = FS.isDir(old_node.mode);
          var err = FS.mayDelete(old_dir, old_name, isdir);
          if (err) {
            throw new FS.ErrnoError(err);
          }
          // need delete permissions if we'll be overwriting.
          // need create permissions if new doesn't already exist.
          err = new_node ?
            FS.mayDelete(new_dir, new_name, isdir) :
            FS.mayCreate(new_dir, new_name);
          if (err) {
            throw new FS.ErrnoError(err);
          }
          if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
          // if we are going to change the parent, check write permissions
          if (new_dir !== old_dir) {
            err = FS.nodePermissions(old_dir, 'w');
            if (err) {
              throw new FS.ErrnoError(err);
            }
          }
          try {
            if (FS.trackingDelegate['willMovePath']) {
              FS.trackingDelegate['willMovePath'](old_path, new_path);
            }
          } catch(e) {
            console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
          }
          // remove the node from the lookup hash
          FS.hashRemoveNode(old_node);
          // do the underlying fs rename
          try {
            old_dir.node_ops.rename(old_node, new_dir, new_name);
          } catch (e) {
            throw e;
          } finally {
            // add the node back to the hash (in case node_ops.rename
            // changed its name)
            FS.hashAddNode(old_node);
          }
          try {
            if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
          } catch(e) {
            console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
          }
        },rmdir:function (path) {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var err = FS.mayDelete(parent, name, true);
          if (err) {
            throw new FS.ErrnoError(err);
          }
          if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
          try {
            if (FS.trackingDelegate['willDeletePath']) {
              FS.trackingDelegate['willDeletePath'](path);
            }
          } catch(e) {
            console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
          }
          parent.node_ops.rmdir(parent, name);
          FS.destroyNode(node);
          try {
            if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
          } catch(e) {
            console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
          }
        },readdir:function (path) {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
          return node.node_ops.readdir(node);
        },unlink:function (path) {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var err = FS.mayDelete(parent, name, false);
          if (err) {
            // POSIX says unlink should set EPERM, not EISDIR
            if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
            throw new FS.ErrnoError(err);
          }
          if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
          try {
            if (FS.trackingDelegate['willDeletePath']) {
              FS.trackingDelegate['willDeletePath'](path);
            }
          } catch(e) {
            console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
          }
          parent.node_ops.unlink(parent, name);
          FS.destroyNode(node);
          try {
            if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
          } catch(e) {
            console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
          }
        },readlink:function (path) {
          var lookup = FS.lookupPath(path);
          var link = lookup.node;
          if (!link) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
          }
          if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
        },stat:function (path, dontFollow) {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          var node = lookup.node;
          if (!node) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
          }
          if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          return node.node_ops.getattr(node);
        },lstat:function (path) {
          return FS.stat(path, true);
        },chmod:function (path, mode, dontFollow) {
          var node;
          if (typeof path === 'string') {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          node.node_ops.setattr(node, {
            mode: (mode & 4095) | (node.mode & ~4095),
            timestamp: Date.now()
          });
        },lchmod:function (path, mode) {
          FS.chmod(path, mode, true);
        },fchmod:function (fd, mode) {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
          }
          FS.chmod(stream.node, mode);
        },chown:function (path, uid, gid, dontFollow) {
          var node;
          if (typeof path === 'string') {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          node.node_ops.setattr(node, {
            timestamp: Date.now()
            // we ignore the uid / gid for now
          });
        },lchown:function (path, uid, gid) {
          FS.chown(path, uid, gid, true);
        },fchown:function (fd, uid, gid) {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
          }
          FS.chown(stream.node, uid, gid);
        },truncate:function (path, len) {
          if (len < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var node;
          if (typeof path === 'string') {
            var lookup = FS.lookupPath(path, { follow: true });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
          }
          if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
          }
          if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var err = FS.nodePermissions(node, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
          node.node_ops.setattr(node, {
            size: len,
            timestamp: Date.now()
          });
        },ftruncate:function (fd, len) {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          FS.truncate(stream.node, len);
        },utime:function (path, atime, mtime) {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          node.node_ops.setattr(node, {
            timestamp: Math.max(atime, mtime)
          });
        },open:function (path, flags, mode, fd_start, fd_end) {
          if (path === "") {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
          }
          flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
          mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
          if ((flags & 64)) {
            mode = (mode & 4095) | 32768;
          } else {
            mode = 0;
          }
          var node;
          if (typeof path === 'object') {
            node = path;
          } else {
            path = PATH.normalize(path);
            try {
              var lookup = FS.lookupPath(path, {
                follow: !(flags & 131072)
              });
              node = lookup.node;
            } catch (e) {
              // ignore
            }
          }
          // perhaps we need to create the node
          var created = false;
          if ((flags & 64)) {
            if (node) {
              // if O_CREAT and O_EXCL are set, error out if the node already exists
              if ((flags & 128)) {
                throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
              }
            } else {
              // node doesn't exist, try to create it
              node = FS.mknod(path, mode, 0);
              created = true;
            }
          }
          if (!node) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
          }
          // can't truncate a device
          if (FS.isChrdev(node.mode)) {
            flags &= ~512;
          }
          // if asked only for a directory, then this must be one
          if ((flags & 65536) && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
          // check permissions, if this is not a file we just created now (it is ok to
          // create and write to a file with read-only permissions; it is read-only
          // for later use)
          if (!created) {
            var err = FS.mayOpen(node, flags);
            if (err) {
              throw new FS.ErrnoError(err);
            }
          }
          // do truncation if necessary
          if ((flags & 512)) {
            FS.truncate(node, 0);
          }
          // we've already handled these, don't pass down to the underlying vfs
          flags &= ~(128 | 512);
    
          // register the stream with the filesystem
          var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),  // we want the absolute path to the node
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            // used by the file family libc calls (fopen, fwrite, ferror, etc.)
            ungotten: [],
            error: false
          }, fd_start, fd_end);
          // call the new stream's open function
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
          if (Module['logReadFiles'] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
              FS.readFiles[path] = 1;
              Module['printErr']('read file: ' + path);
            }
          }
          try {
            if (FS.trackingDelegate['onOpenFile']) {
              var trackingFlags = 0;
              if ((flags & 2097155) !== 1) {
                trackingFlags |= FS.tracking.openFlags.READ;
              }
              if ((flags & 2097155) !== 0) {
                trackingFlags |= FS.tracking.openFlags.WRITE;
              }
              FS.trackingDelegate['onOpenFile'](path, trackingFlags);
            }
          } catch(e) {
            console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
          }
          return stream;
        },close:function (stream) {
          if (stream.getdents) stream.getdents = null; // free readdir state
          try {
            if (stream.stream_ops.close) {
              stream.stream_ops.close(stream);
            }
          } catch (e) {
            throw e;
          } finally {
            FS.closeStream(stream.fd);
          }
        },llseek:function (stream, offset, whence) {
          if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
          }
          stream.position = stream.stream_ops.llseek(stream, offset, whence);
          stream.ungotten = [];
          return stream.position;
        },read:function (stream, buffer, offset, length, position) {
          if (length < 0 || position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
          }
          if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
          }
          if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var seeking = true;
          if (typeof position === 'undefined') {
            position = stream.position;
            seeking = false;
          } else if (!stream.seekable) {
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
          }
          var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
          if (!seeking) stream.position += bytesRead;
          return bytesRead;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (length < 0 || position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
          }
          if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
          }
          if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          if (stream.flags & 1024) {
            // seek to the end before writing in append mode
            FS.llseek(stream, 0, 2);
          }
          var seeking = true;
          if (typeof position === 'undefined') {
            position = stream.position;
            seeking = false;
          } else if (!stream.seekable) {
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
          }
          var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
          if (!seeking) stream.position += bytesWritten;
          try {
            if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
          } catch(e) {
            console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
          }
          return bytesWritten;
        },allocate:function (stream, offset, length) {
          if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
          }
          if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          stream.stream_ops.allocate(stream, offset, length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          // TODO if PROT is PROT_WRITE, make sure we have write access
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(ERRNO_CODES.EACCES);
          }
          if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
        },msync:function (stream, buffer, offset, length, mmapFlags) {
          if (!stream || !stream.stream_ops.msync) {
            return 0;
          }
          return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
        },munmap:function (stream) {
          return 0;
        },ioctl:function (stream, cmd, arg) {
          if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
          }
          return stream.stream_ops.ioctl(stream, cmd, arg);
        },readFile:function (path, opts) {
          opts = opts || {};
          opts.flags = opts.flags || 'r';
          opts.encoding = opts.encoding || 'binary';
          if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
          }
          var ret;
          var stream = FS.open(path, opts.flags);
          var stat = FS.stat(path);
          var length = stat.size;
          var buf = new Uint8Array(length);
          FS.read(stream, buf, 0, length, 0);
          if (opts.encoding === 'utf8') {
            ret = UTF8ArrayToString(buf, 0);
          } else if (opts.encoding === 'binary') {
            ret = buf;
          }
          FS.close(stream);
          return ret;
        },writeFile:function (path, data, opts) {
          opts = opts || {};
          opts.flags = opts.flags || 'w';
          opts.encoding = opts.encoding || 'utf8';
          if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
          }
          var stream = FS.open(path, opts.flags, opts.mode);
          if (opts.encoding === 'utf8') {
            var buf = new Uint8Array(lengthBytesUTF8(data)+1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, 0, opts.canOwn);
          } else if (opts.encoding === 'binary') {
            FS.write(stream, data, 0, data.length, 0, opts.canOwn);
          }
          FS.close(stream);
        },cwd:function () {
          return FS.currentPath;
        },chdir:function (path) {
          var lookup = FS.lookupPath(path, { follow: true });
          if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
          var err = FS.nodePermissions(lookup.node, 'x');
          if (err) {
            throw new FS.ErrnoError(err);
          }
          FS.currentPath = lookup.path;
        },createDefaultDirectories:function () {
          FS.mkdir('/tmp');
          FS.mkdir('/home');
          FS.mkdir('/home/web_user');
        },createDefaultDevices:function () {
          // create /dev
          FS.mkdir('/dev');
          // setup /dev/null
          FS.registerDevice(FS.makedev(1, 3), {
            read: function() { return 0; },
            write: function(stream, buffer, offset, length, pos) { return length; }
          });
          FS.mkdev('/dev/null', FS.makedev(1, 3));
          // setup /dev/tty and /dev/tty1
          // stderr needs to print output using Module['printErr']
          // so we register a second tty just for it.
          TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
          TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
          FS.mkdev('/dev/tty', FS.makedev(5, 0));
          FS.mkdev('/dev/tty1', FS.makedev(6, 0));
          // setup /dev/[u]random
          var random_device;
          if (typeof crypto !== 'undefined') {
            // for modern web browsers
            var randomBuffer = new Uint8Array(1);
            random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
          } else if (ENVIRONMENT_IS_NODE) {
            // for nodejs
            random_device = function() { return require('crypto').randomBytes(1)[0]; };
          } else {
            // default for ES5 platforms
            random_device = function() { return (Math.random()*256)|0; };
          }
          FS.createDevice('/dev', 'random', random_device);
          FS.createDevice('/dev', 'urandom', random_device);
          // we're not going to emulate the actual shm device,
          // just create the tmp dirs that reside in it commonly
          FS.mkdir('/dev/shm');
          FS.mkdir('/dev/shm/tmp');
        },createSpecialDirectories:function () {
          // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the name of the stream for fd 6 (see test_unistd_ttyname)
          FS.mkdir('/proc');
          FS.mkdir('/proc/self');
          FS.mkdir('/proc/self/fd');
          FS.mount({
            mount: function() {
              var node = FS.createNode('/proc/self', 'fd', 16384 | 0777, 73);
              node.node_ops = {
                lookup: function(parent, name) {
                  var fd = +name;
                  var stream = FS.getStream(fd);
                  if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                  var ret = {
                    parent: null,
                    mount: { mountpoint: 'fake' },
                    node_ops: { readlink: function() { return stream.path } }
                  };
                  ret.parent = ret; // make it look like a simple root node
                  return ret;
                }
              };
              return node;
            }
          }, {}, '/proc/self/fd');
        },createStandardStreams:function () {
          // TODO deprecate the old functionality of a single
          // input / output callback and that utilizes FS.createDevice
          // and instead require a unique set of stream ops
    
          // by default, we symlink the standard streams to the
          // default tty devices. however, if the standard streams
          // have been overwritten we create a unique device for
          // them instead.
          if (Module['stdin']) {
            FS.createDevice('/dev', 'stdin', Module['stdin']);
          } else {
            FS.symlink('/dev/tty', '/dev/stdin');
          }
          if (Module['stdout']) {
            FS.createDevice('/dev', 'stdout', null, Module['stdout']);
          } else {
            FS.symlink('/dev/tty', '/dev/stdout');
          }
          if (Module['stderr']) {
            FS.createDevice('/dev', 'stderr', null, Module['stderr']);
          } else {
            FS.symlink('/dev/tty1', '/dev/stderr');
          }
    
          // open default streams for the stdin, stdout and stderr devices
          var stdin = FS.open('/dev/stdin', 'r');
          assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
    
          var stdout = FS.open('/dev/stdout', 'w');
          assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
    
          var stderr = FS.open('/dev/stderr', 'w');
          assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
        },ensureErrnoError:function () {
          if (FS.ErrnoError) return;
          FS.ErrnoError = function ErrnoError(errno, node) {
            //Module.printErr(stackTrace()); // useful for debugging
            this.node = node;
            this.setErrno = function(errno) {
              this.errno = errno;
              for (var key in ERRNO_CODES) {
                if (ERRNO_CODES[key] === errno) {
                  this.code = key;
                  break;
                }
              }
            };
            this.setErrno(errno);
            this.message = ERRNO_MESSAGES[errno];
            if (this.stack) this.stack = demangleAll(this.stack);
          };
          FS.ErrnoError.prototype = new Error();
          FS.ErrnoError.prototype.constructor = FS.ErrnoError;
          // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
          [ERRNO_CODES.ENOENT].forEach(function(code) {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = '<generic error, no stack>';
          });
        },staticInit:function () {
          FS.ensureErrnoError();
    
          FS.nameTable = new Array(4096);
    
          FS.mount(MEMFS, {}, '/');
    
          FS.createDefaultDirectories();
          FS.createDefaultDevices();
          FS.createSpecialDirectories();
    
          FS.filesystems = {
            'MEMFS': MEMFS,
            'IDBFS': IDBFS,
            'NODEFS': NODEFS,
            'WORKERFS': WORKERFS,
          };
        },init:function (input, output, error) {
          assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
          FS.init.initialized = true;
    
          FS.ensureErrnoError();
    
          // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
          Module['stdin'] = input || Module['stdin'];
          Module['stdout'] = output || Module['stdout'];
          Module['stderr'] = error || Module['stderr'];
    
          FS.createStandardStreams();
        },quit:function () {
          FS.init.initialized = false;
          // force-flush all streams, so we get musl std streams printed out
          var fflush = Module['_fflush'];
          if (fflush) fflush(0);
          // close all of our streams
          for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
              continue;
            }
            FS.close(stream);
          }
        },getMode:function (canRead, canWrite) {
          var mode = 0;
          if (canRead) mode |= 292 | 73;
          if (canWrite) mode |= 146;
          return mode;
        },joinPath:function (parts, forceRelative) {
          var path = PATH.join.apply(null, parts);
          if (forceRelative && path[0] == '/') path = path.substr(1);
          return path;
        },absolutePath:function (relative, base) {
          return PATH.resolve(base, relative);
        },standardizePath:function (path) {
          return PATH.normalize(path);
        },findObject:function (path, dontResolveLastLink) {
          var ret = FS.analyzePath(path, dontResolveLastLink);
          if (ret.exists) {
            return ret.object;
          } else {
            ___setErrNo(ret.error);
            return null;
          }
        },analyzePath:function (path, dontResolveLastLink) {
          // operate from within the context of the symlink's target
          try {
            var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            path = lookup.path;
          } catch (e) {
          }
          var ret = {
            isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
            parentExists: false, parentPath: null, parentObject: null
          };
          try {
            var lookup = FS.lookupPath(path, { parent: true });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === '/';
          } catch (e) {
            ret.error = e.errno;
          };
          return ret;
        },createFolder:function (parent, name, canRead, canWrite) {
          var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(canRead, canWrite);
          return FS.mkdir(path, mode);
        },createPath:function (parent, path, canRead, canWrite) {
          parent = typeof parent === 'string' ? parent : FS.getPath(parent);
          var parts = path.split('/').reverse();
          while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
              FS.mkdir(current);
            } catch (e) {
              // ignore EEXIST
            }
            parent = current;
          }
          return current;
        },createFile:function (parent, name, properties, canRead, canWrite) {
          var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(canRead, canWrite);
          return FS.create(path, mode);
        },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
          var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
          var mode = FS.getMode(canRead, canWrite);
          var node = FS.create(path, mode);
          if (data) {
            if (typeof data === 'string') {
              var arr = new Array(data.length);
              for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
              data = arr;
            }
            // make sure we can write to the file
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, 'w');
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode);
          }
          return node;
        },createDevice:function (parent, name, input, output) {
          var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(!!input, !!output);
          if (!FS.createDevice.major) FS.createDevice.major = 64;
          var dev = FS.makedev(FS.createDevice.major++, 0);
          // Create a fake device that a set of stream ops to emulate
          // the old behavior.
          FS.registerDevice(dev, {
            open: function(stream) {
              stream.seekable = false;
            },
            close: function(stream) {
              // flush any pending line data
              if (output && output.buffer && output.buffer.length) {
                output(10);
              }
            },
            read: function(stream, buffer, offset, length, pos /* ignored */) {
              var bytesRead = 0;
              for (var i = 0; i < length; i++) {
                var result;
                try {
                  result = input();
                } catch (e) {
                  throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
                if (result === undefined && bytesRead === 0) {
                  throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset+i] = result;
              }
              if (bytesRead) {
                stream.node.timestamp = Date.now();
              }
              return bytesRead;
            },
            write: function(stream, buffer, offset, length, pos) {
              for (var i = 0; i < length; i++) {
                try {
                  output(buffer[offset+i]);
                } catch (e) {
                  throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
              }
              if (length) {
                stream.node.timestamp = Date.now();
              }
              return i;
            }
          });
          return FS.mkdev(path, mode, dev);
        },createLink:function (parent, name, target, canRead, canWrite) {
          var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
          return FS.symlink(target, path);
        },forceLoadFile:function (obj) {
          if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
          var success = true;
          if (typeof XMLHttpRequest !== 'undefined') {
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
          } else if (Module['read']) {
            // Command-line.
            try {
              // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
              //          read() will try to parse UTF8.
              obj.contents = intArrayFromString(Module['read'](obj.url), true);
              obj.usedBytes = obj.contents.length;
            } catch (e) {
              success = false;
            }
          } else {
            throw new Error('Cannot load without read() or XMLHttpRequest.');
          }
          if (!success) ___setErrNo(ERRNO_CODES.EIO);
          return success;
        },createLazyFile:function (parent, name, url, canRead, canWrite) {
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize)|0;
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
    
            var chunkSize = 1024*1024; // Chunk size in bytes
    
            if (!hasByteServing) chunkSize = datalength;
    
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
    
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
    
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
    
            if (usesGzip || !datalength) {
              // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
              chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
              datalength = this.getter(0).length;
              chunkSize = datalength;
              console.log("LazyFiles on gzip forces download of the whole file when length is accessed");
            }
    
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          }
          if (typeof XMLHttpRequest !== 'undefined') {
            if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
            var lazyArray = new LazyUint8Array();
            Object.defineProperties(lazyArray, {
              length: {
                get: function() {
                  if(!this.lengthKnown) {
                    this.cacheLength();
                  }
                  return this._length;
                }
              },
              chunkSize: {
                get: function() {
                  if(!this.lengthKnown) {
                    this.cacheLength();
                  }
                  return this._chunkSize;
                }
              }
            });
    
            var properties = { isDevice: false, contents: lazyArray };
          } else {
            var properties = { isDevice: false, url: url };
          }
    
          var node = FS.createFile(parent, name, properties, canRead, canWrite);
          // This is a total hack, but I want to get this lazy file code out of the
          // core of MEMFS. If we want to keep this lazy file concept I feel it should
          // be its own thin LAZYFS proxying calls to MEMFS.
          if (properties.contents) {
            node.contents = properties.contents;
          } else if (properties.url) {
            node.contents = null;
            node.url = properties.url;
          }
          // Add a function that defers querying the file size until it is asked the first time.
          Object.defineProperties(node, {
            usedBytes: {
              get: function() { return this.contents.length; }
            }
          });
          // override each stream op with one that tries to force load the lazy file first
          var stream_ops = {};
          var keys = Object.keys(node.stream_ops);
          keys.forEach(function(key) {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
              if (!FS.forceLoadFile(node)) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              return fn.apply(null, arguments);
            };
          });
          // use a custom read function
          stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            var contents = stream.node.contents;
            if (position >= contents.length)
              return 0;
            var size = Math.min(contents.length - position, length);
            assert(size >= 0);
            if (contents.slice) { // normal array
              for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents[position + i];
              }
            } else {
              for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
                buffer[offset + i] = contents.get(position + i);
              }
            }
            return size;
          };
          node.stream_ops = stream_ops;
          return node;
        },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
          Browser.init(); // XXX perhaps this method should move onto Browser?
          // TODO we should allow people to just pass in a complete filename instead
          // of parent and name being that we just join them anyways
          var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
          var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
          function processData(byteArray) {
            function finish(byteArray) {
              if (preFinish) preFinish();
              if (!dontCreateFile) {
                FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
              }
              if (onload) onload();
              removeRunDependency(dep);
            }
            var handled = false;
            Module['preloadPlugins'].forEach(function(plugin) {
              if (handled) return;
              if (plugin['canHandle'](fullname)) {
                plugin['handle'](byteArray, fullname, finish, function() {
                  if (onerror) onerror();
                  removeRunDependency(dep);
                });
                handled = true;
              }
            });
            if (!handled) finish(byteArray);
          }
          addRunDependency(dep);
          if (typeof url == 'string') {
            Browser.asyncLoad(url, function(byteArray) {
              processData(byteArray);
            }, onerror);
          } else {
            processData(url);
          }
        },indexedDB:function () {
          return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        },DB_NAME:function () {
          return 'EM_FS_' + window.location.pathname;
        },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
          onload = onload || function(){};
          onerror = onerror || function(){};
          var indexedDB = FS.indexedDB();
          try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
          } catch (e) {
            return onerror(e);
          }
          openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
            console.log('creating db');
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME);
          };
          openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0, fail = 0, total = paths.length;
            function finish() {
              if (fail == 0) onload(); else onerror();
            }
            paths.forEach(function(path) {
              var putRequest = files.put(FS.analyzePath(path).object.contents, path);
              putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
              putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
            });
            transaction.onerror = onerror;
          };
          openRequest.onerror = onerror;
        },loadFilesFromDB:function (paths, onload, onerror) {
          onload = onload || function(){};
          onerror = onerror || function(){};
          var indexedDB = FS.indexedDB();
          try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
          } catch (e) {
            return onerror(e);
          }
          openRequest.onupgradeneeded = onerror; // no database to load from
          openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            try {
              var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
            } catch(e) {
              onerror(e);
              return;
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0, fail = 0, total = paths.length;
            function finish() {
              if (fail == 0) onload(); else onerror();
            }
            paths.forEach(function(path) {
              var getRequest = files.get(path);
              getRequest.onsuccess = function getRequest_onsuccess() {
                if (FS.analyzePath(path).exists) {
                  FS.unlink(path);
                }
                FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                ok++;
                if (ok + fail == total) finish();
              };
              getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
            });
            transaction.onerror = onerror;
          };
          openRequest.onerror = onerror;
        }};var SYSCALLS={DEFAULT_POLLMASK:5,mappings:{},umask:511,calculateAt:function (dirfd, path) {
          if (path[0] !== '/') {
            // relative path
            var dir;
            if (dirfd === -100) {
              dir = FS.cwd();
            } else {
              var dirstream = FS.getStream(dirfd);
              if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
              dir = dirstream.path;
            }
            path = PATH.join2(dir, path);
          }
          return path;
        },doStat:function (func, path, buf) {
          try {
            var stat = func(path);
          } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
              // an error occurred while trying to look up the path; we should just report ENOTDIR
              return -ERRNO_CODES.ENOTDIR;
            }
            throw e;
          }
          HEAP32[((buf)>>2)]=stat.dev;
          HEAP32[(((buf)+(4))>>2)]=0;
          HEAP32[(((buf)+(8))>>2)]=stat.ino;
          HEAP32[(((buf)+(12))>>2)]=stat.mode;
          HEAP32[(((buf)+(16))>>2)]=stat.nlink;
          HEAP32[(((buf)+(20))>>2)]=stat.uid;
          HEAP32[(((buf)+(24))>>2)]=stat.gid;
          HEAP32[(((buf)+(28))>>2)]=stat.rdev;
          HEAP32[(((buf)+(32))>>2)]=0;
          HEAP32[(((buf)+(36))>>2)]=stat.size;
          HEAP32[(((buf)+(40))>>2)]=4096;
          HEAP32[(((buf)+(44))>>2)]=stat.blocks;
          HEAP32[(((buf)+(48))>>2)]=(stat.atime.getTime() / 1000)|0;
          HEAP32[(((buf)+(52))>>2)]=0;
          HEAP32[(((buf)+(56))>>2)]=(stat.mtime.getTime() / 1000)|0;
          HEAP32[(((buf)+(60))>>2)]=0;
          HEAP32[(((buf)+(64))>>2)]=(stat.ctime.getTime() / 1000)|0;
          HEAP32[(((buf)+(68))>>2)]=0;
          HEAP32[(((buf)+(72))>>2)]=stat.ino;
          return 0;
        },doMsync:function (addr, stream, len, flags) {
          var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
          FS.msync(stream, buffer, 0, len, flags);
        },doMkdir:function (path, mode) {
          // remove a trailing slash, if one - /a/b/ has basename of '', but
          // we want to create b in the context of this function
          path = PATH.normalize(path);
          if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
          FS.mkdir(path, mode, 0);
          return 0;
        },doMknod:function (path, mode, dev) {
          // we don't want this in the JS API as it uses mknod to create all nodes.
          switch (mode & 61440) {
            case 32768:
            case 8192:
            case 24576:
            case 4096:
            case 49152:
              break;
            default: return -ERRNO_CODES.EINVAL;
          }
          FS.mknod(path, mode, dev);
          return 0;
        },doReadlink:function (path, buf, bufsize) {
          if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
          var ret = FS.readlink(path);
          ret = ret.slice(0, Math.max(0, bufsize));
          writeStringToMemory(ret, buf, true);
          return ret.length;
        },doAccess:function (path, amode) {
          if (amode & ~7) {
            // need a valid mode
            return -ERRNO_CODES.EINVAL;
          }
          var node;
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
          var perms = '';
          if (amode & 4) perms += 'r';
          if (amode & 2) perms += 'w';
          if (amode & 1) perms += 'x';
          if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
            return -ERRNO_CODES.EACCES;
          }
          return 0;
        },doDup:function (path, flags, suggestFD) {
          var suggest = FS.getStream(suggestFD);
          if (suggest) FS.close(suggest);
          return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
        },doReadv:function (stream, iov, iovcnt, offset) {
          var ret = 0;
          for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[(((iov)+(i*8))>>2)];
            var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
            var curr = FS.read(stream, HEAP8,ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr;
            if (curr < len) break; // nothing more to read
          }
          return ret;
        },doWritev:function (stream, iov, iovcnt, offset) {
          var ret = 0;
          for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[(((iov)+(i*8))>>2)];
            var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
            var curr = FS.write(stream, HEAP8,ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr;
          }
          return ret;
        },varargs:0,get:function (varargs) {
          SYSCALLS.varargs += 4;
          var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
          return ret;
        },getStr:function () {
          var ret = Pointer_stringify(SYSCALLS.get());
          return ret;
        },getStreamFromFD:function () {
          var stream = FS.getStream(SYSCALLS.get());
          if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
          return stream;
        },getSocketFromFD:function () {
          var socket = SOCKFS.getSocket(SYSCALLS.get());
          if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
          return socket;
        },getSocketAddress:function (allowNull) {
          var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
          if (allowNull && addrp === 0) return null;
          var info = __read_sockaddr(addrp, addrlen);
          if (info.errno) throw new FS.ErrnoError(info.errno);
          info.addr = DNS.lookup_addr(info.addr) || info.addr;
          return info;
        },get64:function () {
          var low = SYSCALLS.get(), high = SYSCALLS.get();
          if (low >= 0) assert(high === 0);
          else assert(high === -1);
          return low;
        },getZero:function () {
          assert(SYSCALLS.get() === 0);
        }};function ___syscall54(which, varargs) {SYSCALLS.varargs = varargs;
    try {
     // ioctl
        var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
        switch (op) {
          case 21505: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            return 0;
          }
          case 21506: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            return 0; // no-op, not actually adjusting terminal settings
          }
          case 21519: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            var argp = SYSCALLS.get();
            HEAP32[((argp)>>2)]=0;
            return 0;
          }
          case 21520: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            return -ERRNO_CODES.EINVAL; // not supported
          }
          case 21531: {
            var argp = SYSCALLS.get();
            return FS.ioctl(stream, op, argp);
          }
          default: abort('bad ioctl syscall ' + op);
        }
      } catch (e) {
      if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
      return -e.errno;
    }
    }
  
     
    Module["_bitshift64Ashr"] = _bitshift64Ashr;
  
     
    Module["_bitshift64Lshr"] = _bitshift64Lshr;
  
    function ___cxa_get_exception_ptr(ptr) {
        // TODO: use info.adjusted?
        return ptr;
      }
  
    function _pthread_cleanup_push(routine, arg) {
        __ATEXIT__.push(function() { Runtime.dynCall('vi', routine, [arg]) })
        _pthread_cleanup_push.level = __ATEXIT__.length;
      }
  
    function ___cxa_find_matching_catch_4() {
            return ___cxa_find_matching_catch.apply(null, arguments);
          }
  
    function ___cxa_find_matching_catch_2() {
            return ___cxa_find_matching_catch.apply(null, arguments);
          }
  
    function ___cxa_find_matching_catch_3() {
            return ___cxa_find_matching_catch.apply(null, arguments);
          }
  
    function ___cxa_begin_catch(ptr) {
        __ZSt18uncaught_exceptionv.uncaught_exception--;
        EXCEPTIONS.caught.push(ptr);
        EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
        return ptr;
      }
  
    function _llvm_eh_typeid_for(type) {
        return type;
      }
  
    function ___syscall5(which, varargs) {SYSCALLS.varargs = varargs;
    try {
     // open
        var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get() // optional TODO
        var stream = FS.open(pathname, flags, mode);
        return stream.fd;
      } catch (e) {
      if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
      return -e.errno;
    }
    }
  
    
    function _emscripten_memcpy_big(dest, src, num) {
        HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
        return dest;
      } 
    Module["_memcpy"] = _memcpy;
  
    function ___syscall6(which, varargs) {SYSCALLS.varargs = varargs;
    try {
     // close
        var stream = SYSCALLS.getStreamFromFD();
        FS.close(stream);
        return 0;
      } catch (e) {
      if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
      return -e.errno;
    }
    }
  
    function _sbrk(bytes) {
        // Implement a Linux-like 'memory area' for our 'process'.
        // Changes the size of the memory area by |bytes|; returns the
        // address of the previous top ('break') of the memory area
        // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
        var self = _sbrk;
        if (!self.called) {
          DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
          self.called = true;
          assert(Runtime.dynamicAlloc);
          self.alloc = Runtime.dynamicAlloc;
          Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
        }
        var ret = DYNAMICTOP;
        if (bytes != 0) {
          var success = self.alloc(bytes);
          if (!success) return -1 >>> 0; // sbrk failure code
        }
        return ret;  // Previous break location.
      }
  
     
    Module["_memmove"] = _memmove;
  
    function _pthread_cleanup_pop() {
        assert(_pthread_cleanup_push.level == __ATEXIT__.length, 'cannot pop if something else added meanwhile!');
        __ATEXIT__.pop();
        _pthread_cleanup_push.level = __ATEXIT__.length;
      }
  
    function _time(ptr) {
        var ret = (Date.now()/1000)|0;
        if (ptr) {
          HEAP32[((ptr)>>2)]=ret;
        }
        return ret;
      }
  
    function _pthread_self() {
        //FIXME: assumes only a single thread
        return 0;
      }
  
    function ___syscall140(which, varargs) {SYSCALLS.varargs = varargs;
    try {
     // llseek
        var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
        var offset = offset_low;
        assert(offset_high === 0);
        FS.llseek(stream, offset, whence);
        HEAP32[((result)>>2)]=stream.position;
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
        return 0;
      } catch (e) {
      if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
      return -e.errno;
    }
    }
  
  
    function ___syscall146(which, varargs) {SYSCALLS.varargs = varargs;
    try {
     // writev
        var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
        return SYSCALLS.doWritev(stream, iov, iovcnt);
      } catch (e) {
      if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
      return -e.errno;
    }
    }
  
    function ___syscall221(which, varargs) {SYSCALLS.varargs = varargs;
    try {
     // fcntl64
        var stream = SYSCALLS.getStreamFromFD(), cmd = SYSCALLS.get();
        switch (cmd) {
          case 0: {
            var arg = SYSCALLS.get();
            if (arg < 0) {
              return -ERRNO_CODES.EINVAL;
            }
            var newStream;
            newStream = FS.open(stream.path, stream.flags, 0, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;  // FD_CLOEXEC makes no sense for a single process.
          case 3:
            return stream.flags;
          case 4: {
            var arg = SYSCALLS.get();
            stream.flags |= arg;
            return 0;
          }
          case 12:
          case 12: {
            var arg = SYSCALLS.get();
            var offset = 0;
            // We're always unlocked.
            HEAP16[(((arg)+(offset))>>1)]=2;
            return 0;
          }
          case 13:
          case 14:
          case 13:
          case 14:
            return 0; // Pretend that the locking is successful.
          case 16:
          case 8:
            return -ERRNO_CODES.EINVAL; // These are for sockets. We don't have them fully implemented yet.
          case 9:
            // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fnctl() returns that, and we set errno ourselves.
            ___setErrNo(ERRNO_CODES.EINVAL);
            return -1;
          default: {
            return -ERRNO_CODES.EINVAL;
          }
        }
      } catch (e) {
      if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
      return -e.errno;
    }
    }
  
    function ___syscall145(which, varargs) {SYSCALLS.varargs = varargs;
    try {
     // readv
        var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
        return SYSCALLS.doReadv(stream, iov, iovcnt);
      } catch (e) {
      if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
      return -e.errno;
    }
    }
  FS.staticInit();__ATINIT__.unshift(function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() });__ATMAIN__.push(function() { FS.ignorePermissions = false });__ATEXIT__.push(function() { FS.quit() });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;Module["FS_unlink"] = FS.unlink;;
  __ATINIT__.unshift(function() { TTY.init() });__ATEXIT__.push(function() { TTY.shutdown() });;
  if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); var NODEJS_PATH = require("path"); NODEFS.staticInit(); };
  STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
  
  staticSealed = true; // seal the static portion of memory
  
  STACK_MAX = STACK_BASE + TOTAL_STACK;
  
  DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
  
  assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
  
   var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
  
  
  function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_viiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_i(x) { Module["printErr"]("Invalid function pointer called with signature 'i'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_vi(x) { Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_vii(x) { Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_ii(x) { Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_viii(x) { Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_v(x) { Module["printErr"]("Invalid function pointer called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_iiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_viiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_iiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function nullFunc_viiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }
  
  function invoke_iiii(index,a1,a2,a3) {
    try {
      return Module["dynCall_iiii"](index,a1,a2,a3);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_viiiii(index,a1,a2,a3,a4,a5) {
    try {
      Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_i(index) {
    try {
      return Module["dynCall_i"](index);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_vi(index,a1) {
    try {
      Module["dynCall_vi"](index,a1);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_vii(index,a1,a2) {
    try {
      Module["dynCall_vii"](index,a1,a2);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_ii(index,a1) {
    try {
      return Module["dynCall_ii"](index,a1);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_viii(index,a1,a2,a3) {
    try {
      Module["dynCall_viii"](index,a1,a2,a3);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_v(index) {
    try {
      Module["dynCall_v"](index);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_iiiii(index,a1,a2,a3,a4) {
    try {
      return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
    try {
      Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_iii(index,a1,a2) {
    try {
      return Module["dynCall_iii"](index,a1,a2);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
    try {
      return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  function invoke_viiii(index,a1,a2,a3,a4) {
    try {
      Module["dynCall_viiii"](index,a1,a2,a3,a4);
    } catch(e) {
      if (typeof e !== 'number' && e !== 'longjmp') throw e;
      asm["setThrew"](1, 0);
    }
  }
  
  Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity };
  
  Module.asmLibraryArg = { "abort": abort, "assert": assert, "nullFunc_iiii": nullFunc_iiii, "nullFunc_viiiii": nullFunc_viiiii, "nullFunc_i": nullFunc_i, "nullFunc_vi": nullFunc_vi, "nullFunc_vii": nullFunc_vii, "nullFunc_ii": nullFunc_ii, "nullFunc_viii": nullFunc_viii, "nullFunc_v": nullFunc_v, "nullFunc_iiiii": nullFunc_iiiii, "nullFunc_viiiiii": nullFunc_viiiiii, "nullFunc_iii": nullFunc_iii, "nullFunc_iiiiii": nullFunc_iiiiii, "nullFunc_viiii": nullFunc_viiii, "invoke_iiii": invoke_iiii, "invoke_viiiii": invoke_viiiii, "invoke_i": invoke_i, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiii": invoke_iiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_pthread_cleanup_pop": _pthread_cleanup_pop, "___syscall221": ___syscall221, "_pthread_key_create": _pthread_key_create, "_abort": _abort, "_pthread_cleanup_push": _pthread_cleanup_push, "___gxx_personality_v0": ___gxx_personality_v0, "___cxa_find_matching_catch_4": ___cxa_find_matching_catch_4, "___cxa_free_exception": ___cxa_free_exception, "___cxa_find_matching_catch_2": ___cxa_find_matching_catch_2, "___cxa_find_matching_catch_3": ___cxa_find_matching_catch_3, "___setErrNo": ___setErrNo, "_llvm_eh_typeid_for": _llvm_eh_typeid_for, "_sbrk": _sbrk, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "___cxa_end_catch": ___cxa_end_catch, "___resumeException": ___resumeException, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "__exit": __exit, "_pthread_getspecific": _pthread_getspecific, "_pthread_self": _pthread_self, "___cxa_get_exception_ptr": ___cxa_get_exception_ptr, "_pthread_once": _pthread_once, "___syscall54": ___syscall54, "___unlock": ___unlock, "_pthread_setspecific": _pthread_setspecific, "___cxa_throw": ___cxa_throw, "_sysconf": _sysconf, "___lock": ___lock, "___syscall6": ___syscall6, "___syscall5": ___syscall5, "_time": _time, "___cxa_allocate_exception": ___cxa_allocate_exception, "___syscall140": ___syscall140, "_exit": _exit, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "___syscall145": ___syscall145, "___syscall146": ___syscall146, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8 };
  // EMSCRIPTEN_START_ASM
  var asm = (function(global, env, buffer) {
    'almost asm';
    
    
    var HEAP8 = new global.Int8Array(buffer);
    var HEAP16 = new global.Int16Array(buffer);
    var HEAP32 = new global.Int32Array(buffer);
    var HEAPU8 = new global.Uint8Array(buffer);
    var HEAPU16 = new global.Uint16Array(buffer);
    var HEAPU32 = new global.Uint32Array(buffer);
    var HEAPF32 = new global.Float32Array(buffer);
    var HEAPF64 = new global.Float64Array(buffer);
  
  
    var STACKTOP=env.STACKTOP|0;
    var STACK_MAX=env.STACK_MAX|0;
    var tempDoublePtr=env.tempDoublePtr|0;
    var ABORT=env.ABORT|0;
    var cttz_i8=env.cttz_i8|0;
  
    var __THREW__ = 0;
    var threwValue = 0;
    var setjmpId = 0;
    var undef = 0;
    var nan = global.NaN, inf = global.Infinity;
    var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  
    var tempRet0 = 0;
    var tempRet1 = 0;
    var tempRet2 = 0;
    var tempRet3 = 0;
    var tempRet4 = 0;
    var tempRet5 = 0;
    var tempRet6 = 0;
    var tempRet7 = 0;
    var tempRet8 = 0;
    var tempRet9 = 0;
    var Math_floor=global.Math.floor;
    var Math_abs=global.Math.abs;
    var Math_sqrt=global.Math.sqrt;
    var Math_pow=global.Math.pow;
    var Math_cos=global.Math.cos;
    var Math_sin=global.Math.sin;
    var Math_tan=global.Math.tan;
    var Math_acos=global.Math.acos;
    var Math_asin=global.Math.asin;
    var Math_atan=global.Math.atan;
    var Math_atan2=global.Math.atan2;
    var Math_exp=global.Math.exp;
    var Math_log=global.Math.log;
    var Math_ceil=global.Math.ceil;
    var Math_imul=global.Math.imul;
    var Math_min=global.Math.min;
    var Math_clz32=global.Math.clz32;
    var abort=env.abort;
    var assert=env.assert;
    var nullFunc_iiii=env.nullFunc_iiii;
    var nullFunc_viiiii=env.nullFunc_viiiii;
    var nullFunc_i=env.nullFunc_i;
    var nullFunc_vi=env.nullFunc_vi;
    var nullFunc_vii=env.nullFunc_vii;
    var nullFunc_ii=env.nullFunc_ii;
    var nullFunc_viii=env.nullFunc_viii;
    var nullFunc_v=env.nullFunc_v;
    var nullFunc_iiiii=env.nullFunc_iiiii;
    var nullFunc_viiiiii=env.nullFunc_viiiiii;
    var nullFunc_iii=env.nullFunc_iii;
    var nullFunc_iiiiii=env.nullFunc_iiiiii;
    var nullFunc_viiii=env.nullFunc_viiii;
    var invoke_iiii=env.invoke_iiii;
    var invoke_viiiii=env.invoke_viiiii;
    var invoke_i=env.invoke_i;
    var invoke_vi=env.invoke_vi;
    var invoke_vii=env.invoke_vii;
    var invoke_ii=env.invoke_ii;
    var invoke_viii=env.invoke_viii;
    var invoke_v=env.invoke_v;
    var invoke_iiiii=env.invoke_iiiii;
    var invoke_viiiiii=env.invoke_viiiiii;
    var invoke_iii=env.invoke_iii;
    var invoke_iiiiii=env.invoke_iiiiii;
    var invoke_viiii=env.invoke_viiii;
    var _pthread_cleanup_pop=env._pthread_cleanup_pop;
    var ___syscall221=env.___syscall221;
    var _pthread_key_create=env._pthread_key_create;
    var _abort=env._abort;
    var _pthread_cleanup_push=env._pthread_cleanup_push;
    var ___gxx_personality_v0=env.___gxx_personality_v0;
    var ___cxa_find_matching_catch_4=env.___cxa_find_matching_catch_4;
    var ___cxa_free_exception=env.___cxa_free_exception;
    var ___cxa_find_matching_catch_2=env.___cxa_find_matching_catch_2;
    var ___cxa_find_matching_catch_3=env.___cxa_find_matching_catch_3;
    var ___setErrNo=env.___setErrNo;
    var _llvm_eh_typeid_for=env._llvm_eh_typeid_for;
    var _sbrk=env._sbrk;
    var ___cxa_begin_catch=env.___cxa_begin_catch;
    var _emscripten_memcpy_big=env._emscripten_memcpy_big;
    var ___cxa_end_catch=env.___cxa_end_catch;
    var ___resumeException=env.___resumeException;
    var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
    var __exit=env.__exit;
    var _pthread_getspecific=env._pthread_getspecific;
    var _pthread_self=env._pthread_self;
    var ___cxa_get_exception_ptr=env.___cxa_get_exception_ptr;
    var _pthread_once=env._pthread_once;
    var ___syscall54=env.___syscall54;
    var ___unlock=env.___unlock;
    var _pthread_setspecific=env._pthread_setspecific;
    var ___cxa_throw=env.___cxa_throw;
    var _sysconf=env._sysconf;
    var ___lock=env.___lock;
    var ___syscall6=env.___syscall6;
    var ___syscall5=env.___syscall5;
    var _time=env._time;
    var ___cxa_allocate_exception=env.___cxa_allocate_exception;
    var ___syscall140=env.___syscall140;
    var _exit=env._exit;
    var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
    var ___syscall145=env.___syscall145;
    var ___syscall146=env.___syscall146;
    var tempFloat = 0.0;
  
  // EMSCRIPTEN_START_FUNCS
  
  function stackAlloc(size) {
    size = size|0;
    var ret = 0;
    ret = STACKTOP;
    STACKTOP = (STACKTOP + size)|0;
    STACKTOP = (STACKTOP + 15)&-16;
  if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
  
    return ret|0;
  }
  function stackSave() {
    return STACKTOP|0;
  }
  function stackRestore(top) {
    top = top|0;
    STACKTOP = top;
  }
  function establishStackSpace(stackBase, stackMax) {
    stackBase = stackBase|0;
    stackMax = stackMax|0;
    STACKTOP = stackBase;
    STACK_MAX = stackMax;
  }
  
  function setThrew(threw, value) {
    threw = threw|0;
    value = value|0;
    if ((__THREW__|0) == 0) {
      __THREW__ = threw;
      threwValue = value;
    }
  }
  function copyTempFloat(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  }
  function copyTempDouble(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
    HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
    HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
    HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
    HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
  }
  
  function setTempRet0(value) {
    value = value|0;
    tempRet0 = value;
  }
  function getTempRet0() {
    return tempRet0|0;
  }
  
  function _OCRAD_version() {
   var label = 0, sp = 0;
   sp = STACKTOP;
   return (867|0);
  }
  function _OCRAD_open() {
   var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   HEAP32[1700] = -1;
   $0 = (__ZnwjRKSt9nothrow_t(56,9440)|0);
   $1 = ($0|0)==(0|0);
   if ($1) {
    $8 = 0;
    return ($8|0);
   }
   $2 = ((($0)) + 28|0);
   ;HEAP32[$0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;HEAP32[$0+16>>2]=0|0;HEAP32[$0+20>>2]=0|0;HEAP32[$0+24>>2]=0|0;
   $3 = ((($0)) + 32|0);
   HEAP32[$3>>2] = 0;
   $4 = ((($0)) + 36|0);
   HEAP32[$4>>2] = 0;
   $5 = ((($0)) + 40|0);
   HEAP8[$5>>0] = 52;
   $6 = ((($0)) + 41|0);
   HEAP8[$6>>0] = 0;
   $7 = ((($0)) + 44|0);
   ;HEAP32[$7>>2]=0|0;HEAP32[$7+4>>2]=0|0;HEAP32[$7+8>>2]=0|0;
   HEAP32[$2>>2] = 0;
   $8 = $0;
   return ($8|0);
  }
  function _OCRAD_close($ocrdes) {
   $ocrdes = $ocrdes|0;
   var $$0 = 0, $$01 = 0, $$02 = 0, $$pre$i$i = 0, $$pre$i$i$i$i = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
   var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
   var $40 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $eh$lpad$body$index2Z2D = 0, $eh$lpad$body$indexZ2D = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$02 = -1;
    return ($$02|0);
   }
   $1 = ((($ocrdes)) + 4|0);
   $2 = HEAP32[$1>>2]|0;
   $3 = ($2|0)==(0|0);
   do {
    if (!($3)) {
     __THREW__ = 0;
     invoke_vi(26,($2|0));
     $4 = __THREW__; __THREW__ = 0;
     $5 = $4&1;
     if (!($5)) {
      __ZdlPv($2);
      break;
     }
     $6 = ___cxa_find_matching_catch_2()|0;
     $7 = tempRet0;
     __ZdlPv($2);
     $$0 = $7;$$01 = $6;
     ___resumeException($$01|0);
     // unreachable;
    }
   } while(0);
   $8 = HEAP32[$ocrdes>>2]|0;
   $9 = ($8|0)==(0|0);
   if (!($9)) {
    $10 = ((($8)) + 16|0);
    $11 = HEAP32[$10>>2]|0;
    $12 = ($11|0)==(0|0);
    if (!($12)) {
     $13 = ((($8)) + 20|0);
     $14 = HEAP32[$13>>2]|0;
     $15 = ($14|0)==($11|0);
     if ($15) {
      $25 = $11;
     } else {
      $17 = $14;
      while(1) {
       $16 = ((($17)) + -12|0);
       HEAP32[$13>>2] = $16;
       $18 = HEAP32[$16>>2]|0;
       $19 = ($18|0)==(0|0);
       if ($19) {
        $20 = $16;
       } else {
        $22 = ((($17)) + -8|0);
        $23 = HEAP32[$22>>2]|0;
        $24 = ($23|0)==($18|0);
        if (!($24)) {
         HEAP32[$22>>2] = $18;
        }
        __ZdlPv($18);
        $$pre$i$i$i$i = HEAP32[$13>>2]|0;
        $20 = $$pre$i$i$i$i;
       }
       $21 = ($20|0)==($11|0);
       if ($21) {
        break;
       } else {
        $17 = $20;
       }
      }
      $$pre$i$i = HEAP32[$10>>2]|0;
      $25 = $$pre$i$i;
     }
     __ZdlPv($25);
    }
    __ZdlPv($8);
   }
   $26 = ((($ocrdes)) + 44|0);
   __THREW__ = 0;
   invoke_vi(27,($26|0));
   $27 = __THREW__; __THREW__ = 0;
   $28 = $27&1;
   do {
    if ($28) {
     $32 = ___cxa_find_matching_catch_2()|0;
     $33 = tempRet0;
     $34 = ((($ocrdes)) + 12|0);
     __THREW__ = 0;
     invoke_vi(28,($34|0));
     $35 = __THREW__; __THREW__ = 0;
     $36 = $35&1;
     if ($36) {
      $37 = ___cxa_find_matching_catch_3(0|0)|0;
      $38 = tempRet0;
      ___clang_call_terminate($37);
      // unreachable;
     } else {
      $eh$lpad$body$index2Z2D = $33;$eh$lpad$body$indexZ2D = $32;
     }
    } else {
     $29 = ((($ocrdes)) + 12|0);
     __THREW__ = 0;
     invoke_vi(28,($29|0));
     $30 = __THREW__; __THREW__ = 0;
     $31 = $30&1;
     if ($31) {
      $39 = ___cxa_find_matching_catch_2()|0;
      $40 = tempRet0;
      $eh$lpad$body$index2Z2D = $40;$eh$lpad$body$indexZ2D = $39;
      break;
     }
     __ZdlPv($ocrdes);
     $$02 = 0;
     return ($$02|0);
    }
   } while(0);
   __ZdlPv($ocrdes);
   $$0 = $eh$lpad$body$index2Z2D;$$01 = $eh$lpad$body$indexZ2D;
   ___resumeException($$01|0);
   // unreachable;
   return (0)|0;
  }
  function _OCRAD_get_errno($ocrdes) {
   $ocrdes = $ocrdes|0;
   var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = 1;
    return ($$0|0);
   }
   $1 = ((($ocrdes)) + 8|0);
   $2 = HEAP32[$1>>2]|0;
   $$0 = $2;
   return ($$0|0);
  }
  function _OCRAD_set_image($ocrdes,$image,$invert) {
   $ocrdes = $ocrdes|0;
   $image = $image|0;
   $invert = $invert|0;
   var $$0 = 0, $$01 = 0, $$02 = 0, $$pre$i$i = 0, $$pre$i$i$i$i = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
   var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
   var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $switch = 0, label = 0, sp = 0;
   sp = STACKTOP;
   STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
   $0 = sp;
   $1 = ($ocrdes|0)==(0|0);
   if ($1) {
    $$02 = -1;
    STACKTOP = sp;return ($$02|0);
   }
   $2 = ($image|0)==(0|0);
   if (!($2)) {
    $3 = ((($image)) + 4|0);
    $4 = HEAP32[$3>>2]|0;
    $5 = ($4|0)<(3);
    if (!($5)) {
     $6 = ((($image)) + 8|0);
     $7 = HEAP32[$6>>2]|0;
     $8 = ($7|0)<(3);
     if (!($8)) {
      $9 = (2147483647 / ($7|0))&-1;
      $10 = ($9|0)<($4|0);
      if (!($10)) {
       $11 = ((($image)) + 12|0);
       $12 = HEAP32[$11>>2]|0;
       $switch = ($12>>>0)<(3);
       if ($switch) {
        __THREW__ = 0;
        $14 = (invoke_ii(29,32)|0);
        $15 = __THREW__; __THREW__ = 0;
        $16 = $15&1;
        L10: do {
         if ($16) {
          $24 = ___cxa_find_matching_catch_3(80|0)|0;
          $25 = tempRet0;
          $$0 = $25;$$01 = $24;
         } else {
          __THREW__ = 0;
          invoke_viii(30,($14|0),($image|0),($invert|0));
          $17 = __THREW__; __THREW__ = 0;
          $18 = $17&1;
          if ($18) {
           $26 = ___cxa_find_matching_catch_3(80|0)|0;
           $27 = tempRet0;
           __ZdlPv($14);
           $$0 = $27;$$01 = $26;
           break;
          }
          $19 = ((($ocrdes)) + 4|0);
          $20 = HEAP32[$19>>2]|0;
          $21 = ($20|0)==(0|0);
          do {
           if (!($21)) {
            __THREW__ = 0;
            invoke_vi(26,($20|0));
            $22 = __THREW__; __THREW__ = 0;
            $23 = $22&1;
            if ($23) {
             $28 = ___cxa_find_matching_catch_3(80|0)|0;
             $29 = tempRet0;
             __ZdlPv($20);
             $$0 = $29;$$01 = $28;
             break L10;
            } else {
             __ZdlPv($20);
             HEAP32[$19>>2] = 0;
             break;
            }
           }
          } while(0);
          $30 = HEAP32[$ocrdes>>2]|0;
          $31 = ($30|0)==(0|0);
          if (!($31)) {
           $32 = ((($30)) + 16|0);
           $33 = HEAP32[$32>>2]|0;
           $34 = ($33|0)==(0|0);
           if (!($34)) {
            $35 = ((($30)) + 20|0);
            $36 = HEAP32[$35>>2]|0;
            $37 = ($36|0)==($33|0);
            if ($37) {
             $47 = $33;
            } else {
             $39 = $36;
             while(1) {
              $38 = ((($39)) + -12|0);
              HEAP32[$35>>2] = $38;
              $40 = HEAP32[$38>>2]|0;
              $41 = ($40|0)==(0|0);
              if ($41) {
               $42 = $38;
              } else {
               $44 = ((($39)) + -8|0);
               $45 = HEAP32[$44>>2]|0;
               $46 = ($45|0)==($40|0);
               if (!($46)) {
                HEAP32[$44>>2] = $40;
               }
               __ZdlPv($40);
               $$pre$i$i$i$i = HEAP32[$35>>2]|0;
               $42 = $$pre$i$i$i$i;
              }
              $43 = ($42|0)==($33|0);
              if ($43) {
               break;
              } else {
               $39 = $42;
              }
             }
             $$pre$i$i = HEAP32[$32>>2]|0;
             $47 = $$pre$i$i;
            }
            __ZdlPv($47);
           }
           __ZdlPv($30);
          }
          HEAP32[$ocrdes>>2] = $14;
          $$02 = 0;
          STACKTOP = sp;return ($$02|0);
         }
        } while(0);
        $48 = (_llvm_eh_typeid_for((80|0))|0);
        $49 = ($$0|0)==($48|0);
        if (!($49)) {
         ___resumeException($$01|0);
         // unreachable;
        }
        (___cxa_get_exception_ptr(($$01|0))|0);
        HEAP32[$0>>2] = (808);
        (___cxa_begin_catch(($$01|0))|0);
        $50 = ((($ocrdes)) + 8|0);
        HEAP32[$50>>2] = 2;
        __ZNSt9bad_allocD2Ev($0);
        ___cxa_end_catch();
        $$02 = -1;
        STACKTOP = sp;return ($$02|0);
       }
      }
     }
    }
   }
   $13 = ((($ocrdes)) + 8|0);
   HEAP32[$13>>2] = 1;
   $$02 = -1;
   STACKTOP = sp;return ($$02|0);
  }
  function _OCRAD_set_image_from_file($ocrdes,$filename,$invert) {
   $ocrdes = $ocrdes|0;
   $filename = $filename|0;
   $invert = $invert|0;
   var $$0 = 0, $$01 = 0, $$1 = 0, $$pre$i$i = 0, $$pre$i$i$i$i = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
   var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
   var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $infile$0 = 0, $retval$0 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
   $0 = sp;
   $1 = ($ocrdes|0)==(0|0);
   if ($1) {
    $$1 = -1;
    STACKTOP = sp;return ($$1|0);
   }
   $2 = ($filename|0)==(0|0);
   if (!($2)) {
    $3 = HEAP8[$filename>>0]|0;
    $4 = ($3<<24>>24)==(0);
    if (!($4)) {
     $5 = (_strcmp($filename,860)|0);
     $6 = ($5|0)==(0);
     if ($6) {
      $7 = HEAP32[149]|0;
      $infile$0 = $7;
     } else {
      $8 = (_fopen($filename,862)|0);
      $infile$0 = $8;
     }
     $9 = ($infile$0|0)==(0|0);
     if (!($9)) {
      __THREW__ = 0;
      $11 = (invoke_ii(29,32)|0);
      $12 = __THREW__; __THREW__ = 0;
      $13 = $12&1;
      L12: do {
       if ($13) {
        $21 = ___cxa_find_matching_catch_4(80|0,0|0)|0;
        $22 = tempRet0;
        $$0 = $22;$$01 = $21;
        label = 28;
       } else {
        __THREW__ = 0;
        invoke_viii(31,($11|0),($infile$0|0),($invert|0));
        $14 = __THREW__; __THREW__ = 0;
        $15 = $14&1;
        if ($15) {
         $23 = ___cxa_find_matching_catch_4(80|0,0|0)|0;
         $24 = tempRet0;
         __ZdlPv($11);
         $$0 = $24;$$01 = $23;
         label = 28;
         break;
        }
        $16 = ((($ocrdes)) + 4|0);
        $17 = HEAP32[$16>>2]|0;
        $18 = ($17|0)==(0|0);
        do {
         if (!($18)) {
          __THREW__ = 0;
          invoke_vi(26,($17|0));
          $19 = __THREW__; __THREW__ = 0;
          $20 = $19&1;
          if ($20) {
           $25 = ___cxa_find_matching_catch_4(80|0,0|0)|0;
           $26 = tempRet0;
           __ZdlPv($17);
           $$0 = $26;$$01 = $25;
           label = 28;
           break L12;
          } else {
           __ZdlPv($17);
           HEAP32[$16>>2] = 0;
           break;
          }
         }
        } while(0);
        $27 = HEAP32[$ocrdes>>2]|0;
        $28 = ($27|0)==(0|0);
        if (!($28)) {
         $29 = ((($27)) + 16|0);
         $30 = HEAP32[$29>>2]|0;
         $31 = ($30|0)==(0|0);
         if (!($31)) {
          $32 = ((($27)) + 20|0);
          $33 = HEAP32[$32>>2]|0;
          $34 = ($33|0)==($30|0);
          if ($34) {
           $44 = $30;
          } else {
           $36 = $33;
           while(1) {
            $35 = ((($36)) + -12|0);
            HEAP32[$32>>2] = $35;
            $37 = HEAP32[$35>>2]|0;
            $38 = ($37|0)==(0|0);
            if ($38) {
             $39 = $35;
            } else {
             $41 = ((($36)) + -8|0);
             $42 = HEAP32[$41>>2]|0;
             $43 = ($42|0)==($37|0);
             if (!($43)) {
              HEAP32[$41>>2] = $37;
             }
             __ZdlPv($37);
             $$pre$i$i$i$i = HEAP32[$32>>2]|0;
             $39 = $$pre$i$i$i$i;
            }
            $40 = ($39|0)==($30|0);
            if ($40) {
             break;
            } else {
             $36 = $39;
            }
           }
           $$pre$i$i = HEAP32[$29>>2]|0;
           $44 = $$pre$i$i;
          }
          __ZdlPv($44);
         }
         __ZdlPv($27);
        }
        HEAP32[$ocrdes>>2] = $11;
        $retval$0 = 0;
       }
      } while(0);
      do {
       if ((label|0) == 28) {
        $45 = (_llvm_eh_typeid_for((80|0))|0);
        $46 = ($$0|0)==($45|0);
        if ($46) {
         (___cxa_get_exception_ptr(($$01|0))|0);
         HEAP32[$0>>2] = (808);
         (___cxa_begin_catch(($$01|0))|0);
         $47 = ((($ocrdes)) + 8|0);
         HEAP32[$47>>2] = 2;
         __ZNSt9bad_allocD2Ev($0);
         ___cxa_end_catch();
         $retval$0 = -1;
         break;
        } else {
         (___cxa_begin_catch(($$01|0))|0);
         $48 = ((($ocrdes)) + 8|0);
         HEAP32[$48>>2] = 1;
         ___cxa_end_catch();
         $retval$0 = -1;
         break;
        }
       }
      } while(0);
      (_fclose($infile$0)|0);
      $$1 = $retval$0;
      STACKTOP = sp;return ($$1|0);
     }
    }
   }
   $10 = ((($ocrdes)) + 8|0);
   HEAP32[$10>>2] = 1;
   $$1 = -1;
   STACKTOP = sp;return ($$1|0);
  }
  function _OCRAD_set_utf8_format($ocrdes,$utf8) {
   $ocrdes = $ocrdes|0;
   $utf8 = $utf8|0;
   var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if ($2) {
    $3 = ((($ocrdes)) + 8|0);
    HEAP32[$3>>2] = 3;
    $$0 = -1;
    return ($$0|0);
   } else {
    $4 = ((($ocrdes)) + 41|0);
    $5 = $utf8&1;
    HEAP8[$4>>0] = $5;
    $$0 = 0;
    return ($$0|0);
   }
   return (0)|0;
  }
  function _OCRAD_set_threshold($ocrdes,$threshold) {
   $ocrdes = $ocrdes|0;
   $threshold = $threshold|0;
   var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $threshold$off = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if ($2) {
    $3 = ((($ocrdes)) + 8|0);
    HEAP32[$3>>2] = 3;
    $$0 = -1;
    return ($$0|0);
   }
   $threshold$off = (($threshold) + 1)|0;
   $4 = ($threshold$off>>>0)>(256);
   if ($4) {
    $5 = ((($ocrdes)) + 8|0);
    HEAP32[$5>>2] = 1;
    $$0 = -1;
    return ($$0|0);
   } else {
    __ZN10Page_image9thresholdEi($1,$threshold);
    $$0 = 0;
    return ($$0|0);
   }
   return (0)|0;
  }
  function _OCRAD_scale($ocrdes,$value) {
   $ocrdes = $ocrdes|0;
   $value = $value|0;
   var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if ($2) {
    $3 = ((($ocrdes)) + 8|0);
    HEAP32[$3>>2] = 3;
    $$0 = -1;
    return ($$0|0);
   }
   __THREW__ = 0;
   $4 = (invoke_iii(32,($1|0),($value|0))|0);
   $5 = __THREW__; __THREW__ = 0;
   $6 = $5&1;
   if ($6) {
    $7 = ___cxa_find_matching_catch_3(0|0)|0;
    $8 = tempRet0;
    (___cxa_begin_catch(($7|0))|0);
    ___cxa_end_catch();
   } else {
    if ($4) {
     $$0 = 0;
     return ($$0|0);
    }
   }
   $9 = ((($ocrdes)) + 8|0);
   HEAP32[$9>>2] = 1;
   $$0 = -1;
   return ($$0|0);
  }
  function _OCRAD_transform($ocrdes,$transformation) {
   $ocrdes = $ocrdes|0;
   $transformation = $transformation|0;
   var $$0 = 0, $$1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $trans = 0, label = 0, sp = 0;
   sp = STACKTOP;
   STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
   $trans = sp;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$1 = -1;
    STACKTOP = sp;return ($$1|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if ($2) {
    $3 = ((($ocrdes)) + 8|0);
    HEAP32[$3>>2] = 3;
    $$1 = -1;
    STACKTOP = sp;return ($$1|0);
   }
   HEAP32[$trans>>2] = 0;
   $4 = (__ZN14Transformation3setEPKc($trans,$transformation)|0);
   if ($4) {
    $5 = HEAP32[$ocrdes>>2]|0;
    __ZN10Page_image9transformERK14Transformation($5,$trans);
    $$0 = 0;
   } else {
    $$0 = -1;
   }
   $$1 = $$0;
   STACKTOP = sp;return ($$1|0);
  }
  function _OCRAD_set_exportfile($ocrdes,$filename) {
   $ocrdes = $ocrdes|0;
   $filename = $filename|0;
   var $$1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $exportfile$0 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$1 = -1;
    return ($$1|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if ($2) {
    $3 = ((($ocrdes)) + 8|0);
    HEAP32[$3>>2] = 3;
    $$1 = -1;
    return ($$1|0);
   }
   $4 = ($filename|0)==(0|0);
   if (!($4)) {
    $5 = HEAP8[$filename>>0]|0;
    $6 = ($5<<24>>24)==(0);
    if (!($6)) {
     $7 = (_strcmp($filename,860)|0);
     $8 = ($7|0)==(0);
     if ($8) {
      $9 = HEAP32[119]|0;
      $exportfile$0 = $9;
     } else {
      $10 = (_fopen($filename,865)|0);
      $exportfile$0 = $10;
     }
     $11 = ($exportfile$0|0)==(0|0);
     if (!($11)) {
      $13 = ((($ocrdes)) + 32|0);
      HEAP32[$13>>2] = $exportfile$0;
      $$1 = 0;
      return ($$1|0);
     }
    }
   }
   $12 = ((($ocrdes)) + 8|0);
   HEAP32[$12>>2] = 1;
   $$1 = -1;
   return ($$1|0);
  }
  function _OCRAD_add_filter($ocrdes,$name) {
   $ocrdes = $ocrdes|0;
   $name = $name|0;
   var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if ($2) {
    $3 = ((($ocrdes)) + 8|0);
    HEAP32[$3>>2] = 3;
    $$0 = -1;
    return ($$0|0);
   } else {
    $4 = ((($ocrdes)) + 12|0);
    (__ZN7Control10add_filterEPKcS1_($4,7360,$name)|0);
    $$0 = 0;
    return ($$0|0);
   }
   return (0)|0;
  }
  function _OCRAD_recognize($ocrdes,$layout) {
   $ocrdes = $ocrdes|0;
   $layout = $layout|0;
   var $$0 = 0, $$01 = 0, $$1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0;
   var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$1 = -1;
    return ($$1|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if ($2) {
    $3 = ((($ocrdes)) + 8|0);
    HEAP32[$3>>2] = 3;
    $$1 = -1;
    return ($$1|0);
   }
   $4 = (__ZnwjRKSt9nothrow_t(40,9440)|0);
   $5 = ($4|0)==(0|0);
   if ($5) {
    $9 = ((($ocrdes)) + 8|0);
    HEAP32[$9>>2] = 2;
    $$1 = -1;
    return ($$1|0);
   }
   $6 = ((($ocrdes)) + 12|0);
   __THREW__ = 0;
   invoke_viiiii(33,($4|0),($1|0),(7360|0),($6|0),($layout|0));
   $7 = __THREW__; __THREW__ = 0;
   $8 = $7&1;
   if ($8) {
    $10 = ___cxa_find_matching_catch_2()|0;
    $11 = tempRet0;
    __ZdlPvRKSt9nothrow_t($4,9440);
    $$0 = $11;$$01 = $10;
    ___resumeException($$01|0);
    // unreachable;
   }
   $12 = ((($ocrdes)) + 4|0);
   $13 = HEAP32[$12>>2]|0;
   $14 = ($13|0)==(0|0);
   do {
    if (!($14)) {
     __THREW__ = 0;
     invoke_vi(26,($13|0));
     $15 = __THREW__; __THREW__ = 0;
     $16 = $15&1;
     if (!($16)) {
      __ZdlPv($13);
      break;
     }
     $17 = ___cxa_find_matching_catch_2()|0;
     $18 = tempRet0;
     __ZdlPv($13);
     $$0 = $18;$$01 = $17;
     ___resumeException($$01|0);
     // unreachable;
    }
   } while(0);
   HEAP32[$12>>2] = $4;
   $19 = ((($ocrdes)) + 32|0);
   $20 = HEAP32[$19>>2]|0;
   $21 = ($20|0)==(0|0);
   if ($21) {
    $$1 = 0;
    return ($$1|0);
   }
   __ZNK8Textpage6xprintERK7Control($4,$6);
   $$1 = 0;
   return ($$1|0);
  }
  function _OCRAD_result_blocks($ocrdes) {
   $ocrdes = $ocrdes|0;
   var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if (!($2)) {
    $3 = ((($ocrdes)) + 4|0);
    $4 = HEAP32[$3>>2]|0;
    $5 = ($4|0)==(0|0);
    if (!($5)) {
     $7 = ((($4)) + 28|0);
     $8 = ((($4)) + 32|0);
     $9 = HEAP32[$8>>2]|0;
     $10 = HEAP32[$7>>2]|0;
     $11 = (($9) - ($10))|0;
     $12 = $11 >> 2;
     $$0 = $12;
     return ($$0|0);
    }
   }
   $6 = ((($ocrdes)) + 8|0);
   HEAP32[$6>>2] = 3;
   $$0 = -1;
   return ($$0|0);
  }
  function _OCRAD_result_lines($ocrdes,$blocknum) {
   $ocrdes = $ocrdes|0;
   $blocknum = $blocknum|0;
   var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0;
   var $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if (!($2)) {
    $3 = ((($ocrdes)) + 4|0);
    $4 = HEAP32[$3>>2]|0;
    $5 = ($4|0)==(0|0);
    if (!($5)) {
     $7 = ($blocknum|0)<(0);
     if (!($7)) {
      $8 = ((($4)) + 28|0);
      $9 = ((($4)) + 32|0);
      $10 = HEAP32[$9>>2]|0;
      $11 = HEAP32[$8>>2]|0;
      $12 = (($10) - ($11))|0;
      $13 = $12 >> 2;
      $14 = ($13|0)>($blocknum|0);
      if ($14) {
       $16 = (__ZNK8Textpage9textblockEi($4,$blocknum)|0);
       $17 = ((($16)) + 16|0);
       $18 = ((($16)) + 20|0);
       $19 = HEAP32[$18>>2]|0;
       $20 = HEAP32[$17>>2]|0;
       $21 = (($19) - ($20))|0;
       $22 = $21 >> 2;
       $$0 = $22;
       return ($$0|0);
      }
     }
     $15 = ((($ocrdes)) + 8|0);
     HEAP32[$15>>2] = 1;
     $$0 = -1;
     return ($$0|0);
    }
   }
   $6 = ((($ocrdes)) + 8|0);
   HEAP32[$6>>2] = 3;
   $$0 = -1;
   return ($$0|0);
  }
  function _OCRAD_result_chars_total($ocrdes) {
   $ocrdes = $ocrdes|0;
   var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
   var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
   var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $b$04 = 0, $c$03 = 0, $c$1$lcssa = 0, $c$11 = 0, $i$02 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if (!($2)) {
    $3 = ((($ocrdes)) + 4|0);
    $4 = HEAP32[$3>>2]|0;
    $5 = ($4|0)==(0|0);
    if (!($5)) {
     $6 = ((($4)) + 28|0);
     $7 = ((($4)) + 32|0);
     $8 = HEAP32[$7>>2]|0;
     $9 = HEAP32[$6>>2]|0;
     $10 = (($8) - ($9))|0;
     $11 = ($10|0)>(0);
     if ($11) {
      $13 = $4;$b$04 = 0;$c$03 = 0;
     } else {
      $$0 = 0;
      return ($$0|0);
     }
     while(1) {
      $14 = (__ZNK8Textpage9textblockEi($13,$b$04)|0);
      $15 = ((($14)) + 16|0);
      $16 = ((($14)) + 20|0);
      $17 = HEAP32[$16>>2]|0;
      $18 = HEAP32[$15>>2]|0;
      $19 = (($17) - ($18))|0;
      $20 = ($19|0)>(0);
      if ($20) {
       $c$11 = $c$03;$i$02 = 0;
       while(1) {
        $30 = HEAP32[$3>>2]|0;
        $31 = (__ZNK8Textpage9textblockEi($30,$b$04)|0);
        $32 = (__ZNK9Textblock8textlineEi($31,$i$02)|0);
        $33 = ((($32)) + 16|0);
        $34 = ((($32)) + 20|0);
        $35 = HEAP32[$34>>2]|0;
        $36 = HEAP32[$33>>2]|0;
        $37 = (($35) - ($36))|0;
        $38 = $37 >> 2;
        $39 = (($38) + ($c$11))|0;
        $40 = (($i$02) + 1)|0;
        $41 = HEAP32[$3>>2]|0;
        $42 = (__ZNK8Textpage9textblockEi($41,$b$04)|0);
        $43 = ((($42)) + 16|0);
        $44 = ((($42)) + 20|0);
        $45 = HEAP32[$44>>2]|0;
        $46 = HEAP32[$43>>2]|0;
        $47 = (($45) - ($46))|0;
        $48 = $47 >> 2;
        $49 = ($40|0)<($48|0);
        if ($49) {
         $c$11 = $39;$i$02 = $40;
        } else {
         $c$1$lcssa = $39;
         break;
        }
       }
      } else {
       $c$1$lcssa = $c$03;
      }
      $21 = (($b$04) + 1)|0;
      $22 = HEAP32[$3>>2]|0;
      $23 = ((($22)) + 28|0);
      $24 = ((($22)) + 32|0);
      $25 = HEAP32[$24>>2]|0;
      $26 = HEAP32[$23>>2]|0;
      $27 = (($25) - ($26))|0;
      $28 = $27 >> 2;
      $29 = ($21|0)<($28|0);
      if ($29) {
       $13 = $22;$b$04 = $21;$c$03 = $c$1$lcssa;
      } else {
       $$0 = $c$1$lcssa;
       break;
      }
     }
     return ($$0|0);
    }
   }
   $12 = ((($ocrdes)) + 8|0);
   HEAP32[$12>>2] = 3;
   $$0 = -1;
   return ($$0|0);
  }
  function _OCRAD_result_chars_block($ocrdes,$blocknum) {
   $ocrdes = $ocrdes|0;
   $blocknum = $blocknum|0;
   var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
   var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $5 = 0;
   var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $c$01 = 0, $i$02 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if (!($2)) {
    $3 = ((($ocrdes)) + 4|0);
    $4 = HEAP32[$3>>2]|0;
    $5 = ($4|0)==(0|0);
    if (!($5)) {
     $7 = ($blocknum|0)<(0);
     if (!($7)) {
      $8 = ((($4)) + 28|0);
      $9 = ((($4)) + 32|0);
      $10 = HEAP32[$9>>2]|0;
      $11 = HEAP32[$8>>2]|0;
      $12 = (($10) - ($11))|0;
      $13 = $12 >> 2;
      $14 = ($13|0)>($blocknum|0);
      if ($14) {
       $15 = (__ZNK8Textpage9textblockEi($4,$blocknum)|0);
       $16 = ((($15)) + 16|0);
       $17 = ((($15)) + 20|0);
       $18 = HEAP32[$17>>2]|0;
       $19 = HEAP32[$16>>2]|0;
       $20 = (($18) - ($19))|0;
       $21 = ($20|0)>(0);
       if ($21) {
        $c$01 = 0;$i$02 = 0;
       } else {
        $$0 = 0;
        return ($$0|0);
       }
       while(1) {
        $23 = HEAP32[$3>>2]|0;
        $24 = (__ZNK8Textpage9textblockEi($23,$blocknum)|0);
        $25 = (__ZNK9Textblock8textlineEi($24,$i$02)|0);
        $26 = ((($25)) + 16|0);
        $27 = ((($25)) + 20|0);
        $28 = HEAP32[$27>>2]|0;
        $29 = HEAP32[$26>>2]|0;
        $30 = (($28) - ($29))|0;
        $31 = $30 >> 2;
        $32 = (($31) + ($c$01))|0;
        $33 = (($i$02) + 1)|0;
        $34 = HEAP32[$3>>2]|0;
        $35 = (__ZNK8Textpage9textblockEi($34,$blocknum)|0);
        $36 = ((($35)) + 16|0);
        $37 = ((($35)) + 20|0);
        $38 = HEAP32[$37>>2]|0;
        $39 = HEAP32[$36>>2]|0;
        $40 = (($38) - ($39))|0;
        $41 = $40 >> 2;
        $42 = ($33|0)<($41|0);
        if ($42) {
         $c$01 = $32;$i$02 = $33;
        } else {
         $$0 = $32;
         break;
        }
       }
       return ($$0|0);
      }
     }
     $22 = ((($ocrdes)) + 8|0);
     HEAP32[$22>>2] = 1;
     $$0 = -1;
     return ($$0|0);
    }
   }
   $6 = ((($ocrdes)) + 8|0);
   HEAP32[$6>>2] = 3;
   $$0 = -1;
   return ($$0|0);
  }
  function _OCRAD_result_chars_line($ocrdes,$blocknum,$linenum) {
   $ocrdes = $ocrdes|0;
   $blocknum = $blocknum|0;
   $linenum = $linenum|0;
   var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
   var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if (!($2)) {
    $3 = ((($ocrdes)) + 4|0);
    $4 = HEAP32[$3>>2]|0;
    $5 = ($4|0)==(0|0);
    if (!($5)) {
     $7 = ($blocknum|0)<(0);
     if (!($7)) {
      $8 = ((($4)) + 28|0);
      $9 = ((($4)) + 32|0);
      $10 = HEAP32[$9>>2]|0;
      $11 = HEAP32[$8>>2]|0;
      $12 = (($10) - ($11))|0;
      $13 = $12 >> 2;
      $14 = ($13|0)<=($blocknum|0);
      $15 = ($linenum|0)<(0);
      $or$cond = $15 | $14;
      if (!($or$cond)) {
       $16 = (__ZNK8Textpage9textblockEi($4,$blocknum)|0);
       $17 = ((($16)) + 16|0);
       $18 = ((($16)) + 20|0);
       $19 = HEAP32[$18>>2]|0;
       $20 = HEAP32[$17>>2]|0;
       $21 = (($19) - ($20))|0;
       $22 = $21 >> 2;
       $23 = ($22|0)>($linenum|0);
       if ($23) {
        $25 = HEAP32[$3>>2]|0;
        $26 = (__ZNK8Textpage9textblockEi($25,$blocknum)|0);
        $27 = (__ZNK9Textblock8textlineEi($26,$linenum)|0);
        $28 = ((($27)) + 16|0);
        $29 = ((($27)) + 20|0);
        $30 = HEAP32[$29>>2]|0;
        $31 = HEAP32[$28>>2]|0;
        $32 = (($30) - ($31))|0;
        $33 = $32 >> 2;
        $$0 = $33;
        return ($$0|0);
       }
      }
     }
     $24 = ((($ocrdes)) + 8|0);
     HEAP32[$24>>2] = 1;
     $$0 = -1;
     return ($$0|0);
    }
   }
   $6 = ((($ocrdes)) + 8|0);
   HEAP32[$6>>2] = 3;
   $$0 = -1;
   return ($$0|0);
  }
  function _OCRAD_result_line($ocrdes,$blocknum,$linenum) {
   $ocrdes = $ocrdes|0;
   $blocknum = $blocknum|0;
   $linenum = $linenum|0;
   var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
   var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
   var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0;
   var $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $7 = 0, $8 = 0, $9 = 0, $i$04 = 0, $i1$05 = 0, $or$cond = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = 0;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if (!($2)) {
    $3 = ((($ocrdes)) + 4|0);
    $4 = HEAP32[$3>>2]|0;
    $5 = ($4|0)==(0|0);
    if (!($5)) {
     $7 = ($blocknum|0)<(0);
     if (!($7)) {
      $8 = ((($4)) + 28|0);
      $9 = ((($4)) + 32|0);
      $10 = HEAP32[$9>>2]|0;
      $11 = HEAP32[$8>>2]|0;
      $12 = (($10) - ($11))|0;
      $13 = $12 >> 2;
      $14 = ($13|0)<=($blocknum|0);
      $15 = ($linenum|0)<(0);
      $or$cond = $15 | $14;
      if (!($or$cond)) {
       $16 = (__ZNK8Textpage9textblockEi($4,$blocknum)|0);
       $17 = ((($16)) + 16|0);
       $18 = ((($16)) + 20|0);
       $19 = HEAP32[$18>>2]|0;
       $20 = HEAP32[$17>>2]|0;
       $21 = (($19) - ($20))|0;
       $22 = $21 >> 2;
       $23 = ($22|0)>($linenum|0);
       if ($23) {
        $25 = HEAP32[$3>>2]|0;
        $26 = (__ZNK8Textpage9textblockEi($25,$blocknum)|0);
        $27 = (__ZNK9Textblock8textlineEi($26,$linenum)|0);
        $28 = ((($ocrdes)) + 44|0);
        $29 = HEAP8[$28>>0]|0;
        $30 = $29 & 1;
        $31 = ($30<<24>>24)==(0);
        if ($31) {
         $35 = ((($28)) + 1|0);
         HEAP8[$35>>0] = 0;
         HEAP8[$28>>0] = 0;
        } else {
         $32 = ((($ocrdes)) + 52|0);
         $33 = HEAP32[$32>>2]|0;
         HEAP8[$33>>0] = 0;
         $34 = ((($ocrdes)) + 48|0);
         HEAP32[$34>>2] = 0;
        }
        $36 = ((($ocrdes)) + 41|0);
        $37 = HEAP8[$36>>0]|0;
        $38 = ($37<<24>>24)==(0);
        $39 = ((($27)) + 16|0);
        $40 = ((($27)) + 20|0);
        $41 = HEAP32[$40>>2]|0;
        $42 = HEAP32[$39>>2]|0;
        $43 = (($41) - ($42))|0;
        $44 = ($43|0)>(0);
        if ($38) {
         if ($44) {
          $i$04 = 0;
          while(1) {
           $45 = (__ZNK8Textline9characterEi($27,$i$04)|0);
           $46 = (__ZNK9Character11byte_resultEv($45)|0);
           __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc($28,$46);
           $47 = (($i$04) + 1)|0;
           $48 = HEAP32[$40>>2]|0;
           $49 = HEAP32[$39>>2]|0;
           $50 = (($48) - ($49))|0;
           $51 = $50 >> 2;
           $52 = ($47|0)<($51|0);
           if ($52) {
            $i$04 = $47;
           } else {
            break;
           }
          }
         }
        } else {
         if ($44) {
          $i1$05 = 0;
          while(1) {
           $53 = (__ZNK8Textline9characterEi($27,$i1$05)|0);
           $54 = (__ZNK9Character11utf8_resultEv($53)|0);
           (__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc($28,$54)|0);
           $55 = (($i1$05) + 1)|0;
           $56 = HEAP32[$40>>2]|0;
           $57 = HEAP32[$39>>2]|0;
           $58 = (($56) - ($57))|0;
           $59 = $58 >> 2;
           $60 = ($55|0)<($59|0);
           if ($60) {
            $i1$05 = $55;
           } else {
            break;
           }
          }
         }
        }
        __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc($28,10);
        $61 = HEAP8[$28>>0]|0;
        $62 = $61 & 1;
        $63 = ($62<<24>>24)==(0);
        if ($63) {
         $66 = ((($28)) + 1|0);
         $$0 = $66;
         return ($$0|0);
        } else {
         $64 = ((($ocrdes)) + 52|0);
         $65 = HEAP32[$64>>2]|0;
         $$0 = $65;
         return ($$0|0);
        }
       }
      }
     }
     $24 = ((($ocrdes)) + 8|0);
     HEAP32[$24>>2] = 1;
     $$0 = 0;
     return ($$0|0);
    }
   }
   $6 = ((($ocrdes)) + 8|0);
   HEAP32[$6>>2] = 3;
   $$0 = 0;
   return ($$0|0);
  }
  function _OCRAD_result_first_character($ocrdes) {
   $ocrdes = $ocrdes|0;
   var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
   var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ($ocrdes|0)==(0|0);
   if ($0) {
    $$0 = -1;
    return ($$0|0);
   }
   $1 = HEAP32[$ocrdes>>2]|0;
   $2 = ($1|0)==(0|0);
   if (!($2)) {
    $3 = ((($ocrdes)) + 4|0);
    $4 = HEAP32[$3>>2]|0;
    $5 = ($4|0)==(0|0);
    if (!($5)) {
     $7 = ((($4)) + 28|0);
     $8 = ((($4)) + 32|0);
     $9 = HEAP32[$8>>2]|0;
     $10 = HEAP32[$7>>2]|0;
     $11 = (($9) - ($10))|0;
     $12 = ($11|0)>(0);
     if (!($12)) {
      $$0 = 0;
      return ($$0|0);
     }
     $13 = (__ZNK8Textpage9textblockEi($4,0)|0);
     $14 = ((($13)) + 16|0);
     $15 = ((($13)) + 20|0);
     $16 = HEAP32[$15>>2]|0;
     $17 = HEAP32[$14>>2]|0;
     $18 = (($16) - ($17))|0;
     $19 = ($18|0)>(0);
     if (!($19)) {
      $$0 = 0;
      return ($$0|0);
     }
     $20 = HEAP32[$3>>2]|0;
     $21 = (__ZNK8Textpage9textblockEi($20,0)|0);
     $22 = (__ZNK9Textblock8textlineEi($21,0)|0);
     $23 = (__ZNK8Textline9characterEi($22,0)|0);
     $24 = ((($23)) + 28|0);
     $25 = ((($23)) + 32|0);
     $26 = HEAP32[$25>>2]|0;
     $27 = HEAP32[$24>>2]|0;
     $28 = ($26|0)==($27|0);
     if ($28) {
      $$0 = 0;
      return ($$0|0);
     }
     $29 = ((($ocrdes)) + 41|0);
     $30 = HEAP8[$29>>0]|0;
     $31 = ($30<<24>>24)==(0);
     $32 = (__ZNK9Character5guessEi($23,0)|0);
     $33 = HEAP32[$32>>2]|0;
     if (!($31)) {
      $$0 = $33;
      return ($$0|0);
     }
     $34 = (__ZN3UCS11map_to_byteEi($33)|0);
     $35 = $34&255;
     $$0 = $35;
     return ($$0|0);
    }
   }
   $6 = ((($ocrdes)) + 8|0);
   HEAP32[$6>>2] = 3;
   $$0 = -1;
   return ($$0|0);
  }
  function ___clang_call_terminate($0) {
   $0 = $0|0;
   var label = 0, sp = 0;
   sp = STACKTOP;
   (___cxa_begin_catch(($0|0))|0);
   __ZSt9terminatev();
   // unreachable;
  }
  function __ZN10Page_image7read_p1EP8_IO_FILEb($this,$f,$invert) {
   $this = $this|0;
   $f = $f|0;
   $invert = $invert|0;
   var $$0$i$us = 0, $$0$i1$i$i$us = 0, $$0$i1$i$i10$us = 0, $$0$i14$us = 0, $$0$i2$i$i$us = 0, $$0$i2$i$i11$us = 0, $$in$i$i$us = 0, $$in$i$i7$us = 0, $$pre$i$i$us = 0, $$pre$i$i3$us = 0, $$pre$i$us = 0, $$pre$i5$us = 0, $$pre$phi$i$usZ2D = 0, $$pre$phi$i6$usZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0;
   var $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0;
   var $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0;
   var $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0;
   var $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0;
   var $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0;
   var $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0;
   var $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $ch$0$i$us = 0, $ch$0$i$us$lcssa = 0, $ch$0$i18$us = 0, $ch$0$i18$us$lcssa = 0, $col$029$us = 0, $col2$026$us = 0;
   var $row$032$us = 0, $row1$027$us = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ((($this)) + 28|0);
   HEAP8[$0>>0] = 1;
   $1 = ((($this)) + 29|0);
   HEAP8[$1>>0] = 0;
   $2 = ((($this)) + 12|0);
   $3 = HEAP32[$2>>2]|0;
   $4 = ((($this)) + 4|0);
   $5 = HEAP32[$4>>2]|0;
   $6 = (($3) + 1)|0;
   $7 = (($6) - ($5))|0;
   $8 = ((($this)) + 8|0);
   $9 = HEAP32[$8>>2]|0;
   $10 = HEAP32[$this>>2]|0;
   $11 = (($9) + 1)|0;
   $12 = (($11) - ($10))|0;
   $13 = ($7|0)>(0);
   if ($invert) {
    if (!($13)) {
     return;
    }
    $72 = ($12|0)>(0);
    $73 = ((($this)) + 16|0);
    if ($72) {
     $row1$027$us = 0;
    } else {
     return;
    }
    L8: while(1) {
     $col2$026$us = 0;
     while(1) {
      $74 = HEAP32[$73>>2]|0;
      $75 = (($74) + (($row1$027$us*12)|0)|0);
      while(1) {
       $76 = (_fgetc($f)|0);
       $77 = ($76|0)==(-1);
       if ($77) {
        label = 53;
        break L8;
       }
       $78 = $76&255;
       $79 = ($78<<24>>24)==(35);
       if ($79) {
        while(1) {
         $80 = (_fgetc($f)|0);
         $81 = ($80|0)==(-1);
         if ($81) {
          label = 54;
          break L8;
         }
         $82 = $80&255;
         $83 = ($82<<24>>24)==(10);
         if ($83) {
          $ch$0$i18$us = 10;
          break;
         }
        }
       } else {
        $ch$0$i18$us = $78;
       }
       $84 = $ch$0$i18$us&255;
       $85 = (_isspace($84)|0);
       $86 = ($85|0)==(0);
       if ($86) {
        $ch$0$i18$us$lcssa = $ch$0$i18$us;
        break;
       }
      }
      switch ($ch$0$i18$us$lcssa<<24>>24) {
      case 48:  {
       $$0$i14$us = 0;
       break;
      }
      case 49:  {
       $$0$i14$us = 1;
       break;
      }
      default: {
       label = 55;
       break L8;
      }
      }
      $87 = (((($74) + (($row1$027$us*12)|0)|0)) + 4|0);
      $88 = HEAP32[$87>>2]|0;
      $89 = (((($74) + (($row1$027$us*12)|0)|0)) + 8|0);
      $90 = HEAP32[$89>>2]|0;
      $91 = ($88|0)==($90|0);
      $92 = $90;
      if ($91) {
       $95 = $88;
       $96 = HEAP32[$75>>2]|0;
       $97 = (($95) - ($96))|0;
       $98 = (($97) + 1)|0;
       $99 = ($98|0)<(0);
       if ($99) {
        __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($75);
        $$pre$i$i$us = HEAP32[$75>>2]|0;
        $$pre$i$us = HEAP32[$89>>2]|0;
        $$in$i$i$us = $$pre$i$i$us;$$pre$phi$i$usZ2D = $89;$102 = $$pre$i$us;
       } else {
        $$in$i$i$us = $96;$$pre$phi$i$usZ2D = $89;$102 = $92;
       }
       $100 = $$in$i$i$us;
       $101 = (($102) - ($$in$i$i$us))|0;
       $103 = ($101>>>0)<(1073741823);
       if ($103) {
        $106 = $101 << 1;
        $107 = ($106>>>0)<($98>>>0);
        $108 = $107 ? $98 : $106;
        $109 = HEAP32[$87>>2]|0;
        $110 = (($109) - ($$in$i$i$us))|0;
        $111 = ($108|0)==(0);
        if ($111) {
         $$0$i2$i$i$us = 0;$114 = 0;$115 = $110;$121 = $109;
        } else {
         $$0$i1$i$i$us = $108;$138 = $109;$139 = $110;
         label = 44;
        }
       } else {
        $104 = HEAP32[$87>>2]|0;
        $105 = (($104) - ($$in$i$i$us))|0;
        $$0$i1$i$i$us = 2147483647;$138 = $104;$139 = $105;
        label = 44;
       }
       if ((label|0) == 44) {
        label = 0;
        $112 = (__Znwj($$0$i1$i$i$us)|0);
        $$0$i2$i$i$us = $$0$i1$i$i$us;$114 = $112;$115 = $139;$121 = $138;
       }
       $113 = (($114) + ($115)|0);
       $116 = (($114) + ($$0$i2$i$i$us)|0);
       $117 = $116;
       HEAP8[$113>>0] = $$0$i14$us;
       $118 = ((($113)) + 1|0);
       $119 = $118;
       $120 = (($121) - ($$in$i$i$us))|0;
       $122 = (0 - ($120))|0;
       $123 = (($113) + ($122)|0);
       $124 = $123;
       _memcpy(($123|0),($100|0),($120|0))|0;
       HEAP32[$75>>2] = $124;
       HEAP32[$87>>2] = $119;
       HEAP32[$$pre$phi$i$usZ2D>>2] = $117;
       $125 = ($$in$i$i$us|0)==(0);
       if (!($125)) {
        __ZdlPv($100);
       }
      } else {
       HEAP8[$88>>0] = $$0$i14$us;
       $93 = HEAP32[$87>>2]|0;
       $94 = ((($93)) + 1|0);
       HEAP32[$87>>2] = $94;
      }
      $126 = (($col2$026$us) + 1)|0;
      $127 = ($126|0)<($12|0);
      if ($127) {
       $col2$026$us = $126;
      } else {
       break;
      }
     }
     $128 = (($row1$027$us) + 1)|0;
     $129 = ($128|0)<($7|0);
     if ($129) {
      $row1$027$us = $128;
     } else {
      label = 56;
      break;
     }
    }
    if ((label|0) == 53) {
     $133 = (___cxa_allocate_exception(4)|0);
     HEAP32[$133>>2] = 872;
     ___cxa_throw(($133|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 54) {
     $134 = (___cxa_allocate_exception(4)|0);
     HEAP32[$134>>2] = 872;
     ___cxa_throw(($134|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 55) {
     $135 = (___cxa_allocate_exception(4)|0);
     HEAP32[$135>>2] = 923;
     ___cxa_throw(($135|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 56) {
     return;
    }
   } else {
    if (!($13)) {
     return;
    }
    $14 = ($12|0)>(0);
    $15 = ((($this)) + 16|0);
    if ($14) {
     $row$032$us = 0;
    } else {
     return;
    }
    L51: while(1) {
     $col$029$us = 0;
     while(1) {
      $16 = HEAP32[$15>>2]|0;
      $17 = (($16) + (($row$032$us*12)|0)|0);
      while(1) {
       $18 = (_fgetc($f)|0);
       $19 = ($18|0)==(-1);
       if ($19) {
        label = 50;
        break L51;
       }
       $20 = $18&255;
       $21 = ($20<<24>>24)==(35);
       if ($21) {
        while(1) {
         $22 = (_fgetc($f)|0);
         $23 = ($22|0)==(-1);
         if ($23) {
          label = 51;
          break L51;
         }
         $24 = $22&255;
         $25 = ($24<<24>>24)==(10);
         if ($25) {
          $ch$0$i$us = 10;
          break;
         }
        }
       } else {
        $ch$0$i$us = $20;
       }
       $26 = $ch$0$i$us&255;
       $27 = (_isspace($26)|0);
       $28 = ($27|0)==(0);
       if ($28) {
        $ch$0$i$us$lcssa = $ch$0$i$us;
        break;
       }
      }
      switch ($ch$0$i$us$lcssa<<24>>24) {
      case 48:  {
       $$0$i$us = 1;
       break;
      }
      case 49:  {
       $$0$i$us = 0;
       break;
      }
      default: {
       label = 52;
       break L51;
      }
      }
      $29 = (((($16) + (($row$032$us*12)|0)|0)) + 4|0);
      $30 = HEAP32[$29>>2]|0;
      $31 = (((($16) + (($row$032$us*12)|0)|0)) + 8|0);
      $32 = HEAP32[$31>>2]|0;
      $33 = ($30|0)==($32|0);
      $34 = $32;
      if ($33) {
       $37 = $30;
       $38 = HEAP32[$17>>2]|0;
       $39 = (($37) - ($38))|0;
       $40 = (($39) + 1)|0;
       $41 = ($40|0)<(0);
       if ($41) {
        __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($17);
        $$pre$i$i3$us = HEAP32[$17>>2]|0;
        $$pre$i5$us = HEAP32[$31>>2]|0;
        $$in$i$i7$us = $$pre$i$i3$us;$$pre$phi$i6$usZ2D = $31;$44 = $$pre$i5$us;
       } else {
        $$in$i$i7$us = $38;$$pre$phi$i6$usZ2D = $31;$44 = $34;
       }
       $42 = $$in$i$i7$us;
       $43 = (($44) - ($$in$i$i7$us))|0;
       $45 = ($43>>>0)<(1073741823);
       if ($45) {
        $48 = $43 << 1;
        $49 = ($48>>>0)<($40>>>0);
        $50 = $49 ? $40 : $48;
        $51 = HEAP32[$29>>2]|0;
        $52 = (($51) - ($$in$i$i7$us))|0;
        $53 = ($50|0)==(0);
        if ($53) {
         $$0$i2$i$i11$us = 0;$56 = 0;$57 = $52;$63 = $51;
        } else {
         $$0$i1$i$i10$us = $50;$136 = $51;$137 = $52;
         label = 20;
        }
       } else {
        $46 = HEAP32[$29>>2]|0;
        $47 = (($46) - ($$in$i$i7$us))|0;
        $$0$i1$i$i10$us = 2147483647;$136 = $46;$137 = $47;
        label = 20;
       }
       if ((label|0) == 20) {
        label = 0;
        $54 = (__Znwj($$0$i1$i$i10$us)|0);
        $$0$i2$i$i11$us = $$0$i1$i$i10$us;$56 = $54;$57 = $137;$63 = $136;
       }
       $55 = (($56) + ($57)|0);
       $58 = (($56) + ($$0$i2$i$i11$us)|0);
       $59 = $58;
       HEAP8[$55>>0] = $$0$i$us;
       $60 = ((($55)) + 1|0);
       $61 = $60;
       $62 = (($63) - ($$in$i$i7$us))|0;
       $64 = (0 - ($62))|0;
       $65 = (($55) + ($64)|0);
       $66 = $65;
       _memcpy(($65|0),($42|0),($62|0))|0;
       HEAP32[$17>>2] = $66;
       HEAP32[$29>>2] = $61;
       HEAP32[$$pre$phi$i6$usZ2D>>2] = $59;
       $67 = ($$in$i$i7$us|0)==(0);
       if (!($67)) {
        __ZdlPv($42);
       }
      } else {
       HEAP8[$30>>0] = $$0$i$us;
       $35 = HEAP32[$29>>2]|0;
       $36 = ((($35)) + 1|0);
       HEAP32[$29>>2] = $36;
      }
      $68 = (($col$029$us) + 1)|0;
      $69 = ($68|0)<($12|0);
      if ($69) {
       $col$029$us = $68;
      } else {
       break;
      }
     }
     $70 = (($row$032$us) + 1)|0;
     $71 = ($70|0)<($7|0);
     if ($71) {
      $row$032$us = $70;
     } else {
      label = 56;
      break;
     }
    }
    if ((label|0) == 50) {
     $130 = (___cxa_allocate_exception(4)|0);
     HEAP32[$130>>2] = 872;
     ___cxa_throw(($130|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 51) {
     $131 = (___cxa_allocate_exception(4)|0);
     HEAP32[$131>>2] = 872;
     ___cxa_throw(($131|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 52) {
     $132 = (___cxa_allocate_exception(4)|0);
     HEAP32[$132>>2] = 923;
     ___cxa_throw(($132|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 56) {
     return;
    }
   }
  }
  function __ZN10Page_image7read_p4EP8_IO_FILEb($this,$f,$invert) {
   $this = $this|0;
   $f = $f|0;
   $invert = $invert|0;
   var $$0$i1$i$i$us = 0, $$0$i1$i$i12$us = 0, $$0$i2$i$i$us = 0, $$0$i2$i$i13$us = 0, $$in$i$i$us = 0, $$in$i$i9$us = 0, $$pre$i$i$us = 0, $$pre$i$i5$us = 0, $$pre$i$us = 0, $$pre$i7$us = 0, $$pre$phi$i$usZ2D = 0, $$pre$phi$i8$usZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
   var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
   var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
   var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
   var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
   var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
   var $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0;
   var $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $col$030$us = 0, $col$1$lcssa$us = 0, $col$127$us = 0, $col2$022$us = 0, $col2$1$lcssa$us = 0, $col2$121$us = 0, $not$$us = 0, $or$cond$us = 0, $or$cond2$us = 0, $row$032$us = 0, $row1$024$us = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ((($this)) + 28|0);
   HEAP8[$0>>0] = 1;
   $1 = ((($this)) + 29|0);
   HEAP8[$1>>0] = 0;
   $2 = ((($this)) + 12|0);
   $3 = HEAP32[$2>>2]|0;
   $4 = ((($this)) + 4|0);
   $5 = HEAP32[$4>>2]|0;
   $6 = (($3) + 1)|0;
   $7 = (($6) - ($5))|0;
   $8 = ((($this)) + 8|0);
   $9 = HEAP32[$8>>2]|0;
   $10 = HEAP32[$this>>2]|0;
   $11 = (($9) + 1)|0;
   $12 = (($11) - ($10))|0;
   $13 = ($7|0)>(0);
   if ($invert) {
    if (!($13)) {
     return;
    }
    $70 = ($12|0)>(0);
    $71 = ((($this)) + 16|0);
    if ($70) {
     $row1$024$us = 0;
    } else {
     return;
    }
    L8: while(1) {
     $col2$022$us = 0;
     while(1) {
      $72 = (_fgetc($f)|0);
      $73 = ($72|0)==(-1);
      if ($73) {
       label = 41;
       break L8;
      }
      $123 = ($col2$022$us|0)<($12|0);
      if ($123) {
       $77 = 128;$col2$121$us = $col2$022$us;
       while(1) {
        $74 = HEAP32[$71>>2]|0;
        $75 = (($74) + (($row1$024$us*12)|0)|0);
        $76 = $77 & $72;
        $78 = ($76|0)!=(0);
        $79 = $78&1;
        $80 = (((($74) + (($row1$024$us*12)|0)|0)) + 4|0);
        $81 = HEAP32[$80>>2]|0;
        $82 = (((($74) + (($row1$024$us*12)|0)|0)) + 8|0);
        $83 = HEAP32[$82>>2]|0;
        $84 = ($81|0)==($83|0);
        $85 = $83;
        if ($84) {
         $88 = $81;
         $89 = HEAP32[$75>>2]|0;
         $90 = (($88) - ($89))|0;
         $91 = (($90) + 1)|0;
         $92 = ($91|0)<(0);
         if ($92) {
          __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($75);
          $$pre$i$i$us = HEAP32[$75>>2]|0;
          $$pre$i$us = HEAP32[$82>>2]|0;
          $$in$i$i$us = $$pre$i$i$us;$$pre$phi$i$usZ2D = $82;$95 = $$pre$i$us;
         } else {
          $$in$i$i$us = $89;$$pre$phi$i$usZ2D = $82;$95 = $85;
         }
         $93 = $$in$i$i$us;
         $94 = (($95) - ($$in$i$i$us))|0;
         $96 = ($94>>>0)<(1073741823);
         if ($96) {
          $99 = $94 << 1;
          $100 = ($99>>>0)<($91>>>0);
          $101 = $100 ? $91 : $99;
          $102 = HEAP32[$80>>2]|0;
          $103 = (($102) - ($$in$i$i$us))|0;
          $104 = ($101|0)==(0);
          if ($104) {
           $$0$i2$i$i$us = 0;$107 = 0;$108 = $103;$114 = $102;
          } else {
           $$0$i1$i$i$us = $101;$131 = $102;$132 = $103;
           label = 32;
          }
         } else {
          $97 = HEAP32[$80>>2]|0;
          $98 = (($97) - ($$in$i$i$us))|0;
          $$0$i1$i$i$us = 2147483647;$131 = $97;$132 = $98;
          label = 32;
         }
         if ((label|0) == 32) {
          label = 0;
          $105 = (__Znwj($$0$i1$i$i$us)|0);
          $$0$i2$i$i$us = $$0$i1$i$i$us;$107 = $105;$108 = $132;$114 = $131;
         }
         $106 = (($107) + ($108)|0);
         $109 = (($107) + ($$0$i2$i$i$us)|0);
         $110 = $109;
         HEAP8[$106>>0] = $79;
         $111 = ((($106)) + 1|0);
         $112 = $111;
         $113 = (($114) - ($$in$i$i$us))|0;
         $115 = (0 - ($113))|0;
         $116 = (($106) + ($115)|0);
         $117 = $116;
         _memcpy(($116|0),($93|0),($113|0))|0;
         HEAP32[$75>>2] = $117;
         HEAP32[$80>>2] = $112;
         HEAP32[$$pre$phi$i$usZ2D>>2] = $110;
         $118 = ($$in$i$i$us|0)==(0);
         if (!($118)) {
          __ZdlPv($93);
         }
        } else {
         HEAP8[$81>>0] = $79;
         $86 = HEAP32[$80>>2]|0;
         $87 = ((($86)) + 1|0);
         HEAP32[$80>>2] = $87;
        }
        $119 = $77 >>> 1;
        $120 = (($col2$121$us) + 1)|0;
        $121 = ($119|0)!=(0);
        $122 = ($120|0)<($12|0);
        $or$cond2$us = $122 & $121;
        if ($or$cond2$us) {
         $77 = $119;$col2$121$us = $120;
        } else {
         $col2$1$lcssa$us = $120;
         break;
        }
       }
      } else {
       $col2$1$lcssa$us = $col2$022$us;
      }
      $124 = ($col2$1$lcssa$us|0)<($12|0);
      if ($124) {
       $col2$022$us = $col2$1$lcssa$us;
      } else {
       break;
      }
     }
     $125 = (($row1$024$us) + 1)|0;
     $126 = ($125|0)<($7|0);
     if ($126) {
      $row1$024$us = $125;
     } else {
      label = 42;
      break;
     }
    }
    if ((label|0) == 41) {
     $128 = (___cxa_allocate_exception(4)|0);
     HEAP32[$128>>2] = 872;
     ___cxa_throw(($128|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 42) {
     return;
    }
   } else {
    if (!($13)) {
     return;
    }
    $14 = ($12|0)>(0);
    $15 = ((($this)) + 16|0);
    if ($14) {
     $row$032$us = 0;
    } else {
     return;
    }
    L42: while(1) {
     $col$030$us = 0;
     while(1) {
      $16 = (_fgetc($f)|0);
      $17 = ($16|0)==(-1);
      if ($17) {
       label = 40;
       break L42;
      }
      $66 = ($col$030$us|0)<($12|0);
      if ($66) {
       $21 = 128;$col$127$us = $col$030$us;
       while(1) {
        $18 = HEAP32[$15>>2]|0;
        $19 = (($18) + (($row$032$us*12)|0)|0);
        $20 = $21 & $16;
        $not$$us = ($20|0)==(0);
        $22 = $not$$us&1;
        $23 = (((($18) + (($row$032$us*12)|0)|0)) + 4|0);
        $24 = HEAP32[$23>>2]|0;
        $25 = (((($18) + (($row$032$us*12)|0)|0)) + 8|0);
        $26 = HEAP32[$25>>2]|0;
        $27 = ($24|0)==($26|0);
        $28 = $26;
        if ($27) {
         $31 = $24;
         $32 = HEAP32[$19>>2]|0;
         $33 = (($31) - ($32))|0;
         $34 = (($33) + 1)|0;
         $35 = ($34|0)<(0);
         if ($35) {
          __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($19);
          $$pre$i$i5$us = HEAP32[$19>>2]|0;
          $$pre$i7$us = HEAP32[$25>>2]|0;
          $$in$i$i9$us = $$pre$i$i5$us;$$pre$phi$i8$usZ2D = $25;$38 = $$pre$i7$us;
         } else {
          $$in$i$i9$us = $32;$$pre$phi$i8$usZ2D = $25;$38 = $28;
         }
         $36 = $$in$i$i9$us;
         $37 = (($38) - ($$in$i$i9$us))|0;
         $39 = ($37>>>0)<(1073741823);
         if ($39) {
          $42 = $37 << 1;
          $43 = ($42>>>0)<($34>>>0);
          $44 = $43 ? $34 : $42;
          $45 = HEAP32[$23>>2]|0;
          $46 = (($45) - ($$in$i$i9$us))|0;
          $47 = ($44|0)==(0);
          if ($47) {
           $$0$i2$i$i13$us = 0;$50 = 0;$51 = $46;$57 = $45;
          } else {
           $$0$i1$i$i12$us = $44;$129 = $45;$130 = $46;
           label = 13;
          }
         } else {
          $40 = HEAP32[$23>>2]|0;
          $41 = (($40) - ($$in$i$i9$us))|0;
          $$0$i1$i$i12$us = 2147483647;$129 = $40;$130 = $41;
          label = 13;
         }
         if ((label|0) == 13) {
          label = 0;
          $48 = (__Znwj($$0$i1$i$i12$us)|0);
          $$0$i2$i$i13$us = $$0$i1$i$i12$us;$50 = $48;$51 = $130;$57 = $129;
         }
         $49 = (($50) + ($51)|0);
         $52 = (($50) + ($$0$i2$i$i13$us)|0);
         $53 = $52;
         HEAP8[$49>>0] = $22;
         $54 = ((($49)) + 1|0);
         $55 = $54;
         $56 = (($57) - ($$in$i$i9$us))|0;
         $58 = (0 - ($56))|0;
         $59 = (($49) + ($58)|0);
         $60 = $59;
         _memcpy(($59|0),($36|0),($56|0))|0;
         HEAP32[$19>>2] = $60;
         HEAP32[$23>>2] = $55;
         HEAP32[$$pre$phi$i8$usZ2D>>2] = $53;
         $61 = ($$in$i$i9$us|0)==(0);
         if (!($61)) {
          __ZdlPv($36);
         }
        } else {
         HEAP8[$24>>0] = $22;
         $29 = HEAP32[$23>>2]|0;
         $30 = ((($29)) + 1|0);
         HEAP32[$23>>2] = $30;
        }
        $62 = $21 >>> 1;
        $63 = (($col$127$us) + 1)|0;
        $64 = ($62|0)!=(0);
        $65 = ($63|0)<($12|0);
        $or$cond$us = $65 & $64;
        if ($or$cond$us) {
         $21 = $62;$col$127$us = $63;
        } else {
         $col$1$lcssa$us = $63;
         break;
        }
       }
      } else {
       $col$1$lcssa$us = $col$030$us;
      }
      $67 = ($col$1$lcssa$us|0)<($12|0);
      if ($67) {
       $col$030$us = $col$1$lcssa$us;
      } else {
       break;
      }
     }
     $68 = (($row$032$us) + 1)|0;
     $69 = ($68|0)<($7|0);
     if ($69) {
      $row$032$us = $68;
     } else {
      label = 42;
      break;
     }
    }
    if ((label|0) == 40) {
     $127 = (___cxa_allocate_exception(4)|0);
     HEAP32[$127>>2] = 872;
     ___cxa_throw(($127|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 42) {
     return;
    }
   }
  }
  function __ZN10Page_image7read_p2EP8_IO_FILEb($this,$f,$invert) {
   $this = $this|0;
   $f = $f|0;
   $invert = $invert|0;
   var $$ = 0, $$$us = 0, $$0$i1$i$i = 0, $$0$i1$i$i$us = 0, $$0$i2$i$i = 0, $$0$i2$i$i$us = 0, $$in$i$i = 0, $$in$i$i$us = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i$i$us = 0, $$pre$i$us = 0, $$pre$phi$i$usZ2D = 0, $$pre$phi$iZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0;
   var $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0;
   var $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
   var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
   var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
   var $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0;
   var $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0;
   var $98 = 0, $99 = 0, $col$02 = 0, $col$02$us = 0, $row$03 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
   $1 = ($0|0)==(0);
   if ($1) {
    $2 = (___cxa_allocate_exception(4)|0);
    HEAP32[$2>>2] = 1035;
    ___cxa_throw(($2|0),(8|0),(0|0));
    // unreachable;
   }
   $3 = ($0|0)>(255);
   $4 = $3 ? 255 : $0;
   $5 = $4&255;
   $6 = ((($this)) + 28|0);
   HEAP8[$6>>0] = $5;
   $7 = $4 >>> 1;
   $8 = $7 & 127;
   $9 = $8&255;
   $10 = ((($this)) + 29|0);
   HEAP8[$10>>0] = $9;
   $11 = ((($this)) + 12|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = ((($this)) + 4|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = (($12) + 1)|0;
   $16 = (($15) - ($14))|0;
   $17 = ((($this)) + 8|0);
   $18 = HEAP32[$17>>2]|0;
   $19 = HEAP32[$this>>2]|0;
   $20 = (($18) + 1)|0;
   $21 = (($20) - ($19))|0;
   $22 = ($16|0)>(0);
   if (!($22)) {
    return;
   }
   $23 = ($21|0)>(0);
   $24 = ((($this)) + 16|0);
   $row$03 = 0;
   L7: while(1) {
    if ($23) {
     if ($3) {
      $col$02$us = 0;
      while(1) {
       $25 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
       $26 = ($0|0)<($25|0);
       if ($26) {
        label = 23;
        break L7;
       }
       $27 = (($0) - ($25))|0;
       $$$us = $invert ? $27 : $25;
       $28 = ($$$us*255)|0;
       $29 = (($28|0) / ($0|0))&-1;
       $30 = HEAP32[$24>>2]|0;
       $31 = (($30) + (($row$03*12)|0)|0);
       $32 = $29&255;
       $33 = (((($30) + (($row$03*12)|0)|0)) + 4|0);
       $34 = HEAP32[$33>>2]|0;
       $35 = (((($30) + (($row$03*12)|0)|0)) + 8|0);
       $36 = HEAP32[$35>>2]|0;
       $37 = ($34|0)==($36|0);
       $38 = $36;
       if ($37) {
        $41 = $34;
        $42 = HEAP32[$31>>2]|0;
        $43 = (($41) - ($42))|0;
        $44 = (($43) + 1)|0;
        $45 = ($44|0)<(0);
        if ($45) {
         __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($31);
         $$pre$i$i$us = HEAP32[$31>>2]|0;
         $$pre$i$us = HEAP32[$35>>2]|0;
         $$in$i$i$us = $$pre$i$i$us;$$pre$phi$i$usZ2D = $35;$48 = $$pre$i$us;
        } else {
         $$in$i$i$us = $42;$$pre$phi$i$usZ2D = $35;$48 = $38;
        }
        $46 = $$in$i$i$us;
        $47 = (($48) - ($$in$i$i$us))|0;
        $49 = ($47>>>0)<(1073741823);
        if ($49) {
         $52 = $47 << 1;
         $53 = ($52>>>0)<($44>>>0);
         $54 = $53 ? $44 : $52;
         $55 = HEAP32[$33>>2]|0;
         $56 = (($55) - ($$in$i$i$us))|0;
         $57 = ($54|0)==(0);
         if ($57) {
          $$0$i2$i$i$us = 0;$60 = 0;$61 = $56;$67 = $55;
         } else {
          $$0$i1$i$i$us = $54;$124 = $55;$125 = $56;
          label = 16;
         }
        } else {
         $50 = HEAP32[$33>>2]|0;
         $51 = (($50) - ($$in$i$i$us))|0;
         $$0$i1$i$i$us = 2147483647;$124 = $50;$125 = $51;
         label = 16;
        }
        if ((label|0) == 16) {
         label = 0;
         $58 = (__Znwj($$0$i1$i$i$us)|0);
         $$0$i2$i$i$us = $$0$i1$i$i$us;$60 = $58;$61 = $125;$67 = $124;
        }
        $59 = (($60) + ($61)|0);
        $62 = (($60) + ($$0$i2$i$i$us)|0);
        $63 = $62;
        HEAP8[$59>>0] = $32;
        $64 = ((($59)) + 1|0);
        $65 = $64;
        $66 = (($67) - ($$in$i$i$us))|0;
        $68 = (0 - ($66))|0;
        $69 = (($59) + ($68)|0);
        $70 = $69;
        _memcpy(($69|0),($46|0),($66|0))|0;
        HEAP32[$31>>2] = $70;
        HEAP32[$33>>2] = $65;
        HEAP32[$$pre$phi$i$usZ2D>>2] = $63;
        $71 = ($$in$i$i$us|0)==(0);
        if (!($71)) {
         __ZdlPv($46);
        }
       } else {
        HEAP8[$34>>0] = $32;
        $39 = HEAP32[$33>>2]|0;
        $40 = ((($39)) + 1|0);
        HEAP32[$33>>2] = $40;
       }
       $72 = (($col$02$us) + 1)|0;
       $73 = ($72|0)<($21|0);
       if ($73) {
        $col$02$us = $72;
       } else {
        break;
       }
      }
     } else {
      $col$02 = 0;
      while(1) {
       $76 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
       $77 = ($0|0)<($76|0);
       if ($77) {
        label = 23;
        break L7;
       }
       $79 = (($0) - ($76))|0;
       $$ = $invert ? $79 : $76;
       $80 = HEAP32[$24>>2]|0;
       $81 = (($80) + (($row$03*12)|0)|0);
       $82 = $$&255;
       $83 = (((($80) + (($row$03*12)|0)|0)) + 4|0);
       $84 = HEAP32[$83>>2]|0;
       $85 = (((($80) + (($row$03*12)|0)|0)) + 8|0);
       $86 = HEAP32[$85>>2]|0;
       $87 = ($84|0)==($86|0);
       $88 = $86;
       if ($87) {
        $91 = $84;
        $92 = HEAP32[$81>>2]|0;
        $93 = (($91) - ($92))|0;
        $94 = (($93) + 1)|0;
        $95 = ($94|0)<(0);
        if ($95) {
         __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($81);
         $$pre$i$i = HEAP32[$81>>2]|0;
         $$pre$i = HEAP32[$85>>2]|0;
         $$in$i$i = $$pre$i$i;$$pre$phi$iZ2D = $85;$98 = $$pre$i;
        } else {
         $$in$i$i = $92;$$pre$phi$iZ2D = $85;$98 = $88;
        }
        $96 = $$in$i$i;
        $97 = (($98) - ($$in$i$i))|0;
        $99 = ($97>>>0)<(1073741823);
        if ($99) {
         $102 = $97 << 1;
         $103 = ($102>>>0)<($94>>>0);
         $104 = $103 ? $94 : $102;
         $105 = HEAP32[$83>>2]|0;
         $106 = (($105) - ($$in$i$i))|0;
         $107 = ($104|0)==(0);
         if ($107) {
          $$0$i2$i$i = 0;$110 = 0;$111 = $106;$117 = $105;
         } else {
          $$0$i1$i$i = $104;$126 = $105;$127 = $106;
          label = 32;
         }
        } else {
         $100 = HEAP32[$83>>2]|0;
         $101 = (($100) - ($$in$i$i))|0;
         $$0$i1$i$i = 2147483647;$126 = $100;$127 = $101;
         label = 32;
        }
        if ((label|0) == 32) {
         label = 0;
         $108 = (__Znwj($$0$i1$i$i)|0);
         $$0$i2$i$i = $$0$i1$i$i;$110 = $108;$111 = $127;$117 = $126;
        }
        $109 = (($110) + ($111)|0);
        $112 = (($110) + ($$0$i2$i$i)|0);
        $113 = $112;
        HEAP8[$109>>0] = $82;
        $114 = ((($109)) + 1|0);
        $115 = $114;
        $116 = (($117) - ($$in$i$i))|0;
        $118 = (0 - ($116))|0;
        $119 = (($109) + ($118)|0);
        $120 = $119;
        _memcpy(($119|0),($96|0),($116|0))|0;
        HEAP32[$81>>2] = $120;
        HEAP32[$83>>2] = $115;
        HEAP32[$$pre$phi$iZ2D>>2] = $113;
        $121 = ($$in$i$i|0)==(0);
        if (!($121)) {
         __ZdlPv($96);
        }
       } else {
        HEAP8[$84>>0] = $82;
        $89 = HEAP32[$83>>2]|0;
        $90 = ((($89)) + 1|0);
        HEAP32[$83>>2] = $90;
       }
       $122 = (($col$02) + 1)|0;
       $123 = ($122|0)<($21|0);
       if ($123) {
        $col$02 = $122;
       } else {
        break;
       }
      }
     }
    }
    $74 = (($row$03) + 1)|0;
    $75 = ($74|0)<($16|0);
    if ($75) {
     $row$03 = $74;
    } else {
     label = 20;
     break;
    }
   }
   if ((label|0) == 20) {
    return;
   }
   else if ((label|0) == 23) {
    $78 = (___cxa_allocate_exception(4)|0);
    HEAP32[$78>>2] = 1060;
    ___cxa_throw(($78|0),(8|0),(0|0));
    // unreachable;
   }
  }
  function __ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f) {
   $f = $f|0;
   var $$lcssa = 0, $$lcssa19 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
   var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $ch$0 = 0, $ch$0$i = 0, $ch$0$i$lcssa = 0, $ch$0$i5 = 0, $i$0 = 0;
   var $isdigit = 0, $isdigit2 = 0, $isdigittmp = 0, $isdigittmp1 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   L1: while(1) {
    $0 = (_fgetc($f)|0);
    $1 = ($0|0)==(-1);
    if ($1) {
     label = 3;
     break;
    }
    $3 = $0&255;
    $4 = ($3<<24>>24)==(35);
    if ($4) {
     while(1) {
      $5 = (_fgetc($f)|0);
      $6 = ($5|0)==(-1);
      if ($6) {
       label = 6;
       break L1;
      }
      $8 = $5&255;
      $9 = ($8<<24>>24)==(10);
      if ($9) {
       $ch$0$i = 10;
       break;
      }
     }
    } else {
     $ch$0$i = $3;
    }
    $10 = $ch$0$i&255;
    $11 = (_isspace($10)|0);
    $12 = ($11|0)==(0);
    if ($12) {
     $$lcssa = $10;$ch$0$i$lcssa = $ch$0$i;
     label = 9;
     break;
    }
   }
   if ((label|0) == 3) {
    $2 = (___cxa_allocate_exception(4)|0);
    HEAP32[$2>>2] = 872;
    ___cxa_throw(($2|0),(8|0),(0|0));
    // unreachable;
   }
   else if ((label|0) == 6) {
    $7 = (___cxa_allocate_exception(4)|0);
    HEAP32[$7>>2] = 872;
    ___cxa_throw(($7|0),(8|0),(0|0));
    // unreachable;
   }
   else if ((label|0) == 9) {
    $isdigittmp = (($$lcssa) + -48)|0;
    $isdigit = ($isdigittmp>>>0)<(10);
    if ($isdigit) {
     $ch$0 = $ch$0$i$lcssa;$i$0 = 0;
    } else {
     $13 = (___cxa_allocate_exception(4)|0);
     HEAP32[$13>>2] = 962;
     ___cxa_throw(($13|0),(8|0),(0|0));
     // unreachable;
    }
    L14: while(1) {
     $14 = $ch$0&255;
     $15 = (-2147483601 - ($14))|0;
     $16 = (($15|0) / 10)&-1;
     $17 = ($16|0)<($i$0|0);
     if ($17) {
      label = 12;
      break;
     }
     $19 = (($14) + -48)|0;
     $20 = ($i$0*10)|0;
     $21 = (($19) + ($20))|0;
     $22 = (_fgetc($f)|0);
     $23 = ($22|0)==(-1);
     if ($23) {
      label = 14;
      break;
     }
     $25 = $22&255;
     $26 = ($25<<24>>24)==(35);
     if ($26) {
      while(1) {
       $27 = (_fgetc($f)|0);
       $28 = ($27|0)==(-1);
       if ($28) {
        label = 17;
        break L14;
       }
       $30 = $27&255;
       $31 = ($30<<24>>24)==(10);
       if ($31) {
        $ch$0$i5 = 10;
        break;
       }
      }
     } else {
      $ch$0$i5 = $25;
     }
     $32 = $ch$0$i5&255;
     $isdigittmp1 = (($32) + -48)|0;
     $isdigit2 = ($isdigittmp1>>>0)<(10);
     if ($isdigit2) {
      $ch$0 = $ch$0$i5;$i$0 = $21;
     } else {
      $$lcssa19 = $21;
      label = 20;
      break;
     }
    }
    if ((label|0) == 12) {
     $18 = (___cxa_allocate_exception(4)|0);
     HEAP32[$18>>2] = 1007;
     ___cxa_throw(($18|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 14) {
     $24 = (___cxa_allocate_exception(4)|0);
     HEAP32[$24>>2] = 872;
     ___cxa_throw(($24|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 17) {
     $29 = (___cxa_allocate_exception(4)|0);
     HEAP32[$29>>2] = 872;
     ___cxa_throw(($29|0),(8|0),(0|0));
     // unreachable;
    }
    else if ((label|0) == 20) {
     return ($$lcssa19|0);
    }
   }
   return (0)|0;
  }
  function __ZN10Page_image7read_p5EP8_IO_FILEb($this,$f,$invert) {
   $this = $this|0;
   $f = $f|0;
   $invert = $invert|0;
   var $$0$i1$i$i = 0, $$0$i1$i$i$us = 0, $$0$i2$i$i = 0, $$0$i2$i$i$us = 0, $$in$i$i = 0, $$in$i$i$us = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i$i$us = 0, $$pre$i$us = 0, $$pre$phi$i$usZ2D = 0, $$pre$phi$iZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
   var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
   var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
   var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
   var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
   var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0;
   var $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0;
   var $96 = 0, $97 = 0, $98 = 0, $99 = 0, $col$02 = 0, $col$02$us = 0, $row$03 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
   $1 = ($0|0)==(0);
   if ($1) {
    $2 = (___cxa_allocate_exception(4)|0);
    HEAP32[$2>>2] = 1035;
    ___cxa_throw(($2|0),(8|0),(0|0));
    // unreachable;
   }
   $3 = ($0|0)>(255);
   if ($3) {
    $4 = (___cxa_allocate_exception(4)|0);
    HEAP32[$4>>2] = 1088;
    ___cxa_throw(($4|0),(8|0),(0|0));
    // unreachable;
   }
   $5 = $0&255;
   $6 = ((($this)) + 28|0);
   HEAP8[$6>>0] = $5;
   $7 = $0 >>> 1;
   $8 = $7 & 127;
   $9 = $8&255;
   $10 = ((($this)) + 29|0);
   HEAP8[$10>>0] = $9;
   $11 = ((($this)) + 12|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = ((($this)) + 4|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = (($12) + 1)|0;
   $16 = (($15) - ($14))|0;
   $17 = ((($this)) + 8|0);
   $18 = HEAP32[$17>>2]|0;
   $19 = HEAP32[$this>>2]|0;
   $20 = (($18) + 1)|0;
   $21 = (($20) - ($19))|0;
   $22 = ($16|0)>(0);
   if (!($22)) {
    return;
   }
   $23 = ($21|0)>(0);
   $24 = ((($this)) + 16|0);
   $row$03 = 0;
   L10: while(1) {
    if ($23) {
     if ($invert) {
      $col$02$us = 0;
      while(1) {
       $25 = (_fgetc($f)|0);
       $26 = ($25|0)==(-1);
       if ($26) {
        label = 26;
        break L10;
       }
       $27 = $25&255;
       $28 = HEAP8[$6>>0]|0;
       $29 = ($28&255)<($27&255);
       if ($29) {
        label = 28;
        break L10;
       }
       $30 = $28&255;
       $31 = (($30) - ($25))|0;
       $32 = $31&255;
       $33 = HEAP32[$24>>2]|0;
       $34 = (($33) + (($row$03*12)|0)|0);
       $35 = (((($33) + (($row$03*12)|0)|0)) + 4|0);
       $36 = HEAP32[$35>>2]|0;
       $37 = (((($33) + (($row$03*12)|0)|0)) + 8|0);
       $38 = HEAP32[$37>>2]|0;
       $39 = ($36|0)==($38|0);
       $40 = $38;
       if ($39) {
        $43 = $36;
        $44 = HEAP32[$34>>2]|0;
        $45 = (($43) - ($44))|0;
        $46 = (($45) + 1)|0;
        $47 = ($46|0)<(0);
        if ($47) {
         __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($34);
         $$pre$i$i$us = HEAP32[$34>>2]|0;
         $$pre$i$us = HEAP32[$37>>2]|0;
         $$in$i$i$us = $$pre$i$i$us;$$pre$phi$i$usZ2D = $37;$50 = $$pre$i$us;
        } else {
         $$in$i$i$us = $44;$$pre$phi$i$usZ2D = $37;$50 = $40;
        }
        $48 = $$in$i$i$us;
        $49 = (($50) - ($$in$i$i$us))|0;
        $51 = ($49>>>0)<(1073741823);
        if ($51) {
         $54 = $49 << 1;
         $55 = ($54>>>0)<($46>>>0);
         $56 = $55 ? $46 : $54;
         $57 = HEAP32[$35>>2]|0;
         $58 = (($57) - ($$in$i$i$us))|0;
         $59 = ($56|0)==(0);
         if ($59) {
          $$0$i2$i$i$us = 0;$62 = 0;$63 = $58;$69 = $57;
         } else {
          $$0$i1$i$i$us = $56;$128 = $57;$129 = $58;
          label = 19;
         }
        } else {
         $52 = HEAP32[$35>>2]|0;
         $53 = (($52) - ($$in$i$i$us))|0;
         $$0$i1$i$i$us = 2147483647;$128 = $52;$129 = $53;
         label = 19;
        }
        if ((label|0) == 19) {
         label = 0;
         $60 = (__Znwj($$0$i1$i$i$us)|0);
         $$0$i2$i$i$us = $$0$i1$i$i$us;$62 = $60;$63 = $129;$69 = $128;
        }
        $61 = (($62) + ($63)|0);
        $64 = (($62) + ($$0$i2$i$i$us)|0);
        $65 = $64;
        HEAP8[$61>>0] = $32;
        $66 = ((($61)) + 1|0);
        $67 = $66;
        $68 = (($69) - ($$in$i$i$us))|0;
        $70 = (0 - ($68))|0;
        $71 = (($61) + ($70)|0);
        $72 = $71;
        _memcpy(($71|0),($48|0),($68|0))|0;
        HEAP32[$34>>2] = $72;
        HEAP32[$35>>2] = $67;
        HEAP32[$$pre$phi$i$usZ2D>>2] = $65;
        $73 = ($$in$i$i$us|0)==(0);
        if (!($73)) {
         __ZdlPv($48);
        }
       } else {
        HEAP8[$36>>0] = $32;
        $41 = HEAP32[$35>>2]|0;
        $42 = ((($41)) + 1|0);
        HEAP32[$35>>2] = $42;
       }
       $74 = (($col$02$us) + 1)|0;
       $75 = ($74|0)<($21|0);
       if ($75) {
        $col$02$us = $74;
       } else {
        break;
       }
      }
     } else {
      $col$02 = 0;
      while(1) {
       $78 = (_fgetc($f)|0);
       $79 = ($78|0)==(-1);
       if ($79) {
        label = 26;
        break L10;
       }
       $81 = $78&255;
       $82 = HEAP8[$6>>0]|0;
       $83 = ($82&255)<($81&255);
       if ($83) {
        label = 28;
        break L10;
       }
       $85 = HEAP32[$24>>2]|0;
       $86 = (($85) + (($row$03*12)|0)|0);
       $87 = (((($85) + (($row$03*12)|0)|0)) + 4|0);
       $88 = HEAP32[$87>>2]|0;
       $89 = (((($85) + (($row$03*12)|0)|0)) + 8|0);
       $90 = HEAP32[$89>>2]|0;
       $91 = ($88|0)==($90|0);
       $92 = $90;
       if ($91) {
        $95 = $88;
        $96 = HEAP32[$86>>2]|0;
        $97 = (($95) - ($96))|0;
        $98 = (($97) + 1)|0;
        $99 = ($98|0)<(0);
        if ($99) {
         __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($86);
         $$pre$i$i = HEAP32[$86>>2]|0;
         $$pre$i = HEAP32[$89>>2]|0;
         $$in$i$i = $$pre$i$i;$$pre$phi$iZ2D = $89;$102 = $$pre$i;
        } else {
         $$in$i$i = $96;$$pre$phi$iZ2D = $89;$102 = $92;
        }
        $100 = $$in$i$i;
        $101 = (($102) - ($$in$i$i))|0;
        $103 = ($101>>>0)<(1073741823);
        if ($103) {
         $106 = $101 << 1;
         $107 = ($106>>>0)<($98>>>0);
         $108 = $107 ? $98 : $106;
         $109 = HEAP32[$87>>2]|0;
         $110 = (($109) - ($$in$i$i))|0;
         $111 = ($108|0)==(0);
         if ($111) {
          $$0$i2$i$i = 0;$114 = 0;$115 = $110;$121 = $109;
         } else {
          $$0$i1$i$i = $108;$130 = $109;$131 = $110;
          label = 37;
         }
        } else {
         $104 = HEAP32[$87>>2]|0;
         $105 = (($104) - ($$in$i$i))|0;
         $$0$i1$i$i = 2147483647;$130 = $104;$131 = $105;
         label = 37;
        }
        if ((label|0) == 37) {
         label = 0;
         $112 = (__Znwj($$0$i1$i$i)|0);
         $$0$i2$i$i = $$0$i1$i$i;$114 = $112;$115 = $131;$121 = $130;
        }
        $113 = (($114) + ($115)|0);
        $116 = (($114) + ($$0$i2$i$i)|0);
        $117 = $116;
        HEAP8[$113>>0] = $81;
        $118 = ((($113)) + 1|0);
        $119 = $118;
        $120 = (($121) - ($$in$i$i))|0;
        $122 = (0 - ($120))|0;
        $123 = (($113) + ($122)|0);
        $124 = $123;
        _memcpy(($123|0),($100|0),($120|0))|0;
        HEAP32[$86>>2] = $124;
        HEAP32[$87>>2] = $119;
        HEAP32[$$pre$phi$iZ2D>>2] = $117;
        $125 = ($$in$i$i|0)==(0);
        if (!($125)) {
         __ZdlPv($100);
        }
       } else {
        HEAP8[$88>>0] = $81;
        $93 = HEAP32[$87>>2]|0;
        $94 = ((($93)) + 1|0);
        HEAP32[$87>>2] = $94;
       }
       $126 = (($col$02) + 1)|0;
       $127 = ($126|0)<($21|0);
       if ($127) {
        $col$02 = $126;
       } else {
        break;
       }
      }
     }
    }
    $76 = (($row$03) + 1)|0;
    $77 = ($76|0)<($16|0);
    if ($77) {
     $row$03 = $76;
    } else {
     label = 23;
     break;
    }
   }
   if ((label|0) == 23) {
    return;
   }
   else if ((label|0) == 26) {
    $80 = (___cxa_allocate_exception(4)|0);
    HEAP32[$80>>2] = 872;
    ___cxa_throw(($80|0),(8|0),(0|0));
    // unreachable;
   }
   else if ((label|0) == 28) {
    $84 = (___cxa_allocate_exception(4)|0);
    HEAP32[$84>>2] = 1060;
    ___cxa_throw(($84|0),(8|0),(0|0));
    // unreachable;
   }
  }
  function __ZN10Page_image7read_p3EP8_IO_FILEb($this,$f,$invert) {
   $this = $this|0;
   $f = $f|0;
   $invert = $invert|0;
   var $$0$i1$i$i = 0, $$0$i1$i$i$us = 0, $$0$i2$i$i = 0, $$0$i2$i$i$us = 0, $$in$i$i = 0, $$in$i$i$us = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i$i$us = 0, $$pre$i$us = 0, $$pre$phi$i$usZ2D = 0, $$pre$phi$iZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
   var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
   var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0;
   var $141 = 0, $142 = 0, $143 = 0, $144 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
   var $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0;
   var $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0;
   var $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0;
   var $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $col$06 = 0, $col$06$us = 0, $or$cond = 0;
   var $or$cond$us = 0, $or$cond2 = 0, $or$cond2$us = 0, $row$07 = 0, $val$1 = 0, $val$1$us = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
   $1 = ($0|0)==(0);
   if ($1) {
    $2 = (___cxa_allocate_exception(4)|0);
    HEAP32[$2>>2] = 1119;
    ___cxa_throw(($2|0),(8|0),(0|0));
    // unreachable;
   }
   $3 = ($0|0)>(255);
   $4 = $3 ? 255 : $0;
   $5 = $4&255;
   $6 = ((($this)) + 28|0);
   HEAP8[$6>>0] = $5;
   $7 = $4 >>> 1;
   $8 = $7 & 127;
   $9 = $8&255;
   $10 = ((($this)) + 29|0);
   HEAP8[$10>>0] = $9;
   $11 = ((($this)) + 12|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = ((($this)) + 4|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = (($12) + 1)|0;
   $16 = (($15) - ($14))|0;
   $17 = ((($this)) + 8|0);
   $18 = HEAP32[$17>>2]|0;
   $19 = HEAP32[$this>>2]|0;
   $20 = (($18) + 1)|0;
   $21 = (($20) - ($19))|0;
   $22 = ($16|0)>(0);
   if (!($22)) {
    return;
   }
   $23 = ($21|0)>(0);
   $24 = ((($this)) + 16|0);
   $row$07 = 0;
   L7: while(1) {
    if ($23) {
     if ($invert) {
      $col$06$us = 0;
      while(1) {
       $25 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
       $26 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
       $27 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
       $28 = ($25|0)>($0|0);
       $29 = ($26|0)>($0|0);
       $or$cond$us = $28 | $29;
       $30 = ($27|0)>($0|0);
       $or$cond2$us = $or$cond$us | $30;
       if ($or$cond2$us) {
        label = 25;
        break L7;
       }
       $31 = ($26|0)<($27|0);
       $32 = $31 ? $27 : $26;
       $33 = ($25|0)<($32|0);
       $34 = $33 ? $32 : $25;
       $35 = (($0) - ($34))|0;
       if ($3) {
        $36 = ($35*255)|0;
        $37 = (($36|0) / ($0|0))&-1;
        $val$1$us = $37;
       } else {
        $val$1$us = $35;
       }
       $38 = HEAP32[$24>>2]|0;
       $39 = (($38) + (($row$07*12)|0)|0);
       $40 = $val$1$us&255;
       $41 = (((($38) + (($row$07*12)|0)|0)) + 4|0);
       $42 = HEAP32[$41>>2]|0;
       $43 = (((($38) + (($row$07*12)|0)|0)) + 8|0);
       $44 = HEAP32[$43>>2]|0;
       $45 = ($42|0)==($44|0);
       $46 = $44;
       if ($45) {
        $49 = $42;
        $50 = HEAP32[$39>>2]|0;
        $51 = (($49) - ($50))|0;
        $52 = (($51) + 1)|0;
        $53 = ($52|0)<(0);
        if ($53) {
         __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($39);
         $$pre$i$i$us = HEAP32[$39>>2]|0;
         $$pre$i$us = HEAP32[$43>>2]|0;
         $$in$i$i$us = $$pre$i$i$us;$$pre$phi$i$usZ2D = $43;$56 = $$pre$i$us;
        } else {
         $$in$i$i$us = $50;$$pre$phi$i$usZ2D = $43;$56 = $46;
        }
        $54 = $$in$i$i$us;
        $55 = (($56) - ($$in$i$i$us))|0;
        $57 = ($55>>>0)<(1073741823);
        if ($57) {
         $60 = $55 << 1;
         $61 = ($60>>>0)<($52>>>0);
         $62 = $61 ? $52 : $60;
         $63 = HEAP32[$41>>2]|0;
         $64 = (($63) - ($$in$i$i$us))|0;
         $65 = ($62|0)==(0);
         if ($65) {
          $$0$i2$i$i$us = 0;$68 = 0;$69 = $64;$75 = $63;
         } else {
          $$0$i1$i$i$us = $62;$141 = $63;$142 = $64;
          label = 18;
         }
        } else {
         $58 = HEAP32[$41>>2]|0;
         $59 = (($58) - ($$in$i$i$us))|0;
         $$0$i1$i$i$us = 2147483647;$141 = $58;$142 = $59;
         label = 18;
        }
        if ((label|0) == 18) {
         label = 0;
         $66 = (__Znwj($$0$i1$i$i$us)|0);
         $$0$i2$i$i$us = $$0$i1$i$i$us;$68 = $66;$69 = $142;$75 = $141;
        }
        $67 = (($68) + ($69)|0);
        $70 = (($68) + ($$0$i2$i$i$us)|0);
        $71 = $70;
        HEAP8[$67>>0] = $40;
        $72 = ((($67)) + 1|0);
        $73 = $72;
        $74 = (($75) - ($$in$i$i$us))|0;
        $76 = (0 - ($74))|0;
        $77 = (($67) + ($76)|0);
        $78 = $77;
        _memcpy(($77|0),($54|0),($74|0))|0;
        HEAP32[$39>>2] = $78;
        HEAP32[$41>>2] = $73;
        HEAP32[$$pre$phi$i$usZ2D>>2] = $71;
        $79 = ($$in$i$i$us|0)==(0);
        if (!($79)) {
         __ZdlPv($54);
        }
       } else {
        HEAP8[$42>>0] = $40;
        $47 = HEAP32[$41>>2]|0;
        $48 = ((($47)) + 1|0);
        HEAP32[$41>>2] = $48;
       }
       $80 = (($col$06$us) + 1)|0;
       $81 = ($80|0)<($21|0);
       if ($81) {
        $col$06$us = $80;
       } else {
        break;
       }
      }
     } else {
      $col$06 = 0;
      while(1) {
       $84 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
       $85 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
       $86 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
       $87 = ($84|0)>($0|0);
       $88 = ($85|0)>($0|0);
       $or$cond = $87 | $88;
       $89 = ($86|0)>($0|0);
       $or$cond2 = $or$cond | $89;
       if ($or$cond2) {
        label = 25;
        break L7;
       }
       $91 = ($86|0)<($85|0);
       $92 = $91 ? $86 : $85;
       $93 = ($92|0)<($84|0);
       $94 = $93 ? $92 : $84;
       if ($3) {
        $95 = ($94*255)|0;
        $96 = (($95|0) / ($0|0))&-1;
        $val$1 = $96;
       } else {
        $val$1 = $94;
       }
       $97 = HEAP32[$24>>2]|0;
       $98 = (($97) + (($row$07*12)|0)|0);
       $99 = $val$1&255;
       $100 = (((($97) + (($row$07*12)|0)|0)) + 4|0);
       $101 = HEAP32[$100>>2]|0;
       $102 = (((($97) + (($row$07*12)|0)|0)) + 8|0);
       $103 = HEAP32[$102>>2]|0;
       $104 = ($101|0)==($103|0);
       $105 = $103;
       if ($104) {
        $108 = $101;
        $109 = HEAP32[$98>>2]|0;
        $110 = (($108) - ($109))|0;
        $111 = (($110) + 1)|0;
        $112 = ($111|0)<(0);
        if ($112) {
         __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($98);
         $$pre$i$i = HEAP32[$98>>2]|0;
         $$pre$i = HEAP32[$102>>2]|0;
         $$in$i$i = $$pre$i$i;$$pre$phi$iZ2D = $102;$115 = $$pre$i;
        } else {
         $$in$i$i = $109;$$pre$phi$iZ2D = $102;$115 = $105;
        }
        $113 = $$in$i$i;
        $114 = (($115) - ($$in$i$i))|0;
        $116 = ($114>>>0)<(1073741823);
        if ($116) {
         $119 = $114 << 1;
         $120 = ($119>>>0)<($111>>>0);
         $121 = $120 ? $111 : $119;
         $122 = HEAP32[$100>>2]|0;
         $123 = (($122) - ($$in$i$i))|0;
         $124 = ($121|0)==(0);
         if ($124) {
          $$0$i2$i$i = 0;$127 = 0;$128 = $123;$134 = $122;
         } else {
          $$0$i1$i$i = $121;$143 = $122;$144 = $123;
          label = 36;
         }
        } else {
         $117 = HEAP32[$100>>2]|0;
         $118 = (($117) - ($$in$i$i))|0;
         $$0$i1$i$i = 2147483647;$143 = $117;$144 = $118;
         label = 36;
        }
        if ((label|0) == 36) {
         label = 0;
         $125 = (__Znwj($$0$i1$i$i)|0);
         $$0$i2$i$i = $$0$i1$i$i;$127 = $125;$128 = $144;$134 = $143;
        }
        $126 = (($127) + ($128)|0);
        $129 = (($127) + ($$0$i2$i$i)|0);
        $130 = $129;
        HEAP8[$126>>0] = $99;
        $131 = ((($126)) + 1|0);
        $132 = $131;
        $133 = (($134) - ($$in$i$i))|0;
        $135 = (0 - ($133))|0;
        $136 = (($126) + ($135)|0);
        $137 = $136;
        _memcpy(($136|0),($113|0),($133|0))|0;
        HEAP32[$98>>2] = $137;
        HEAP32[$100>>2] = $132;
        HEAP32[$$pre$phi$iZ2D>>2] = $130;
        $138 = ($$in$i$i|0)==(0);
        if (!($138)) {
         __ZdlPv($113);
        }
       } else {
        HEAP8[$101>>0] = $99;
        $106 = HEAP32[$100>>2]|0;
        $107 = ((($106)) + 1|0);
        HEAP32[$100>>2] = $107;
       }
       $139 = (($col$06) + 1)|0;
       $140 = ($139|0)<($21|0);
       if ($140) {
        $col$06 = $139;
       } else {
        break;
       }
      }
     }
    }
    $82 = (($row$07) + 1)|0;
    $83 = ($82|0)<($16|0);
    if ($83) {
     $row$07 = $82;
    } else {
     label = 22;
     break;
    }
   }
   if ((label|0) == 22) {
    return;
   }
   else if ((label|0) == 25) {
    $90 = (___cxa_allocate_exception(4)|0);
    HEAP32[$90>>2] = 1144;
    ___cxa_throw(($90|0),(8|0),(0|0));
    // unreachable;
   }
  }
  function __ZN10Page_image7read_p6EP8_IO_FILEb($this,$f,$invert) {
   $this = $this|0;
   $f = $f|0;
   $invert = $invert|0;
   var $$0$i1$i$i = 0, $$0$i1$i$i$us = 0, $$0$i2$i$i = 0, $$0$i2$i$i$us = 0, $$in$i$i = 0, $$in$i$i$us = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i$i$us = 0, $$pre$i$us = 0, $$pre$phi$i$usZ2D = 0, $$pre$phi$iZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
   var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
   var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0;
   var $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $16 = 0;
   var $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0;
   var $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0;
   var $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0;
   var $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0;
   var $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $col$08 = 0, $col$08$us = 0, $or$cond = 0, $or$cond$us = 0, $or$cond2 = 0, $or$cond2$us = 0, $row$09 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = (__ZN12_GLOBAL__N_110pnm_getintEP8_IO_FILE($f)|0);
   $1 = ($0|0)==(0);
   if ($1) {
    $2 = (___cxa_allocate_exception(4)|0);
    HEAP32[$2>>2] = 1119;
    ___cxa_throw(($2|0),(8|0),(0|0));
    // unreachable;
   }
   $3 = ($0|0)>(255);
   if ($3) {
    $4 = (___cxa_allocate_exception(4)|0);
    HEAP32[$4>>2] = 1172;
    ___cxa_throw(($4|0),(8|0),(0|0));
    // unreachable;
   }
   $5 = $0&255;
   $6 = ((($this)) + 28|0);
   HEAP8[$6>>0] = $5;
   $7 = $0 >>> 1;
   $8 = $7 & 127;
   $9 = $8&255;
   $10 = ((($this)) + 29|0);
   HEAP8[$10>>0] = $9;
   $11 = ((($this)) + 12|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = ((($this)) + 4|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = (($12) + 1)|0;
   $16 = (($15) - ($14))|0;
   $17 = ((($this)) + 8|0);
   $18 = HEAP32[$17>>2]|0;
   $19 = HEAP32[$this>>2]|0;
   $20 = (($18) + 1)|0;
   $21 = (($20) - ($19))|0;
   $22 = ($16|0)>(0);
   if (!($22)) {
    return;
   }
   $23 = ($21|0)>(0);
   $24 = ((($this)) + 16|0);
   $row$09 = 0;
   L10: while(1) {
    if ($23) {
     if ($invert) {
      $col$08$us = 0;
      while(1) {
       $25 = (_fgetc($f)|0);
       $26 = ($25|0)==(-1);
       if ($26) {
        label = 28;
        break L10;
       }
       $27 = $25&255;
       $28 = (_fgetc($f)|0);
       $29 = ($28|0)==(-1);
       if ($29) {
        label = 30;
        break L10;
       }
       $30 = $28&255;
       $31 = (_fgetc($f)|0);
       $32 = ($31|0)==(-1);
       if ($32) {
        label = 32;
        break L10;
       }
       $33 = $31&255;
       $34 = HEAP8[$6>>0]|0;
       $35 = ($27&255)>($34&255);
       $36 = ($30&255)>($34&255);
       $or$cond$us = $35 | $36;
       $37 = ($33&255)>($34&255);
       $or$cond2$us = $37 | $or$cond$us;
       if ($or$cond2$us) {
        label = 34;
        break L10;
       }
       $38 = $34&255;
       $39 = ($30&255)<($33&255);
       $40 = $39 ? $33 : $30;
       $41 = ($27&255)<($40&255);
       $42 = $41 ? $40 : $27;
       $43 = $42&255;
       $44 = (($38) - ($43))|0;
       $45 = $44&255;
       $46 = HEAP32[$24>>2]|0;
       $47 = (($46) + (($row$09*12)|0)|0);
       $48 = (((($46) + (($row$09*12)|0)|0)) + 4|0);
       $49 = HEAP32[$48>>2]|0;
       $50 = (((($46) + (($row$09*12)|0)|0)) + 8|0);
       $51 = HEAP32[$50>>2]|0;
       $52 = ($49|0)==($51|0);
       $53 = $51;
       if ($52) {
        $56 = $49;
        $57 = HEAP32[$47>>2]|0;
        $58 = (($56) - ($57))|0;
        $59 = (($58) + 1)|0;
        $60 = ($59|0)<(0);
        if ($60) {
         __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($47);
         $$pre$i$i$us = HEAP32[$47>>2]|0;
         $$pre$i$us = HEAP32[$50>>2]|0;
         $$in$i$i$us = $$pre$i$i$us;$$pre$phi$i$usZ2D = $50;$63 = $$pre$i$us;
        } else {
         $$in$i$i$us = $57;$$pre$phi$i$usZ2D = $50;$63 = $53;
        }
        $61 = $$in$i$i$us;
        $62 = (($63) - ($$in$i$i$us))|0;
        $64 = ($62>>>0)<(1073741823);
        if ($64) {
         $67 = $62 << 1;
         $68 = ($67>>>0)<($59>>>0);
         $69 = $68 ? $59 : $67;
         $70 = HEAP32[$48>>2]|0;
         $71 = (($70) - ($$in$i$i$us))|0;
         $72 = ($69|0)==(0);
         if ($72) {
          $$0$i2$i$i$us = 0;$75 = 0;$76 = $71;$82 = $70;
         } else {
          $$0$i1$i$i$us = $69;$155 = $70;$156 = $71;
          label = 21;
         }
        } else {
         $65 = HEAP32[$48>>2]|0;
         $66 = (($65) - ($$in$i$i$us))|0;
         $$0$i1$i$i$us = 2147483647;$155 = $65;$156 = $66;
         label = 21;
        }
        if ((label|0) == 21) {
         label = 0;
         $73 = (__Znwj($$0$i1$i$i$us)|0);
         $$0$i2$i$i$us = $$0$i1$i$i$us;$75 = $73;$76 = $156;$82 = $155;
        }
        $74 = (($75) + ($76)|0);
        $77 = (($75) + ($$0$i2$i$i$us)|0);
        $78 = $77;
        HEAP8[$74>>0] = $45;
        $79 = ((($74)) + 1|0);
        $80 = $79;
        $81 = (($82) - ($$in$i$i$us))|0;
        $83 = (0 - ($81))|0;
        $84 = (($74) + ($83)|0);
        $85 = $84;
        _memcpy(($84|0),($61|0),($81|0))|0;
        HEAP32[$47>>2] = $85;
        HEAP32[$48>>2] = $80;
        HEAP32[$$pre$phi$i$usZ2D>>2] = $78;
        $86 = ($$in$i$i$us|0)==(0);
        if (!($86)) {
         __ZdlPv($61);
        }
       } else {
        HEAP8[$49>>0] = $45;
        $54 = HEAP32[$48>>2]|0;
        $55 = ((($54)) + 1|0);
        HEAP32[$48>>2] = $55;
       }
       $87 = (($col$08$us) + 1)|0;
       $88 = ($87|0)<($21|0);
       if ($88) {
        $col$08$us = $87;
       } else {
        break;
       }
      }
     } else {
      $col$08 = 0;
      while(1) {
       $91 = (_fgetc($f)|0);
       $92 = ($91|0)==(-1);
       if ($92) {
        label = 28;
        break L10;
       }
       $94 = $91&255;
       $95 = (_fgetc($f)|0);
       $96 = ($95|0)==(-1);
       if ($96) {
        label = 30;
        break L10;
       }
       $98 = $95&255;
       $99 = (_fgetc($f)|0);
       $100 = ($99|0)==(-1);
       if ($100) {
        label = 32;
        break L10;
       }
       $102 = $99&255;
       $103 = HEAP8[$6>>0]|0;
       $104 = ($94&255)>($103&255);
       $105 = ($98&255)>($103&255);
       $or$cond = $104 | $105;
       $106 = ($102&255)>($103&255);
       $or$cond2 = $106 | $or$cond;
       if ($or$cond2) {
        label = 34;
        break L10;
       }
       $108 = ($102&255)<($98&255);
       $109 = $108 ? $102 : $98;
       $110 = ($109&255)<($94&255);
       $111 = $110 ? $109 : $94;
       $112 = HEAP32[$24>>2]|0;
       $113 = (($112) + (($row$09*12)|0)|0);
       $114 = (((($112) + (($row$09*12)|0)|0)) + 4|0);
       $115 = HEAP32[$114>>2]|0;
       $116 = (((($112) + (($row$09*12)|0)|0)) + 8|0);
       $117 = HEAP32[$116>>2]|0;
       $118 = ($115|0)==($117|0);
       $119 = $117;
       if ($118) {
        $122 = $115;
        $123 = HEAP32[$113>>2]|0;
        $124 = (($122) - ($123))|0;
        $125 = (($124) + 1)|0;
        $126 = ($125|0)<(0);
        if ($126) {
         __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($113);
         $$pre$i$i = HEAP32[$113>>2]|0;
         $$pre$i = HEAP32[$116>>2]|0;
         $$in$i$i = $$pre$i$i;$$pre$phi$iZ2D = $116;$129 = $$pre$i;
        } else {
         $$in$i$i = $123;$$pre$phi$iZ2D = $116;$129 = $119;
        }
        $127 = $$in$i$i;
        $128 = (($129) - ($$in$i$i))|0;
        $130 = ($128>>>0)<(1073741823);
        if ($130) {
         $133 = $128 << 1;
         $134 = ($133>>>0)<($125>>>0);
         $135 = $134 ? $125 : $133;
         $136 = HEAP32[$114>>2]|0;
         $137 = (($136) - ($$in$i$i))|0;
         $138 = ($135|0)==(0);
         if ($138) {
          $$0$i2$i$i = 0;$141 = 0;$142 = $137;$148 = $136;
         } else {
          $$0$i1$i$i = $135;$157 = $136;$158 = $137;
          label = 43;
         }
        } else {
         $131 = HEAP32[$114>>2]|0;
         $132 = (($131) - ($$in$i$i))|0;
         $$0$i1$i$i = 2147483647;$157 = $131;$158 = $132;
         label = 43;
        }
        if ((label|0) == 43) {
         label = 0;
         $139 = (__Znwj($$0$i1$i$i)|0);
         $$0$i2$i$i = $$0$i1$i$i;$141 = $139;$142 = $158;$148 = $157;
        }
        $140 = (($141) + ($142)|0);
        $143 = (($141) + ($$0$i2$i$i)|0);
        $144 = $143;
        HEAP8[$140>>0] = $111;
        $145 = ((($140)) + 1|0);
        $146 = $145;
        $147 = (($148) - ($$in$i$i))|0;
        $149 = (0 - ($147))|0;
        $150 = (($140) + ($149)|0);
        $151 = $150;
        _memcpy(($150|0),($127|0),($147|0))|0;
        HEAP32[$113>>2] = $151;
        HEAP32[$114>>2] = $146;
        HEAP32[$$pre$phi$iZ2D>>2] = $144;
        $152 = ($$in$i$i|0)==(0);
        if (!($152)) {
         __ZdlPv($127);
        }
       } else {
        HEAP8[$115>>0] = $111;
        $120 = HEAP32[$114>>2]|0;
        $121 = ((($120)) + 1|0);
        HEAP32[$114>>2] = $121;
       }
       $153 = (($col$08) + 1)|0;
       $154 = ($153|0)<($21|0);
       if ($154) {
        $col$08 = $153;
       } else {
        break;
       }
      }
     }
    }
    $89 = (($row$09) + 1)|0;
    $90 = ($89|0)<($16|0);
    if ($90) {
     $row$09 = $89;
    } else {
     label = 25;
     break;
    }
   }
   if ((label|0) == 25) {
    return;
   }
   else if ((label|0) == 28) {
    $93 = (___cxa_allocate_exception(4)|0);
    HEAP32[$93>>2] = 872;
    ___cxa_throw(($93|0),(8|0),(0|0));
    // unreachable;
   }
   else if ((label|0) == 30) {
    $97 = (___cxa_allocate_exception(4)|0);
    HEAP32[$97>>2] = 872;
    ___cxa_throw(($97|0),(8|0),(0|0));
    // unreachable;
   }
   else if ((label|0) == 32) {
    $101 = (___cxa_allocate_exception(4)|0);
    HEAP32[$101>>2] = 872;
    ___cxa_throw(($101|0),(8|0),(0|0));
    // unreachable;
   }
   else if ((label|0) == 34) {
    $107 = (___cxa_allocate_exception(4)|0);
    HEAP32[$107>>2] = 1144;
    ___cxa_throw(($107|0),(8|0),(0|0));
    // unreachable;
   }
  }
  function __ZN10Page_imageC2EP8_IO_FILEb($this,$f,$invert) {
   $this = $this|0;
   $f = $f|0;
   $invert = $invert|0;
   var $$in = 0, $$in$lcssa = 0, $$in17 = 0, $$lcssa = 0, $$off = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i$i = 0, $$pre$i$i$i6 = 0, $$pre15 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0;
   var $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0;
   var $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0;
   var $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
   var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
   var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
   var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0;
   var $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0;
   var $97 = 0, $98 = 0, $99 = 0, $lpad$phi$index = 0, $lpad$phi$index6 = 0, $row$013 = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_ptr4 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
   $vararg_buffer1 = sp + 8|0;
   $vararg_buffer = sp;
   __ZN9RectangleC2Eiiii($this,0,0,0,0);
   $0 = ((($this)) + 16|0);
   HEAP32[$0>>2] = 0;
   $1 = ((($this)) + 20|0);
   HEAP32[$1>>2] = 0;
   $2 = ((($this)) + 24|0);
   HEAP32[$2>>2] = 0;
   $3 = (_fgetc($f)|0);
   $4 = ($3|0)==(-1);
   L1: do {
    if ($4) {
     $5 = (___cxa_allocate_exception(4)|0);
     HEAP32[$5>>2] = 872;
     __THREW__ = 0;
     invoke_viii(34,($5|0),(8|0),(0|0));
     $6 = __THREW__; __THREW__ = 0;
     label = 8;
    } else {
     $7 = $3&255;
     $8 = ($7<<24>>24)==(80);
     if ($8) {
      $9 = (_fgetc($f)|0);
      $10 = ($9|0)==(-1);
      if ($10) {
       $11 = (___cxa_allocate_exception(4)|0);
       HEAP32[$11>>2] = 872;
       __THREW__ = 0;
       invoke_viii(34,($11|0),(8|0),(0|0));
       $12 = __THREW__; __THREW__ = 0;
       label = 8;
       break;
      }
      $13 = $9&255;
      $$off = (($13) + -49)<<24>>24;
      $14 = ($$off&255)<(6);
      if ($14) {
       $35 = $9 & 255;
       __THREW__ = 0;
       $36 = (invoke_ii(35,($f|0))|0);
       $37 = __THREW__; __THREW__ = 0;
       $38 = $37&1;
       if ($38) {
        label = 8;
        break;
       }
       $39 = ($36|0)==(0);
       if ($39) {
        $40 = (___cxa_allocate_exception(4)|0);
        HEAP32[$40>>2] = 1250;
        __THREW__ = 0;
        invoke_viii(34,($40|0),(8|0),(0|0));
        $41 = __THREW__; __THREW__ = 0;
        label = 8;
        break;
       }
       __THREW__ = 0;
       invoke_vii(36,($this|0),($36|0));
       $42 = __THREW__; __THREW__ = 0;
       $43 = $42&1;
       if ($43) {
        label = 8;
        break;
       }
       __THREW__ = 0;
       $44 = (invoke_ii(35,($f|0))|0);
       $45 = __THREW__; __THREW__ = 0;
       $46 = $45&1;
       if ($46) {
        label = 8;
        break;
       }
       $47 = ($44|0)==(0);
       if ($47) {
        $48 = (___cxa_allocate_exception(4)|0);
        HEAP32[$48>>2] = 1274;
        __THREW__ = 0;
        invoke_viii(34,($48|0),(8|0),(0|0));
        $49 = __THREW__; __THREW__ = 0;
        label = 8;
        break;
       }
       __THREW__ = 0;
       invoke_vii(37,($this|0),($44|0));
       $50 = __THREW__; __THREW__ = 0;
       $51 = $50&1;
       if ($51) {
        label = 8;
        break;
       }
       $52 = ((($this)) + 8|0);
       $53 = HEAP32[$52>>2]|0;
       $54 = HEAP32[$this>>2]|0;
       $55 = (($53) + 1)|0;
       $56 = (($55) - ($54))|0;
       $57 = ($56|0)<(3);
       if (!($57)) {
        $58 = ((($this)) + 12|0);
        $59 = HEAP32[$58>>2]|0;
        $60 = ((($this)) + 4|0);
        $61 = HEAP32[$60>>2]|0;
        $62 = (($59) + 1)|0;
        $63 = (($62) - ($61))|0;
        $64 = ($63|0)<(3);
        if (!($64)) {
         $67 = (2147483647 / ($56|0))&-1;
         $68 = ($67|0)<($63|0);
         if ($68) {
          $69 = (___cxa_allocate_exception(4)|0);
          HEAP32[$69>>2] = 1337;
          __THREW__ = 0;
          invoke_viii(34,($69|0),(8|0),(0|0));
          $70 = __THREW__; __THREW__ = 0;
          label = 8;
          break;
         }
         $71 = HEAP32[$1>>2]|0;
         $72 = HEAP32[$0>>2]|0;
         $73 = (($71) - ($72))|0;
         $74 = (($73|0) / 12)&-1;
         $75 = ($63>>>0)>($74>>>0);
         $76 = $72;
         $77 = $71;
         if ($75) {
          $78 = (($63) - ($74))|0;
          __THREW__ = 0;
          invoke_vii(38,($0|0),($78|0));
          $79 = __THREW__; __THREW__ = 0;
          $80 = $79&1;
          if ($80) {
           label = 8;
           break;
          }
          $$pre = HEAP32[$1>>2]|0;
          $91 = $$pre;
         } else {
          $81 = ($63>>>0)<($74>>>0);
          if ($81) {
           $82 = (($76) + (($63*12)|0)|0);
           $83 = ($77|0)==($82|0);
           if ($83) {
            $91 = $71;
           } else {
            $85 = $77;
            while(1) {
             $84 = ((($85)) + -12|0);
             HEAP32[$1>>2] = $84;
             $86 = HEAP32[$84>>2]|0;
             $87 = ($86|0)==(0|0);
             if ($87) {
              $$in = $84;
             } else {
              $93 = ((($85)) + -8|0);
              $94 = HEAP32[$93>>2]|0;
              $95 = ($94|0)==($86|0);
              if (!($95)) {
               HEAP32[$93>>2] = $86;
              }
              __ZdlPv($86);
              $$pre$i$i$i6 = HEAP32[$1>>2]|0;
              $$in = $$pre$i$i$i6;
             }
             $88 = ($$in|0)==($82|0);
             if ($88) {
              $$in$lcssa = $$in;
              break;
             } else {
              $85 = $$in;
             }
            }
            $89 = $$in$lcssa;
            $91 = $89;
           }
          } else {
           $91 = $71;
          }
         }
         $90 = HEAP32[$0>>2]|0;
         $92 = ($91|0)==($90|0);
         L41: do {
          if (!($92)) {
           $$in17 = $90;$row$013 = 0;
           L42: while(1) {
            $96 = $$in17;
            $97 = (($96) + (($row$013*12)|0)|0);
            $98 = HEAP32[$52>>2]|0;
            $99 = HEAP32[$this>>2]|0;
            $100 = (($98) + 1)|0;
            $101 = (($100) - ($99))|0;
            $102 = (((($96) + (($row$013*12)|0)|0)) + 8|0);
            $103 = HEAP32[$102>>2]|0;
            $104 = HEAP32[$97>>2]|0;
            $105 = (($103) - ($104))|0;
            $106 = ($105>>>0)<($101>>>0);
            $107 = $104;
            do {
             if ($106) {
              $108 = (((($96) + (($row$013*12)|0)|0)) + 4|0);
              $109 = HEAP32[$108>>2]|0;
              $110 = (($109) - ($104))|0;
              $111 = ($100|0)==($99|0);
              if ($111) {
               $116 = 0;
              } else {
               __THREW__ = 0;
               $112 = (invoke_ii(29,($101|0))|0);
               $113 = __THREW__; __THREW__ = 0;
               $114 = $113&1;
               if ($114) {
                $$lcssa = $96;
                break L42;
               } else {
                $116 = $112;
               }
              }
              $115 = (($116) + ($110)|0);
              $117 = $115;
              $118 = (($116) + ($101)|0);
              $119 = $118;
              $120 = (0 - ($110))|0;
              $121 = (($115) + ($120)|0);
              $122 = $121;
              _memcpy(($121|0),($107|0),($110|0))|0;
              HEAP32[$97>>2] = $122;
              HEAP32[$108>>2] = $117;
              HEAP32[$102>>2] = $119;
              $123 = ($104|0)==(0);
              if ($123) {
               break;
              }
              __ZdlPv($107);
             }
            } while(0);
            $124 = (($row$013) + 1)|0;
            $125 = HEAP32[$1>>2]|0;
            $126 = HEAP32[$0>>2]|0;
            $127 = (($125) - ($126))|0;
            $128 = (($127|0) / 12)&-1;
            $129 = ($124>>>0)<($128>>>0);
            if ($129) {
             $$in17 = $126;$row$013 = $124;
            } else {
             break L41;
            }
           }
           $15 = ___cxa_find_matching_catch_2()|0;
           $16 = tempRet0;
           $19 = $$lcssa;$lpad$phi$index = $15;$lpad$phi$index6 = $16;
           break L1;
          }
         } while(0);
         switch ($35|0) {
         case 49:  {
          __THREW__ = 0;
          invoke_viii(39,($this|0),($f|0),($invert|0));
          $130 = __THREW__; __THREW__ = 0;
          $131 = $130&1;
          if ($131) {
           label = 8;
           break L1;
          }
          break;
         }
         case 52:  {
          __THREW__ = 0;
          invoke_viii(40,($this|0),($f|0),($invert|0));
          $132 = __THREW__; __THREW__ = 0;
          $133 = $132&1;
          if ($133) {
           label = 8;
           break L1;
          }
          break;
         }
         case 50:  {
          __THREW__ = 0;
          invoke_viii(41,($this|0),($f|0),($invert|0));
          $134 = __THREW__; __THREW__ = 0;
          $135 = $134&1;
          if ($135) {
           label = 8;
           break L1;
          }
          break;
         }
         case 53:  {
          __THREW__ = 0;
          invoke_viii(42,($this|0),($f|0),($invert|0));
          $136 = __THREW__; __THREW__ = 0;
          $137 = $136&1;
          if ($137) {
           label = 8;
           break L1;
          }
          break;
         }
         case 51:  {
          __THREW__ = 0;
          invoke_viii(43,($this|0),($f|0),($invert|0));
          $138 = __THREW__; __THREW__ = 0;
          $139 = $138&1;
          if ($139) {
           label = 8;
           break L1;
          }
          break;
         }
         case 54:  {
          __THREW__ = 0;
          invoke_viii(44,($this|0),($f|0),($invert|0));
          $140 = __THREW__; __THREW__ = 0;
          $141 = $140&1;
          if ($141) {
           label = 8;
           break L1;
          }
          break;
         }
         default: {
         }
         }
         $142 = HEAP32[1700]|0;
         $143 = ($142|0)>(0);
         if (!($143)) {
          STACKTOP = sp;return;
         }
         $144 = HEAP32[90]|0;
         HEAP32[$vararg_buffer>>2] = $35;
         (_fprintf($144,1373,$vararg_buffer)|0);
         $145 = HEAP32[$52>>2]|0;
         $146 = HEAP32[$this>>2]|0;
         $147 = (($145) + 1)|0;
         $148 = (($147) - ($146))|0;
         $149 = HEAP32[$58>>2]|0;
         $150 = HEAP32[$60>>2]|0;
         $151 = (($149) + 1)|0;
         $152 = (($151) - ($150))|0;
         HEAP32[$vararg_buffer1>>2] = $148;
         $vararg_ptr4 = ((($vararg_buffer1)) + 4|0);
         HEAP32[$vararg_ptr4>>2] = $152;
         (_fprintf($144,1391,$vararg_buffer1)|0);
         STACKTOP = sp;return;
        }
       }
       $65 = (___cxa_allocate_exception(4)|0);
       HEAP32[$65>>2] = 1299;
       __THREW__ = 0;
       invoke_viii(34,($65|0),(8|0),(0|0));
       $66 = __THREW__; __THREW__ = 0;
       label = 8;
       break;
      }
     }
     $33 = (___cxa_allocate_exception(4)|0);
     HEAP32[$33>>2] = 1203;
     __THREW__ = 0;
     invoke_viii(34,($33|0),(8|0),(0|0));
     $34 = __THREW__; __THREW__ = 0;
     label = 8;
    }
   } while(0);
   if ((label|0) == 8) {
    $17 = ___cxa_find_matching_catch_2()|0;
    $18 = tempRet0;
    $$pre15 = HEAP32[$0>>2]|0;
    $19 = $$pre15;$lpad$phi$index = $17;$lpad$phi$index6 = $18;
   }
   $20 = ($19|0)==(0|0);
   if ($20) {
    ___resumeException($lpad$phi$index|0);
    // unreachable;
   }
   $21 = HEAP32[$1>>2]|0;
   $22 = ($21|0)==($19|0);
   if ($22) {
    $32 = $19;
   } else {
    $24 = $21;
    while(1) {
     $23 = ((($24)) + -12|0);
     HEAP32[$1>>2] = $23;
     $25 = HEAP32[$23>>2]|0;
     $26 = ($25|0)==(0|0);
     if ($26) {
      $27 = $23;
     } else {
      $29 = ((($24)) + -8|0);
      $30 = HEAP32[$29>>2]|0;
      $31 = ($30|0)==($25|0);
      if (!($31)) {
       HEAP32[$29>>2] = $25;
      }
      __ZdlPv($25);
      $$pre$i$i$i = HEAP32[$1>>2]|0;
      $27 = $$pre$i$i$i;
     }
     $28 = ($27|0)==($19|0);
     if ($28) {
      break;
     } else {
      $24 = $27;
     }
    }
    $$pre$i = HEAP32[$0>>2]|0;
    $32 = $$pre$i;
   }
   __ZdlPv($32);
   ___resumeException($lpad$phi$index|0);
   // unreachable;
  }
  function __ZNSt3__16vectorINS0_IhNS_9allocatorIhEEEENS1_IS3_EEE8__appendEj($this,$__n) {
   $this = $this|0;
   $__n = $__n|0;
   var $$0$i = 0, $$0$i10 = 0, $$0$i8 = 0, $$pre = 0, $$pre20 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
   var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
   var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
   var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
   var $77 = 0, $8 = 0, $9 = 0, $__v = 0, $scevgep$i = 0, $scevgep$i11 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
   $__v = sp;
   $0 = ((($this)) + 8|0);
   $1 = HEAP32[$0>>2]|0;
   $2 = ((($this)) + 4|0);
   $3 = HEAP32[$2>>2]|0;
   $4 = (($1) - ($3))|0;
   $5 = (($4|0) / 12)&-1;
   $6 = ($5>>>0)<($__n>>>0);
   $7 = $3;
   if (!($6)) {
    $$0$i = $__n;$8 = $7;
    while(1) {
     HEAP32[$8>>2] = 0;
     $9 = ((($8)) + 4|0);
     HEAP32[$9>>2] = 0;
     $10 = ((($8)) + 8|0);
     HEAP32[$10>>2] = 0;
     $11 = ((($8)) + 12|0);
     $12 = (($$0$i) + -1)|0;
     $13 = ($12|0)==(0);
     if ($13) {
      break;
     } else {
      $$0$i = $12;$8 = $11;
     }
    }
    $scevgep$i = (($7) + (($__n*12)|0)|0);
    HEAP32[$2>>2] = $scevgep$i;
    STACKTOP = sp;return;
   }
   $14 = ((($this)) + 8|0);
   $15 = HEAP32[$this>>2]|0;
   $16 = (($3) - ($15))|0;
   $17 = (($16|0) / 12)&-1;
   $18 = (($17) + ($__n))|0;
   $19 = ($18>>>0)>(357913941);
   if ($19) {
    __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv($this);
    $$pre = HEAP32[$0>>2]|0;
    $$pre20 = HEAP32[$this>>2]|0;
    $21 = $$pre20;$22 = $$pre;
   } else {
    $21 = $15;$22 = $1;
   }
   $20 = (($22) - ($21))|0;
   $23 = (($20|0) / 12)&-1;
   $24 = ($23>>>0)<(178956970);
   if ($24) {
    $25 = $23 << 1;
    $26 = ($25>>>0)<($18>>>0);
    $27 = $26 ? $18 : $25;
    $$0$i8 = $27;
   } else {
    $$0$i8 = 357913941;
   }
   $28 = HEAP32[$2>>2]|0;
   $29 = (($28) - ($21))|0;
   $30 = (($29|0) / 12)&-1;
   $31 = ((($__v)) + 12|0);
   HEAP32[$31>>2] = 0;
   $32 = ((($__v)) + 16|0);
   HEAP32[$32>>2] = $14;
   $33 = ($$0$i8|0)==(0);
   if ($33) {
    $36 = 0;
   } else {
    $34 = ($$0$i8*12)|0;
    $35 = (__Znwj($34)|0);
    $36 = $35;
   }
   HEAP32[$__v>>2] = $36;
   $37 = (($36) + (($30*12)|0)|0);
   $38 = ((($__v)) + 8|0);
   HEAP32[$38>>2] = $37;
   $39 = ((($__v)) + 4|0);
   HEAP32[$39>>2] = $37;
   $40 = (($36) + (($$0$i8*12)|0)|0);
   $41 = ((($__v)) + 12|0);
   HEAP32[$41>>2] = $40;
   $$0$i10 = $__n;$42 = $37;
   while(1) {
    HEAP32[$42>>2] = 0;
    $43 = ((($42)) + 4|0);
    HEAP32[$43>>2] = 0;
    $44 = ((($42)) + 8|0);
    HEAP32[$44>>2] = 0;
    $45 = ((($42)) + 12|0);
    $46 = (($$0$i10) + -1)|0;
    $47 = ($46|0)==(0);
    if ($47) {
     break;
    } else {
     $$0$i10 = $46;$42 = $45;
    }
   }
   $scevgep$i11 = (($37) + (($__n*12)|0)|0);
   HEAP32[$38>>2] = $scevgep$i11;
   __THREW__ = 0;
   invoke_vii(45,($this|0),($__v|0));
   $48 = __THREW__; __THREW__ = 0;
   $49 = $48&1;
   if ($49) {
    $63 = ___cxa_find_matching_catch_2()|0;
    $64 = tempRet0;
    $65 = HEAP32[$39>>2]|0;
    $66 = HEAP32[$38>>2]|0;
    $67 = ($66|0)==($65|0);
    if (!($67)) {
     $69 = $66;
     while(1) {
      $68 = ((($69)) + -12|0);
      $70 = HEAP32[$68>>2]|0;
      $71 = ($70|0)==(0|0);
      if (!($71)) {
       $73 = ((($69)) + -8|0);
       $74 = HEAP32[$73>>2]|0;
       $75 = ($74|0)==($70|0);
       if (!($75)) {
        HEAP32[$73>>2] = $70;
       }
       __ZdlPv($70);
      }
      $72 = ($68|0)==($65|0);
      if ($72) {
       break;
      } else {
       $69 = $68;
      }
     }
     HEAP32[$38>>2] = $65;
    }
    $76 = HEAP32[$__v>>2]|0;
    $77 = ($76|0)==(0|0);
    if ($77) {
     ___resumeException($63|0);
     // unreachable;
    }
    __ZdlPv($76);
    ___resumeException($63|0);
    // unreachable;
   } else {
    $50 = HEAP32[$39>>2]|0;
    $51 = HEAP32[$38>>2]|0;
    $52 = ($51|0)==($50|0);
    if (!($52)) {
     $54 = $51;
     while(1) {
      $53 = ((($54)) + -12|0);
      $55 = HEAP32[$53>>2]|0;
      $56 = ($55|0)==(0|0);
      if (!($56)) {
       $58 = ((($54)) + -8|0);
       $59 = HEAP32[$58>>2]|0;
       $60 = ($59|0)==($55|0);
       if (!($60)) {
        HEAP32[$58>>2] = $55;
       }
       __ZdlPv($55);
      }
      $57 = ($53|0)==($50|0);
      if ($57) {
       break;
      } else {
       $54 = $53;
      }
     }
     HEAP32[$38>>2] = $50;
    }
    $61 = HEAP32[$__v>>2]|0;
    $62 = ($61|0)==(0|0);
    if (!($62)) {
     __ZdlPv($61);
    }
    STACKTOP = sp;return;
   }
  }
  function __ZNSt3__16vectorINS0_IhNS_9allocatorIhEEEENS1_IS3_EEE26__swap_out_circular_bufferERNS_14__split_bufferIS3_RS4_EE($this,$__v) {
   $this = $this|0;
   $__v = $__v|0;
   var $$01$i$i$i$i = 0, $$02$i = 0, $$lcssa = 0, $$lcssa25 = 0, $$lcssa27 = 0, $$pre = 0, $$pre$i = 0, $$pre$phi11Z2D = 0, $$pre$phiZ2D = 0, $$pre8 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0;
   var $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0;
   var $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $6 = 0;
   var $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = HEAP32[$this>>2]|0;
   $1 = ((($this)) + 4|0);
   $2 = HEAP32[$1>>2]|0;
   $3 = ((($__v)) + 4|0);
   $4 = ($2|0)==($0|0);
   do {
    if ($4) {
     $5 = $0;
     $$pre8 = HEAP32[$3>>2]|0;
     $$pre$phi11Z2D = $3;$$pre$phiZ2D = $this;$43 = $$pre8;$44 = $5;
    } else {
     $$pre$i = HEAP32[$3>>2]|0;
     $$02$i = $2;$7 = $$pre$i;
     while(1) {
      $6 = ((($7)) + -12|0);
      $8 = ((($$02$i)) + -12|0);
      HEAP32[$6>>2] = 0;
      $9 = ((($7)) + -8|0);
      HEAP32[$9>>2] = 0;
      $10 = ((($7)) + -4|0);
      HEAP32[$10>>2] = 0;
      $11 = ((($$02$i)) + -8|0);
      $12 = HEAP32[$11>>2]|0;
      $13 = HEAP32[$8>>2]|0;
      $14 = (($12) - ($13))|0;
      $15 = ($12|0)==($13|0);
      if (!($15)) {
       $16 = ($14|0)<(0);
       if ($16) {
        __THREW__ = 0;
        invoke_vi(46,($6|0));
        $17 = __THREW__; __THREW__ = 0;
        $18 = $17&1;
        if ($18) {
         $$lcssa = $6;$$lcssa25 = $9;
         break;
        }
       }
       __THREW__ = 0;
       $19 = (invoke_ii(29,($14|0))|0);
       $20 = __THREW__; __THREW__ = 0;
       $21 = $20&1;
       if ($21) {
        $$lcssa = $6;$$lcssa25 = $9;
        break;
       }
       HEAP32[$9>>2] = $19;
       HEAP32[$6>>2] = $19;
       $22 = (($19) + ($14)|0);
       $23 = ((($7)) + -4|0);
       HEAP32[$23>>2] = $22;
       $24 = HEAP32[$8>>2]|0;
       $25 = HEAP32[$11>>2]|0;
       $26 = ($24|0)==($25|0);
       if (!($26)) {
        $$01$i$i$i$i = $24;$28 = $19;
        while(1) {
         $27 = HEAP8[$$01$i$i$i$i>>0]|0;
         HEAP8[$28>>0] = $27;
         $29 = HEAP32[$9>>2]|0;
         $30 = ((($29)) + 1|0);
         HEAP32[$9>>2] = $30;
         $31 = ((($$01$i$i$i$i)) + 1|0);
         $32 = ($31|0)==($25|0);
         if ($32) {
          break;
         } else {
          $$01$i$i$i$i = $31;$28 = $30;
         }
        }
       }
      }
      $39 = HEAP32[$3>>2]|0;
      $40 = ((($39)) + -12|0);
      HEAP32[$3>>2] = $40;
      $41 = ($8|0)==($0|0);
      if ($41) {
       $$lcssa27 = $40;
       label = 16;
       break;
      } else {
       $$02$i = $8;$7 = $40;
      }
     }
     if ((label|0) == 16) {
      $42 = $$lcssa27;
      $$pre = HEAP32[$this>>2]|0;
      $$pre$phi11Z2D = $3;$$pre$phiZ2D = $this;$43 = $42;$44 = $$pre;
      break;
     }
     $33 = ___cxa_find_matching_catch_2()|0;
     $34 = tempRet0;
     $35 = HEAP32[$$lcssa>>2]|0;
     $36 = ($35|0)==(0|0);
     if ($36) {
      ___resumeException($33|0);
      // unreachable;
     }
     $37 = HEAP32[$$lcssa25>>2]|0;
     $38 = ($37|0)==($35|0);
     if (!($38)) {
      HEAP32[$$lcssa25>>2] = $35;
     }
     __ZdlPv($35);
     ___resumeException($33|0);
     // unreachable;
    }
   } while(0);
   HEAP32[$$pre$phiZ2D>>2] = $43;
   HEAP32[$$pre$phi11Z2D>>2] = $44;
   $45 = ((($__v)) + 8|0);
   $46 = HEAP32[$1>>2]|0;
   $47 = HEAP32[$45>>2]|0;
   HEAP32[$1>>2] = $47;
   HEAP32[$45>>2] = $46;
   $48 = ((($this)) + 8|0);
   $49 = ((($__v)) + 12|0);
   $50 = HEAP32[$48>>2]|0;
   $51 = HEAP32[$49>>2]|0;
   HEAP32[$48>>2] = $51;
   HEAP32[$49>>2] = $50;
   $52 = HEAP32[$$pre$phi11Z2D>>2]|0;
   HEAP32[$__v>>2] = $52;
   return;
  }
  function __ZNK10Page_image4saveEP8_IO_FILEc($this,$f,$filetype) {
   $this = $this|0;
   $f = $f|0;
   $filetype = $filetype|0;
   var $$0 = 0, $$byte$0 = 0, $$lcssa = 0, $$lcssa113 = 0, $$lcssa116 = 0, $$lcssa7 = 0, $$lcssa8 = 0, $$lcssa9 = 0, $$pre = 0, $$pre71 = 0, $$pre72 = 0, $$pre73 = 0, $$pre74 = 0, $$pre75 = 0, $$pre76 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0;
   var $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
   var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
   var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
   var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
   var $175 = 0, $176 = 0, $177 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
   var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
   var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
   var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
   var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $byte$050 = 0, $byte$2 = 0, $byte$2$lcssa = 0, $col$04299 = 0, $col11$016 = 0, $col2$052 = 0, $col4$024 = 0;
   var $col6$034 = 0, $col8$010 = 0, $filetype$off = 0, $mask$051 = 0, $mask$1 = 0, $mask$1$lcssa = 0, $row$046 = 0, $row1$058 = 0, $row10$020 = 0, $row3$030 = 0, $row5$038 = 0, $row7$012 = 0, $vararg_buffer = 0, $vararg_buffer12 = 0, $vararg_buffer17 = 0, $vararg_buffer22 = 0, $vararg_buffer3 = 0, $vararg_buffer6 = 0, $vararg_buffer9 = 0, $vararg_ptr1 = 0;
   var $vararg_ptr15 = 0, $vararg_ptr16 = 0, $vararg_ptr2 = 0, $vararg_ptr20 = 0, $vararg_ptr21 = 0, $vararg_ptr25 = 0, $vararg_ptr26 = 0, label = 0, sp = 0;
   sp = STACKTOP;
   STACKTOP = STACKTOP + 96|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
   $vararg_buffer22 = sp + 72|0;
   $vararg_buffer17 = sp + 56|0;
   $vararg_buffer12 = sp + 40|0;
   $vararg_buffer9 = sp + 32|0;
   $vararg_buffer6 = sp + 24|0;
   $vararg_buffer3 = sp + 16|0;
   $vararg_buffer = sp;
   $filetype$off = (($filetype) + -49)<<24>>24;
   $0 = ($filetype$off&255)>(5);
   if ($0) {
    $$0 = 0;
    STACKTOP = sp;return ($$0|0);
   }
   $1 = $filetype << 24 >> 24;
   $2 = ((($this)) + 8|0);
   $3 = HEAP32[$2>>2]|0;
   $4 = HEAP32[$this>>2]|0;
   $5 = (($3) + 1)|0;
   $6 = (($5) - ($4))|0;
   $7 = ((($this)) + 12|0);
   $8 = HEAP32[$7>>2]|0;
   $9 = ((($this)) + 4|0);
   $10 = HEAP32[$9>>2]|0;
   $11 = (($8) + 1)|0;
   $12 = (($11) - ($10))|0;
   HEAP32[$vararg_buffer>>2] = $1;
   $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
   HEAP32[$vararg_ptr1>>2] = $6;
   $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
   HEAP32[$vararg_ptr2>>2] = $12;
   (_fprintf($f,1415,$vararg_buffer)|0);
   switch ($filetype<<24>>24) {
   case 49:  {
    $16 = HEAP32[$9>>2]|0;
    $17 = HEAP32[$7>>2]|0;
    $18 = ($16|0)>($17|0);
    if ($18) {
     $$0 = 1;
     STACKTOP = sp;return ($$0|0);
    }
    $19 = ((($this)) + 16|0);
    $20 = ((($this)) + 29|0);
    $row$046 = $16;
    while(1) {
     $21 = HEAP32[$this>>2]|0;
     $22 = HEAP32[$2>>2]|0;
     $23 = ($21|0)>($22|0);
     if (!($23)) {
      $24 = HEAP32[$9>>2]|0;
      $25 = (($row$046) - ($24))|0;
      $26 = HEAP32[$19>>2]|0;
      $27 = (($26) + (($25*12)|0)|0);
      $28 = HEAP32[$27>>2]|0;
      $29 = HEAP8[$28>>0]|0;
      $30 = HEAP8[$20>>0]|0;
      $31 = ($29&255)<=($30&255);
      $32 = $31 ? 49 : 48;
      (_putc($32,$f)|0);
      $33 = HEAP32[$2>>2]|0;
      $34 = ($21|0)<($33|0);
      if ($34) {
       $col$04299 = $21;
       while(1) {
        $38 = (($col$04299) + 1)|0;
        $$pre72 = HEAP32[$this>>2]|0;
        $39 = HEAP32[$9>>2]|0;
        $40 = (($row$046) - ($39))|0;
        $41 = HEAP32[$19>>2]|0;
        $42 = (($38) - ($$pre72))|0;
        $43 = (($41) + (($40*12)|0)|0);
        $44 = HEAP32[$43>>2]|0;
        $45 = (($44) + ($42)|0);
        $46 = HEAP8[$45>>0]|0;
        $47 = HEAP8[$20>>0]|0;
        $48 = ($46&255)<=($47&255);
        $49 = $48 ? 49 : 48;
        (_putc($49,$f)|0);
        $50 = HEAP32[$2>>2]|0;
        $51 = ($38|0)<($50|0);
        if ($51) {
         $col$04299 = $38;
        } else {
         break;
        }
       }
      }
     }
     (_putc(10,$f)|0);
     $35 = (($row$046) + 1)|0;
     $36 = HEAP32[$7>>2]|0;
     $37 = ($row$046|0)<($36|0);
     if ($37) {
      $row$046 = $35;
     } else {
      $$0 = 1;
      break;
     }
    }
    STACKTOP = sp;return ($$0|0);
    break;
   }
   case 52:  {
    $52 = HEAP32[$9>>2]|0;
    $53 = HEAP32[$7>>2]|0;
    $54 = ($52|0)>($53|0);
    if ($54) {
     $$0 = 1;
     STACKTOP = sp;return ($$0|0);
    }
    $55 = ((($this)) + 16|0);
    $56 = ((($this)) + 29|0);
    $row1$058 = $52;
    while(1) {
     $57 = HEAP32[$this>>2]|0;
     $58 = HEAP32[$2>>2]|0;
     $59 = ($57|0)>($58|0);
     if (!($59)) {
      $173 = $58;$65 = $57;$byte$050 = 0;$col2$052 = $57;$mask$051 = -128;
      while(1) {
       $61 = HEAP32[$9>>2]|0;
       $62 = (($row1$058) - ($61))|0;
       $63 = HEAP32[$55>>2]|0;
       $64 = (($col2$052) - ($65))|0;
       $66 = (($63) + (($62*12)|0)|0);
       $67 = HEAP32[$66>>2]|0;
       $68 = (($67) + ($64)|0);
       $69 = HEAP8[$68>>0]|0;
       $70 = HEAP8[$56>>0]|0;
       $71 = ($69&255)<=($70&255);
       $72 = $71 ? $mask$051 : 0;
       $$byte$0 = $72 | $byte$050;
       $73 = ($mask$051&255) >>> 1;
       $74 = ($73<<24>>24)==(0);
       if ($74) {
        $75 = $$byte$0&255;
        (_putc($75,$f)|0);
        $$pre71 = HEAP32[$2>>2]|0;
        $77 = $$pre71;$byte$2 = 0;$mask$1 = -128;
       } else {
        $77 = $173;$byte$2 = $$byte$0;$mask$1 = $73;
       }
       $76 = ($col2$052|0)<($77|0);
       if (!($76)) {
        $byte$2$lcssa = $byte$2;$mask$1$lcssa = $mask$1;
        break;
       }
       $78 = (($col2$052) + 1)|0;
       $$pre = HEAP32[$this>>2]|0;
       $173 = $77;$65 = $$pre;$byte$050 = $byte$2;$col2$052 = $78;$mask$051 = $mask$1;
      }
      $60 = ($mask$1$lcssa<<24>>24)==(-128);
      if (!($60)) {
       $79 = $byte$2$lcssa&255;
       (_putc($79,$f)|0);
      }
     }
     $80 = (($row1$058) + 1)|0;
     $81 = HEAP32[$7>>2]|0;
     $82 = ($row1$058|0)<($81|0);
     if ($82) {
      $row1$058 = $80;
     } else {
      $$0 = 1;
      break;
     }
    }
    STACKTOP = sp;return ($$0|0);
    break;
   }
   default: {
    $13 = ((($this)) + 28|0);
    $14 = HEAP8[$13>>0]|0;
    $15 = $14&255;
    HEAP32[$vararg_buffer3>>2] = $15;
    (_fprintf($f,1426,$vararg_buffer3)|0);
    switch ($filetype<<24>>24) {
    case 51:  {
     $128 = HEAP32[$9>>2]|0;
     $129 = HEAP32[$7>>2]|0;
     $130 = ($128|0)>($129|0);
     if ($130) {
      $$0 = 1;
      STACKTOP = sp;return ($$0|0);
     }
     $131 = ((($this)) + 16|0);
     $row7$012 = $128;
     while(1) {
      $132 = HEAP32[$this>>2]|0;
      $133 = HEAP32[$2>>2]|0;
      $134 = ($132|0)<($133|0);
      $135 = HEAP32[$131>>2]|0;
      $136 = (($135) + (($row7$012*12)|0)|0);
      $137 = HEAP32[$136>>2]|0;
      if ($134) {
       $145 = $137;$col8$010 = $132;
       while(1) {
        $144 = (($145) + ($col8$010)|0);
        $146 = HEAP8[$144>>0]|0;
        $147 = $146&255;
        HEAP32[$vararg_buffer17>>2] = $147;
        $vararg_ptr20 = ((($vararg_buffer17)) + 4|0);
        HEAP32[$vararg_ptr20>>2] = $147;
        $vararg_ptr21 = ((($vararg_buffer17)) + 8|0);
        HEAP32[$vararg_ptr21>>2] = $147;
        (_fprintf($f,1444,$vararg_buffer17)|0);
        $148 = (($col8$010) + 1)|0;
        $149 = HEAP32[$2>>2]|0;
        $150 = ($148|0)<($149|0);
        $151 = HEAP32[$131>>2]|0;
        $152 = (($151) + (($row7$012*12)|0)|0);
        $153 = HEAP32[$152>>2]|0;
        if ($150) {
         $145 = $153;$col8$010 = $148;
        } else {
         $$lcssa = $149;$$lcssa7 = $153;
         break;
        }
       }
      } else {
       $$lcssa = $133;$$lcssa7 = $137;
      }
      $138 = (($$lcssa7) + ($$lcssa)|0);
      $139 = HEAP8[$138>>0]|0;
      $140 = $139&255;
      HEAP32[$vararg_buffer12>>2] = $140;
      $vararg_ptr15 = ((($vararg_buffer12)) + 4|0);
      HEAP32[$vararg_ptr15>>2] = $140;
      $vararg_ptr16 = ((($vararg_buffer12)) + 8|0);
      HEAP32[$vararg_ptr16>>2] = $140;
      (_fprintf($f,1434,$vararg_buffer12)|0);
      $141 = (($row7$012) + 1)|0;
      $142 = HEAP32[$7>>2]|0;
      $143 = ($row7$012|0)<($142|0);
      if ($143) {
       $row7$012 = $141;
      } else {
       $$0 = 1;
       break;
      }
     }
     STACKTOP = sp;return ($$0|0);
     break;
    }
    case 54:  {
     $154 = HEAP32[$9>>2]|0;
     $155 = HEAP32[$7>>2]|0;
     $156 = ($154|0)>($155|0);
     if ($156) {
      $$0 = 1;
      STACKTOP = sp;return ($$0|0);
     }
     $157 = ((($this)) + 16|0);
     $$pre75 = HEAP32[$2>>2]|0;
     $160 = $$pre75;$176 = $155;$row10$020 = $154;
     while(1) {
      $158 = HEAP32[$this>>2]|0;
      $159 = ($158|0)>($160|0);
      if ($159) {
       $163 = $176;$177 = $160;
      } else {
       $col11$016 = $158;
       while(1) {
        $164 = HEAP32[$157>>2]|0;
        $165 = (($164) + (($row10$020*12)|0)|0);
        $166 = HEAP32[$165>>2]|0;
        $167 = (($166) + ($col11$016)|0);
        $168 = HEAP8[$167>>0]|0;
        $169 = $168&255;
        HEAP32[$vararg_buffer22>>2] = $169;
        $vararg_ptr25 = ((($vararg_buffer22)) + 4|0);
        HEAP32[$vararg_ptr25>>2] = $169;
        $vararg_ptr26 = ((($vararg_buffer22)) + 8|0);
        HEAP32[$vararg_ptr26>>2] = $169;
        (_fprintf($f,1454,$vararg_buffer22)|0);
        $170 = (($col11$016) + 1)|0;
        $171 = HEAP32[$2>>2]|0;
        $172 = ($col11$016|0)<($171|0);
        if ($172) {
         $col11$016 = $170;
        } else {
         $$lcssa113 = $171;
         break;
        }
       }
       $$pre76 = HEAP32[$7>>2]|0;
       $163 = $$pre76;$177 = $$lcssa113;
      }
      $161 = (($row10$020) + 1)|0;
      $162 = ($row10$020|0)<($163|0);
      if ($162) {
       $160 = $177;$176 = $163;$row10$020 = $161;
      } else {
       $$0 = 1;
       break;
      }
     }
     STACKTOP = sp;return ($$0|0);
     break;
    }
    case 50:  {
     $83 = HEAP32[$9>>2]|0;
     $84 = HEAP32[$7>>2]|0;
     $85 = ($83|0)>($84|0);
     if ($85) {
      $$0 = 1;
      STACKTOP = sp;return ($$0|0);
     }
     $86 = ((($this)) + 16|0);
     $row3$030 = $83;
     while(1) {
      $87 = HEAP32[$this>>2]|0;
      $88 = HEAP32[$2>>2]|0;
      $89 = ($87|0)<($88|0);
      $90 = HEAP32[$86>>2]|0;
      $91 = (($90) + (($row3$030*12)|0)|0);
      $92 = HEAP32[$91>>2]|0;
      if ($89) {
       $100 = $92;$col4$024 = $87;
       while(1) {
        $99 = (($100) + ($col4$024)|0);
        $101 = HEAP8[$99>>0]|0;
        $102 = $101&255;
        HEAP32[$vararg_buffer9>>2] = $102;
        (_fprintf($f,1430,$vararg_buffer9)|0);
        $103 = (($col4$024) + 1)|0;
        $104 = HEAP32[$2>>2]|0;
        $105 = ($103|0)<($104|0);
        $106 = HEAP32[$86>>2]|0;
        $107 = (($106) + (($row3$030*12)|0)|0);
        $108 = HEAP32[$107>>2]|0;
        if ($105) {
         $100 = $108;$col4$024 = $103;
        } else {
         $$lcssa8 = $104;$$lcssa9 = $108;
         break;
        }
       }
      } else {
       $$lcssa8 = $88;$$lcssa9 = $92;
      }
      $93 = (($$lcssa9) + ($$lcssa8)|0);
      $94 = HEAP8[$93>>0]|0;
      $95 = $94&255;
      HEAP32[$vararg_buffer6>>2] = $95;
      (_fprintf($f,1426,$vararg_buffer6)|0);
      $96 = (($row3$030) + 1)|0;
      $97 = HEAP32[$7>>2]|0;
      $98 = ($row3$030|0)<($97|0);
      if ($98) {
       $row3$030 = $96;
      } else {
       $$0 = 1;
       break;
      }
     }
     STACKTOP = sp;return ($$0|0);
     break;
    }
    case 53:  {
     $109 = HEAP32[$9>>2]|0;
     $110 = HEAP32[$7>>2]|0;
     $111 = ($109|0)>($110|0);
     if ($111) {
      $$0 = 1;
      STACKTOP = sp;return ($$0|0);
     }
     $112 = ((($this)) + 16|0);
     $$pre73 = HEAP32[$2>>2]|0;
     $115 = $$pre73;$174 = $110;$row5$038 = $109;
     while(1) {
      $113 = HEAP32[$this>>2]|0;
      $114 = ($113|0)>($115|0);
      if ($114) {
       $118 = $174;$175 = $115;
      } else {
       $col6$034 = $113;
       while(1) {
        $119 = HEAP32[$112>>2]|0;
        $120 = (($119) + (($row5$038*12)|0)|0);
        $121 = HEAP32[$120>>2]|0;
        $122 = (($121) + ($col6$034)|0);
        $123 = HEAP8[$122>>0]|0;
        $124 = $123&255;
        (_fputc($124,$f)|0);
        $125 = (($col6$034) + 1)|0;
        $126 = HEAP32[$2>>2]|0;
        $127 = ($col6$034|0)<($126|0);
        if ($127) {
         $col6$034 = $125;
        } else {
         $$lcssa116 = $126;
         break;
        }
       }
       $$pre74 = HEAP32[$7>>2]|0;
       $118 = $$pre74;$175 = $$lcssa116;
      }
      $116 = (($row5$038) + 1)|0;
      $117 = ($row5$038|0)<($118|0);
      if ($117) {
       $115 = $175;$174 = $118;$row5$038 = $116;
      } else {
       $$0 = 1;
       break;
      }
     }
     STACKTOP = sp;return ($$0|0);
     break;
    }
    default: {
     $$0 = 1;
     STACKTOP = sp;return ($$0|0);
    }
    }
   }
   }
   return (0)|0;
  }
  function __ZN10Page_imageC2ERK12OCRAD_Pixmapb($this,$image,$invert) {
   $this = $this|0;
   $image = $image|0;
   $invert = $invert|0;
   var $$0$i1$i$i = 0, $$0$i1$i$i$us = 0, $$0$i1$i$i12$us = 0, $$0$i1$i$i35$us = 0, $$0$i1$i$i50$us = 0, $$0$i1$i$i65$us = 0, $$0$i2$i$i = 0, $$0$i2$i$i$us = 0, $$0$i2$i$i13$us = 0, $$0$i2$i$i36$us = 0, $$0$i2$i$i51$us = 0, $$0$i2$i$i66$us = 0, $$in = 0, $$in$i$i = 0, $$in$i$i$us = 0, $$in$i$i32$us = 0, $$in$i$i47$us = 0, $$in$i$i62$us = 0, $$in$i$i9$us = 0, $$lcssa = 0;
   var $$lcssa200 = 0, $$lcssa201 = 0, $$lcssa202 = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i$i$i21 = 0, $$pre$i$i$us = 0, $$pre$i$i28$us = 0, $$pre$i$i43$us = 0, $$pre$i$i5$us = 0, $$pre$i$i58$us = 0, $$pre$i$us = 0, $$pre$i24 = 0, $$pre$i30$us = 0, $$pre$i45$us = 0, $$pre$i60$us = 0, $$pre$i7$us = 0, $$pre$phi$i$usZ2D = 0, $$pre$phi$i31$usZ2D = 0;
   var $$pre$phi$i46$usZ2D = 0, $$pre$phi$i61$usZ2D = 0, $$pre$phi$i8$usZ2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi169Z2D = 0, $$pre$phiZ2D = 0, $$pre166 = 0, $$pre167 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0;
   var $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0;
   var $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0;
   var $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0;
   var $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0;
   var $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0;
   var $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0;
   var $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0;
   var $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0;
   var $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0;
   var $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0;
   var $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0;
   var $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0;
   var $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0;
   var $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0;
   var $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0;
   var $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0;
   var $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0;
   var $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0;
   var $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0;
   var $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0;
   var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0;
   var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
   var $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $col$0111$us = 0, $col10$0119$us = 0;
   var $col13$0135 = 0, $col13$0135$us = 0, $col4$0106$us = 0, $col7$0127$us = 0, $i$0115$us = 0, $i$1110$us = 0, $i11$0139 = 0, $i11$1$lcssa = 0, $i11$1134 = 0, $i11$1134$us = 0, $i2$0107$us = 0, $i2$1105$us = 0, $i5$0131$us = 0, $i5$1126$us = 0, $i8$0123$us = 0, $i8$1118$us = 0, $lpad$phi$index = 0, $lpad$phi$index8 = 0, $not$$us = 0, $row$0142 = 0;
   var $row1$0116$us = 0, $row12$0140 = 0, $row3$0108$us = 0, $row6$0132$us = 0, $row9$0124$us = 0, label = 0, sp = 0;
   sp = STACKTOP;
   $0 = ((($image)) + 8|0);
   $1 = HEAP32[$0>>2]|0;
   $2 = (($1) + -1)|0;
   $3 = ((($image)) + 4|0);
   $4 = HEAP32[$3>>2]|0;
   $5 = (($4) + -1)|0;
   __ZN9RectangleC2Eiiii($this,0,0,$2,$5);
   $6 = ((($this)) + 16|0);
   HEAP32[$6>>2] = 0;
   $7 = ((($this)) + 20|0);
   HEAP32[$7>>2] = 0;
   $8 = ((($this)) + 24|0);
   HEAP32[$8>>2] = 0;
   $9 = ((($this)) + 12|0);
   $10 = HEAP32[$9>>2]|0;
   $11 = ((($this)) + 4|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = (($10) + 1)|0;
   $14 = ($13|0)==($12|0);
   L1: do {
    if ($14) {
     label = 4;
    } else {
     $15 = (($13) - ($12))|0;
     __THREW__ = 0;
     invoke_vii(38,($6|0),($15|0));
     $16 = __THREW__; __THREW__ = 0;
     $17 = $16&1;
     if ($17) {
      $34 = ___cxa_find_matching_catch_2()|0;
      $35 = tempRet0;
      $lpad$phi$index = $34;$lpad$phi$index8 = $35;
      break;
     }
     $$pre = HEAP32[$7>>2]|0;
     $$pre166 = HEAP32[$6>>2]|0;
     $18 = ($$pre|0)==($$pre166|0);
     if ($18) {
      label = 4;
     } else {
      $19 = ((($this)) + 8|0);
      $$in = $$pre166;$row$0142 = 0;
      while(1) {
       $50 = $$in;
       $51 = (($50) + (($row$0142*12)|0)|0);
       $52 = HEAP32[$19>>2]|0;
       $53 = HEAP32[$this>>2]|0;
       $54 = (($52) + 1)|0;
       $55 = (($54) - ($53))|0;
       $56 = (((($50) + (($row$0142*12)|0)|0)) + 8|0);
       $57 = HEAP32[$56>>2]|0;
       $58 = HEAP32[$51>>2]|0;
       $59 = (($57) - ($58))|0;
       $60 = ($59>>>0)<($55>>>0);
       $61 = $58;
       if ($60) {
        $62 = (((($50) + (($row$0142*12)|0)|0)) + 4|0);
        $63 = HEAP32[$62>>2]|0;
        $64 = (($63) - ($58))|0;
        $65 = ($54|0)==($53|0);
        if ($65) {
         $70 = 0;
        } else {
         __THREW__ = 0;
         $66 = (invoke_ii(29,($55|0))|0);
         $67 = __THREW__; __THREW__ = 0;
         $68 = $67&1;
         if ($68) {
          break;
         } else {
          $70 = $66;
         }
        }
        $69 = (($70) + ($64)|0);
        $71 = $69;
        $72 = (($70) + ($55)|0);
        $73 = $72;
        $74 = (0 - ($64))|0;
        $75 = (($69) + ($74)|0);
        $76 = $75;
        _memcpy(($75|0),($61|0),($64|0))|0;
        HEAP32[$51>>2] = $76;
        HEAP32[$62>>2] = $71;
        HEAP32[$56>>2] = $73;
        $77 = ($58|0)==(0);
        if (!($77)) {
         __ZdlPv($61);
        }
       }
       $78 = (($row$0142) + 1)|0;
       $79 = HEAP32[$7>>2]|0;
       $80 = HEAP32[$6>>2]|0;
       $81 = (($79) - ($80))|0;
       $82 = (($81|0) / 12)&-1;
       $83 = ($78>>>0)<($82>>>0);
       if ($83) {
        $$in = $80;$row$0142 = $78;
       } else {
        $$pre$phi169Z2D = $this;$$pre$phiZ2D = $19;
        label = 6;
        break L1;
       }
      }
      $32 = ___cxa_find_matching_catch_2()|0;
      $33 = tempRet0;
      $lpad$phi$index = $32;$lpad$phi$index8 = $33;
     }
    }
   } while(0);
   if ((label|0) == 4) {
    $$pre167 = ((($this)) + 8|0);
    $$pre$phi169Z2D = $this;$$pre$phiZ2D = $$pre167;
    label = 6;
   }
   L19: do {
    if ((label|0) == 6) {
     $20 = HEAP32[$9>>2]|0;
     $21 = HEAP32[$11>>2]|0;
     $22 = (($20) + 1)|0;
     $23 = (($22) - ($21))|0;
     $24 = HEAP32[$$pre$phiZ2D>>2]|0;
     $25 = HEAP32[$$pre$phi169Z2D>>2]|0;
     $26 = (($24) + 1)|0;
     $27 = (($26) - ($25))|0;
     $28 = ((($image)) + 12|0);
     $29 = HEAP32[$28>>2]|0;
     switch ($29|0) {
     case 0:  {
      $84 = ((($this)) + 28|0);
      HEAP8[$84>>0] = 1;
      $85 = ((($this)) + 29|0);
      HEAP8[$85>>0] = 0;
      $86 = ($23|0)>(0);
      if ($invert) {
       if (!($86)) {
        return;
       }
       $144 = ($27|0)>(0);
       if ($144) {
        $i2$0107$us = 0;$row3$0108$us = 0;
       } else {
        return;
       }
       L30: while(1) {
        $col4$0106$us = 0;$i2$1105$us = $i2$0107$us;
        while(1) {
         $145 = HEAP32[$6>>2]|0;
         $146 = (($145) + (($row3$0108$us*12)|0)|0);
         $147 = HEAP32[$image>>2]|0;
         $148 = (($147) + ($i2$1105$us)|0);
         $149 = HEAP8[$148>>0]|0;
         $150 = ($149<<24>>24)!=(0);
         $151 = $150&1;
         $152 = (((($145) + (($row3$0108$us*12)|0)|0)) + 4|0);
         $153 = HEAP32[$152>>2]|0;
         $154 = (((($145) + (($row3$0108$us*12)|0)|0)) + 8|0);
         $155 = HEAP32[$154>>2]|0;
         $156 = ($153|0)==($155|0);
         $157 = $155;
         if ($156) {
          $160 = $153;
          $161 = HEAP32[$146>>2]|0;
          $162 = (($160) - ($161))|0;
          $163 = (($162) + 1)|0;
          $164 = ($163|0)<(0);
          if ($164) {
           __THREW__ = 0;
           invoke_vi(46,($146|0));
           $165 = __THREW__; __THREW__ = 0;
           $166 = $165&1;
           if ($166) {
            label = 61;
            break L30;
           }
           $$pre$i$i43$us = HEAP32[$146>>2]|0;
           $$pre$i45$us = HEAP32[$154>>2]|0;
           $$in$i$i47$us = $$pre$i$i43$us;$$pre$phi$i46$usZ2D = $154;$169 = $$pre$i45$us;
          } else {
           $$in$i$i47$us = $161;$$pre$phi$i46$usZ2D = $154;$169 = $157;
          }
          $167 = $$in$i$i47$us;
          $168 = (($169) - ($$in$i$i47$us))|0;
          $170 = ($168>>>0)<(1073741823);
          if ($170) {
           $173 = $168 << 1;
           $174 = ($173>>>0)<($163>>>0);
           $175 = $174 ? $163 : $173;
           $176 = HEAP32[$152>>2]|0;
           $177 = (($176) - ($$in$i$i47$us))|0;
           $178 = ($175|0)==(0);
           if ($178) {
            $$0$i2$i$i51$us = 0;$183 = 0;$184 = $177;$190 = $176;
           } else {
            $$0$i1$i$i50$us = $175;$460 = $176;$461 = $177;
            label = 55;
           }
          } else {
           $171 = HEAP32[$152>>2]|0;
           $172 = (($171) - ($$in$i$i47$us))|0;
           $$0$i1$i$i50$us = 2147483647;$460 = $171;$461 = $172;
           label = 55;
          }
          if ((label|0) == 55) {
           label = 0;
           __THREW__ = 0;
           $179 = (invoke_ii(29,($$0$i1$i$i50$us|0))|0);
           $180 = __THREW__; __THREW__ = 0;
           $181 = $180&1;
           if ($181) {
            label = 61;
            break L30;
           } else {
            $$0$i2$i$i51$us = $$0$i1$i$i50$us;$183 = $179;$184 = $461;$190 = $460;
           }
          }
          $182 = (($183) + ($184)|0);
          $185 = (($183) + ($$0$i2$i$i51$us)|0);
          $186 = $185;
          HEAP8[$182>>0] = $151;
          $187 = ((($182)) + 1|0);
          $188 = $187;
          $189 = (($190) - ($$in$i$i47$us))|0;
          $191 = (0 - ($189))|0;
          $192 = (($182) + ($191)|0);
          $193 = $192;
          _memcpy(($192|0),($167|0),($189|0))|0;
          HEAP32[$146>>2] = $193;
          HEAP32[$152>>2] = $188;
          HEAP32[$$pre$phi$i46$usZ2D>>2] = $186;
          $194 = ($$in$i$i47$us|0)==(0);
          if (!($194)) {
           __ZdlPv($167);
          }
         } else {
          HEAP8[$153>>0] = $151;
          $158 = HEAP32[$152>>2]|0;
          $159 = ((($158)) + 1|0);
          HEAP32[$152>>2] = $159;
         }
         $195 = (($col4$0106$us) + 1)|0;
         $196 = (($i2$1105$us) + 1)|0;
         $197 = ($195|0)<($27|0);
         if ($197) {
          $col4$0106$us = $195;$i2$1105$us = $196;
         } else {
          $$lcssa = $196;
          break;
         }
        }
        $198 = (($row3$0108$us) + 1)|0;
        $199 = ($198|0)<($23|0);
        if ($199) {
         $i2$0107$us = $$lcssa;$row3$0108$us = $198;
        } else {
         label = 131;
         break;
        }
       }
       if ((label|0) == 61) {
        $200 = ___cxa_find_matching_catch_2()|0;
        $201 = tempRet0;
        $lpad$phi$index = $200;$lpad$phi$index8 = $201;
        break L19;
       }
       else if ((label|0) == 131) {
        return;
       }
      } else {
       if (!($86)) {
        return;
       }
       $87 = ($27|0)>(0);
       if ($87) {
        $i$0115$us = 0;$row1$0116$us = 0;
       } else {
        return;
       }
       L60: while(1) {
        $col$0111$us = 0;$i$1110$us = $i$0115$us;
        while(1) {
         $88 = HEAP32[$6>>2]|0;
         $89 = (($88) + (($row1$0116$us*12)|0)|0);
         $90 = HEAP32[$image>>2]|0;
         $91 = (($90) + ($i$1110$us)|0);
         $92 = HEAP8[$91>>0]|0;
         $not$$us = ($92<<24>>24)==(0);
         $93 = $not$$us&1;
         $94 = (((($88) + (($row1$0116$us*12)|0)|0)) + 4|0);
         $95 = HEAP32[$94>>2]|0;
         $96 = (((($88) + (($row1$0116$us*12)|0)|0)) + 8|0);
         $97 = HEAP32[$96>>2]|0;
         $98 = ($95|0)==($97|0);
         $99 = $97;
         if ($98) {
          $102 = $95;
          $103 = HEAP32[$89>>2]|0;
          $104 = (($102) - ($103))|0;
          $105 = (($104) + 1)|0;
          $106 = ($105|0)<(0);
          if ($106) {
           __THREW__ = 0;
           invoke_vi(46,($89|0));
           $107 = __THREW__; __THREW__ = 0;
           $108 = $107&1;
           if ($108) {
            label = 43;
            break L60;
           }
           $$pre$i$i28$us = HEAP32[$89>>2]|0;
           $$pre$i30$us = HEAP32[$96>>2]|0;
           $$in$i$i32$us = $$pre$i$i28$us;$$pre$phi$i31$usZ2D = $96;$111 = $$pre$i30$us;
          } else {
           $$in$i$i32$us = $103;$$pre$phi$i31$usZ2D = $96;$111 = $99;
          }
          $109 = $$in$i$i32$us;
          $110 = (($111) - ($$in$i$i32$us))|0;
          $112 = ($110>>>0)<(1073741823);
          if ($112) {
           $115 = $110 << 1;
           $116 = ($115>>>0)<($105>>>0);
           $117 = $116 ? $105 : $115;
           $118 = HEAP32[$94>>2]|0;
           $119 = (($118) - ($$in$i$i32$us))|0;
           $120 = ($117|0)==(0);
           if ($120) {
            $$0$i2$i$i36$us = 0;$125 = 0;$126 = $119;$132 = $118;
           } else {
            $$0$i1$i$i35$us = $117;$458 = $118;$459 = $119;
            label = 37;
           }
          } else {
           $113 = HEAP32[$94>>2]|0;
           $114 = (($113) - ($$in$i$i32$us))|0;
           $$0$i1$i$i35$us = 2147483647;$458 = $113;$459 = $114;
           label = 37;
          }
          if ((label|0) == 37) {
           label = 0;
           __THREW__ = 0;
           $121 = (invoke_ii(29,($$0$i1$i$i35$us|0))|0);
           $122 = __THREW__; __THREW__ = 0;
           $123 = $122&1;
           if ($123) {
            label = 43;
            break L60;
           } else {
            $$0$i2$i$i36$us = $$0$i1$i$i35$us;$125 = $121;$126 = $459;$132 = $458;
           }
          }
          $124 = (($125) + ($126)|0);
          $127 = (($125) + ($$0$i2$i$i36$us)|0);
          $128 = $127;
          HEAP8[$124>>0] = $93;
          $129 = ((($124)) + 1|0);
          $130 = $129;
          $131 = (($132) - ($$in$i$i32$us))|0;
          $133 = (0 - ($131))|0;
          $134 = (($124) + ($133)|0);
          $135 = $134;
          _memcpy(($134|0),($109|0),($131|0))|0;
          HEAP32[$89>>2] = $135;
          HEAP32[$94>>2] = $130;
          HEAP32[$$pre$phi$i31$usZ2D>>2] = $128;
          $136 = ($$in$i$i32$us|0)==(0);
          if (!($136)) {
           __ZdlPv($109);
          }
         } else {
          HEAP8[$95>>0] = $93;
          $100 = HEAP32[$94>>2]|0;
          $101 = ((($100)) + 1|0);
          HEAP32[$94>>2] = $101;
         }
         $137 = (($col$0111$us) + 1)|0;
         $138 = (($i$1110$us) + 1)|0;
         $139 = ($137|0)<($27|0);
         if ($139) {
          $col$0111$us = $137;$i$1110$us = $138;
         } else {
          $$lcssa200 = $138;
          break;
         }
        }
        $140 = (($row1$0116$us) + 1)|0;
        $141 = ($140|0)<($23|0);
        if ($141) {
         $i$0115$us = $$lcssa200;$row1$0116$us = $140;
        } else {
         label = 131;
         break;
        }
       }
       if ((label|0) == 43) {
        $142 = ___cxa_find_matching_catch_2()|0;
        $143 = tempRet0;
        $lpad$phi$index = $142;$lpad$phi$index8 = $143;
        break L19;
       }
       else if ((label|0) == 131) {
        return;
       }
      }
      break;
     }
     case 1:  {
      $202 = ((($this)) + 28|0);
      HEAP8[$202>>0] = -1;
      $203 = ((($this)) + 29|0);
      HEAP8[$203>>0] = 127;
      $204 = ($23|0)>(0);
      if ($invert) {
       if (!($204)) {
        return;
       }
       $262 = ($27|0)>(0);
       if ($262) {
        $i8$0123$us = 0;$row9$0124$us = 0;
       } else {
        return;
       }
       L92: while(1) {
        $col10$0119$us = 0;$i8$1118$us = $i8$0123$us;
        while(1) {
         $263 = HEAP32[$6>>2]|0;
         $264 = (($263) + (($row9$0124$us*12)|0)|0);
         $265 = HEAP8[$202>>0]|0;
         $266 = $265&255;
         $267 = HEAP32[$image>>2]|0;
         $268 = (($267) + ($i8$1118$us)|0);
         $269 = HEAP8[$268>>0]|0;
         $270 = $269&255;
         $271 = (($266) - ($270))|0;
         $272 = $271&255;
         $273 = (((($263) + (($row9$0124$us*12)|0)|0)) + 4|0);
         $274 = HEAP32[$273>>2]|0;
         $275 = (((($263) + (($row9$0124$us*12)|0)|0)) + 8|0);
         $276 = HEAP32[$275>>2]|0;
         $277 = ($274|0)==($276|0);
         $278 = $276;
         if ($277) {
          $281 = $274;
          $282 = HEAP32[$264>>2]|0;
          $283 = (($281) - ($282))|0;
          $284 = (($283) + 1)|0;
          $285 = ($284|0)<(0);
          if ($285) {
           __THREW__ = 0;
           invoke_vi(46,($264|0));
           $286 = __THREW__; __THREW__ = 0;
           $287 = $286&1;
           if ($287) {
            label = 98;
            break L92;
           }
           $$pre$i$i5$us = HEAP32[$264>>2]|0;
           $$pre$i7$us = HEAP32[$275>>2]|0;
           $$in$i$i9$us = $$pre$i$i5$us;$$pre$phi$i8$usZ2D = $275;$290 = $$pre$i7$us;
          } else {
           $$in$i$i9$us = $282;$$pre$phi$i8$usZ2D = $275;$290 = $278;
          }
          $288 = $$in$i$i9$us;
          $289 = (($290) - ($$in$i$i9$us))|0;
          $291 = ($289>>>0)<(1073741823);
          if ($291) {
           $294 = $289 << 1;
           $295 = ($294>>>0)<($284>>>0);
           $296 = $295 ? $284 : $294;
           $297 = HEAP32[$273>>2]|0;
           $298 = (($297) - ($$in$i$i9$us))|0;
           $299 = ($296|0)==(0);
           if ($299) {
            $$0$i2$i$i13$us = 0;$304 = 0;$305 = $298;$311 = $297;
           } else {
            $$0$i1$i$i12$us = $296;$464 = $297;$465 = $298;
            label = 92;
           }
          } else {
           $292 = HEAP32[$273>>2]|0;
           $293 = (($292) - ($$in$i$i9$us))|0;
           $$0$i1$i$i12$us = 2147483647;$464 = $292;$465 = $293;
           label = 92;
          }
          if ((label|0) == 92) {
           label = 0;
           __THREW__ = 0;
           $300 = (invoke_ii(29,($$0$i1$i$i12$us|0))|0);
           $301 = __THREW__; __THREW__ = 0;
           $302 = $301&1;
           if ($302) {
            label = 98;
            break L92;
           } else {
            $$0$i2$i$i13$us = $$0$i1$i$i12$us;$304 = $300;$305 = $465;$311 = $464;
           }
          }
          $303 = (($304) + ($305)|0);
          $306 = (($304) + ($$0$i2$i$i13$us)|0);
          $307 = $306;
          HEAP8[$303>>0] = $272;
          $308 = ((($303)) + 1|0);
          $309 = $308;
          $310 = (($311) - ($$in$i$i9$us))|0;
          $312 = (0 - ($310))|0;
          $313 = (($303) + ($312)|0);
          $314 = $313;
          _memcpy(($313|0),($288|0),($310|0))|0;
          HEAP32[$264>>2] = $314;
          HEAP32[$273>>2] = $309;
          HEAP32[$$pre$phi$i8$usZ2D>>2] = $307;
          $315 = ($$in$i$i9$us|0)==(0);
          if (!($315)) {
           __ZdlPv($288);
          }
         } else {
          HEAP8[$274>>0] = $272;
          $279 = HEAP32[$273>>2]|0;
          $280 = ((($279)) + 1|0);
          HEAP32[$273>>2] = $280;
         }
         $316 = (($col10$0119$us) + 1)|0;
         $317 = (($i8$1118$us) + 1)|0;
         $318 = ($316|0)<($27|0);
         if ($318) {
          $col10$0119$us = $316;$i8$1118$us = $317;
         } else {
          $$lcssa201 = $317;
          break;
         }
        }
        $319 = (($row9$0124$us) + 1)|0;
        $320 = ($319|0)<($23|0);
        if ($320) {
         $i8$0123$us = $$lcssa201;$row9$0124$us = $319;
        } else {
         label = 131;
         break;
        }
       }
       if ((label|0) == 98) {
        $321 = ___cxa_find_matching_catch_2()|0;
        $322 = tempRet0;
        $lpad$phi$index = $321;$lpad$phi$index8 = $322;
        break L19;
       }
       else if ((label|0) == 131) {
        return;
       }
      } else {
       if (!($204)) {
        return;
       }
       $205 = ($27|0)>(0);
       if ($205) {
        $i5$0131$us = 0;$row6$0132$us = 0;
       } else {
        return;
       }
       L122: while(1) {
        $col7$0127$us = 0;$i5$1126$us = $i5$0131$us;
        while(1) {
         $206 = HEAP32[$6>>2]|0;
         $207 = (($206) + (($row6$0132$us*12)|0)|0);
         $208 = HEAP32[$image>>2]|0;
         $209 = (($208) + ($i5$1126$us)|0);
         $210 = (((($206) + (($row6$0132$us*12)|0)|0)) + 4|0);
         $211 = HEAP32[$210>>2]|0;
         $212 = (((($206) + (($row6$0132$us*12)|0)|0)) + 8|0);
         $213 = HEAP32[$212>>2]|0;
         $214 = ($211|0)==($213|0);
         $215 = $213;
         if ($214) {
          $219 = $211;
          $220 = HEAP32[$207>>2]|0;
          $221 = (($219) - ($220))|0;
          $222 = (($221) + 1)|0;
          $223 = ($222|0)<(0);
          if ($223) {
           __THREW__ = 0;
           invoke_vi(46,($207|0));
           $224 = __THREW__; __THREW__ = 0;
           $225 = $224&1;
           if ($225) {
            label = 80;
            break L122;
           }
           $$pre$i$i58$us = HEAP32[$207>>2]|0;
           $$pre$i60$us = HEAP32[$212>>2]|0;
           $$in$i$i62$us = $$pre$i$i58$us;$$pre$phi$i61$usZ2D = $212;$228 = $$pre$i60$us;
          } else {
           $$in$i$i62$us = $220;$$pre$phi$i61$usZ2D = $212;$228 = $215;
          }
          $226 = $$in$i$i62$us;
          $227 = (($228) - ($$in$i$i62$us))|0;
          $229 = ($227>>>0)<(1073741823);
          if ($229) {
           $232 = $227 << 1;
           $233 = ($232>>>0)<($222>>>0);
           $234 = $233 ? $222 : $232;
           $235 = HEAP32[$210>>2]|0;
           $236 = (($235) - ($$in$i$i62$us))|0;
           $237 = ($234|0)==(0);
           if ($237) {
            $$0$i2$i$i66$us = 0;$242 = 0;$243 = $236;$250 = $235;
           } else {
            $$0$i1$i$i65$us = $234;$462 = $235;$463 = $236;
            label = 74;
           }
          } else {
           $230 = HEAP32[$210>>2]|0;
           $231 = (($230) - ($$in$i$i62$us))|0;
           $$0$i1$i$i65$us = 2147483647;$462 = $230;$463 = $231;
           label = 74;
          }
          if ((label|0) == 74) {
           label = 0;
           __THREW__ = 0;
           $238 = (invoke_ii(29,($$0$i1$i$i65$us|0))|0);
           $239 = __THREW__; __THREW__ = 0;
           $240 = $239&1;
           if ($240) {
            label = 80;
            break L122;
           } else {
            $$0$i2$i$i66$us = $$0$i1$i$i65$us;$242 = $238;$243 = $463;$250 = $462;
           }
          }
          $241 = (($242) + ($243)|0);
          $244 = (($242) + ($$0$i2$i$i66$us)|0);
          $245 = $244;
          $246 = HEAP8[$209>>0]|0;
          HEAP8[$241>>0] = $246;
          $247 = ((($241)) + 1|0);
          $248 = $247;
          $249 = (($250) - ($$in$i$i62$us))|0;
          $251 = (0 - ($249))|0;
          $252 = (($241) + ($251)|0);
          $253 = $252;
          _memcpy(($252|0),($226|0),($249|0))|0;
          HEAP32[$207>>2] = $253;
          HEAP32[$210>>2] = $248;
          HEAP32[$$pre$phi$i61$usZ2D>>2] = $245;
          $254 = ($$in$i$i62$us|0)==(0);
          if (!($254)) {
           __ZdlPv($226);
          }
         } else {
          $216 = HEAP8[$209>>0]|0;
          HEAP8[$211>>0] = $216;
          $217 = HEAP32[$210>>2]|0;
          $218 = ((($217)) + 1|0);
          HEAP32[$210>>2] = $218;
         }
         $255 = (($col7$0127$us) + 1)|0;
         $256 = (($i5$1126$us) + 1)|0;
         $257 = ($255|0)<($27|0);
         if ($257) {
          $col7$0127$us = $255;$i5$1126$us = $256;
         } else {
          $$lcssa202 = $256;
          break;
         }
        }
        $258 = (($row6$0132$us) + 1)|0;
        $259 = ($258|0)<($23|0);
        if ($259) {
         $i5$0131$us = $$lcssa202;$row6$0132$us = $258;
        } else {
         label = 131;
         break;
        }
       }
       if ((label|0) == 80) {
        $260 = ___cxa_find_matching_catch_2()|0;
        $261 = tempRet0;
        $lpad$phi$index = $260;$lpad$phi$index8 = $261;
        break L19;
       }
       else if ((label|0) == 131) {
        return;
       }
      }
      break;
     }
     case 2:  {
      $323 = ((($this)) + 28|0);
      HEAP8[$323>>0] = -1;
      $324 = ((($this)) + 29|0);
      HEAP8[$324>>0] = 127;
      $325 = ($23|0)>(0);
      if (!($325)) {
       return;
      }
      $326 = ($27|0)>(0);
      $i11$0139 = 0;$row12$0140 = 0;
      L150: while(1) {
       if ($326) {
        if ($invert) {
         $col13$0135$us = 0;$i11$1134$us = $i11$0139;
         while(1) {
          $327 = HEAP32[$image>>2]|0;
          $328 = (($327) + ($i11$1134$us)|0);
          $329 = HEAP8[$328>>0]|0;
          $330 = (($i11$1134$us) + 1)|0;
          $331 = (($327) + ($330)|0);
          $332 = HEAP8[$331>>0]|0;
          $333 = (($i11$1134$us) + 2)|0;
          $334 = (($327) + ($333)|0);
          $335 = HEAP8[$334>>0]|0;
          $336 = HEAP8[$323>>0]|0;
          $337 = $336&255;
          $338 = ($332&255)<($335&255);
          $339 = $338 ? $335 : $332;
          $340 = ($329&255)<($339&255);
          $341 = $340 ? $339 : $329;
          $342 = $341&255;
          $343 = (($337) - ($342))|0;
          $344 = $343&255;
          $345 = HEAP32[$6>>2]|0;
          $346 = (($345) + (($row12$0140*12)|0)|0);
          $347 = (((($345) + (($row12$0140*12)|0)|0)) + 4|0);
          $348 = HEAP32[$347>>2]|0;
          $349 = (((($345) + (($row12$0140*12)|0)|0)) + 8|0);
          $350 = HEAP32[$349>>2]|0;
          $351 = ($348|0)==($350|0);
          $352 = $350;
          if ($351) {
           $355 = $348;
           $356 = HEAP32[$346>>2]|0;
           $357 = (($355) - ($356))|0;
           $358 = (($357) + 1)|0;
           $359 = ($358|0)<(0);
           if ($359) {
            __THREW__ = 0;
            invoke_vi(46,($346|0));
            $360 = __THREW__; __THREW__ = 0;
            $361 = $360&1;
            if ($361) {
             label = 116;
             break L150;
            }
            $$pre$i$i$us = HEAP32[$346>>2]|0;
            $$pre$i$us = HEAP32[$349>>2]|0;
            $$in$i$i$us = $$pre$i$i$us;$$pre$phi$i$usZ2D = $349;$364 = $$pre$i$us;
           } else {
            $$in$i$i$us = $356;$$pre$phi$i$usZ2D = $349;$364 = $352;
           }
           $362 = $$in$i$i$us;
           $363 = (($364) - ($$in$i$i$us))|0;
           $365 = ($363>>>0)<(1073741823);
           if ($365) {
            $368 = $363 << 1;
            $369 = ($368>>>0)<($358>>>0);
            $370 = $369 ? $358 : $368;
            $371 = HEAP32[$347>>2]|0;
            $372 = (($371) - ($$in$i$i$us))|0;
            $373 = ($370|0)==(0);
            if ($373) {
             $$0$i2$i$i$us = 0;$378 = 0;$379 = $372;$385 = $371;
            } else {
             $$0$i1$i$i$us = $370;$466 = $371;$467 = $372;
             label = 112;
            }
           } else {
            $366 = HEAP32[$347>>2]|0;
            $367 = (($366) - ($$in$i$i$us))|0;
            $$0$i1$i$i$us = 2147483647;$466 = $366;$467 = $367;
            label = 112;
           }
           if ((label|0) == 112) {
            label = 0;
            __THREW__ = 0;
            $374 = (invoke_ii(29,($$0$i1$i$i$us|0))|0);
            $375 = __THREW__; __THREW__ = 0;
            $376 = $375&1;
            if ($376) {
             label = 116;
             break L150;
            } else {
             $$0$i2$i$i$us = $$0$i1$i$i$us;$378 = $374;$379 = $467;$385 = $466;
            }
           }
           $377 = (($378) + ($379