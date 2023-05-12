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

/*
    Inspecting frames - Map ES6
*/

function foo() {
    let map = new Map();
    map.set();
    bar(map);
    function bar(map) {
        var x = 1; /**loc(bp1):
        evaluate('map',3);
        evaluate('map.set()', 2);
        setFrame(1);
        evaluate('map.size==2');
        evaluate('map.clear()');
        stack();
        **/
    }

    map; /**loc(bp2):evaluate('map', 3)**/
    WScript.Echo('PASSED');
}

function Run() {
    foo();
    foo()
    foo()/**bp:enableBp('bp1');enableBp('bp2')**/;
	foo; /**bp:disableBp('bp1')**/
}

WScript.Attach(Run);
WScript.Detach(Run);
WScript.Attach(Run);
