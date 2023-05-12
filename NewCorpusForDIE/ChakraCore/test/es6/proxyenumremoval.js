function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var passed = 1;
passed &= typeof Reflect.enumerate === 'undefined';

var proxy = new Proxy({}, {
  enumerate: function() {
    passed = 0;
  }
});
for(var key in proxy);

var keys=""
var proxy = new Proxy({x:1,y:2}, {});
for(var key in proxy){ keys += key;}
passed &= keys==="xy";

// check ownKeys
var keys=""
var proxy = new Proxy({"5":1}, {
  ownKeys: function() {
    return ['a', {y:2}, 5, 'b', Symbol.iterator];
  }
});
try{
  for(var key in proxy);
  passed = false;
}
catch(e){}

// check property descriptor
var keys=""
var proxy = new Proxy({b:1,a:2}, {
  ownKeys: function() {
    return ['a', {y:2}, 5, 'b', Symbol.iterator];
  }
});
try{
  for(var key in proxy);
  passed = false;
}
catch(e){}

var keys=""
var proxy = new Proxy({b:1,a:2}, {
  ownKeys: function() {
    return new Proxy(['a', 'b'],{});
  }
});
for(var key in proxy){ keys += key;}
passed &= keys==="ab";

var keys=""
var proxy = new Proxy({c:1,d:2}, {
  ownKeys: function() {
    return new Proxy(['a', 'b'],{
      get(target, propKey, receiver){
        return Reflect.get(['c', 'd'], propKey, receiver);
      }
    });
  }
});
for(var key in proxy){ keys += key;}
passed &= keys==="cd";

var keys=""
var proxy = new Proxy({b:1,a:2}, {
  ownKeys: function() {
    return {x:1,y:2, '0':'a'};
  }
});
for(var key in proxy){ keys += key;}
passed &= keys==="";

var keys=""
var proxy = new Proxy({b:1,a:2}, {
  ownKeys: function() {
    return {x:1,y:2, '0':'a', length:1};
  }
});
for(var key in proxy){ keys += key;}
passed &= keys==="a";

// check property descriptor trap
var keys=""
var getPrototypeOfCalled = 0;
var proxy = new Proxy({}, {
  ownKeys: function() {
    return ['a','b']; // make a non-enumerable and b enumerable
  },
  getOwnPropertyDescriptor: function(target, key){
    var enumerable = true;
    if(key === "a")
    {
      enumerable=false;
    }
    return {
      configurable: true,
      enumerable: enumerable,
      value: 42,
      writable: true
    };
  },
  getPrototypeOf: function(){
    getPrototypeOfCalled++;
    return null;
  }
});
for(var key in proxy){ keys += key;}
passed &= keys==="b";
passed &= getPrototypeOfCalled===1;

if (passed) {
  WScript.Echo("PASS");
}
