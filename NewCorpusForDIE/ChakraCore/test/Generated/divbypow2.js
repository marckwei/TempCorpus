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

// -forcenative -prejit 
(function(){
  var obj0 = 1;
  var obj1 = new Object();
  var func0 = function(p0,p1,p2){
    var d = (obj1.a++ );
  }
  var ary = 1;
  if((ary[(1)] * (obj1.c = -1073741824))) {
  }
  else {
    obj0.length = (obj1.a ^= obj1.c);
    var b = 1;
  }
  d = (obj1.a /= -2147483648);
  obj1.c %=func0((-- b), 1);
  WScript.Echo("obj1.a = " + (obj1.a|0));;
})();

// command line: -forcenative 
(function(){
  var obj0 = new Object();
  var obj1 = new Object();
  var func1 = function(){
    obj0.length +=(((obj0.a = obj1.length) ? (b /= -2147483648) : 1) * (c = 1));
    a +=(c *= obj0.length);
  }
  var a = 1;
  var b = -1073741824;
  obj0.length = -2147483648;
  obj1.length = 1198215329.1;
  if(((func1() === 1) > (1 | (obj0.a * c)))) {
  }
  else {
    (f);
  }
})();
