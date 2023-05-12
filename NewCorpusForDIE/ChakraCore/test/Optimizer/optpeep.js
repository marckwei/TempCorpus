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

var Count = 0;
var shouldBailout = false;
function test0(){
  var obj0 = {};
  var func0 = function(p0){
    if((shouldBailout ? (Object.defineProperty(obj0, 'prop6', {get: function() { Count++; return 3; }, set: function(_x) { WScript.Echo('obj0.prop6 setter'); }}), 1) : 1)) {
      ((Math.log(obj0.prop6) - Boolean));
11    }
  }
  obj0.prop1 = {prop0: 1, prop1: 1, prop2: 1, prop3: 1, prop4: 1, prop5: 1, prop6: func0(1, 1), prop7: 1};
};

for (var i = 0; i < 2000; i++)
{
    test0();
}


// run code with bailouts enabled
shouldBailout = true;
test0();

if (Count != 1)
{
    WScript.Echo("FAILED\n");
}
else
{
    WScript.Echo("Passed\n");
}

// Windows Blue Bug 416975
function test1(){
  function bar4 (){
    if(bar4())
    {
     }
    return (1 > 1);
  }
  bar4();
};

try{
    test1(); 
}
catch (e) {}
