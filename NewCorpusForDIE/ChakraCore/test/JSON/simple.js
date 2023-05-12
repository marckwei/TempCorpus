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

var jsonBlobL1AsString = "{\"a\":1, \"b\":2}"
var jsonBlobL2AsString = "{\"a\":{\"aa\":10, \"ab\":11}, \"b\":{\"ba\":\"this is\\t a test!\", \"bb\":\"a\"}}"

TraverseAndPrint("level 1:", jsonBlobL1AsString, false);
TraverseAndPrint("level 1+:", jsonBlobL1AsString, true);


TraverseAndPrint("level 1:", jsonBlobL2AsString, false);
TraverseAndPrint("level 1+:", jsonBlobL2AsString, true);


function TraverseAndPrint(msg, str, doRecurse) {
  WScript.Echo("---------------");
  WScript.Echo(msg);
  WScript.Echo(str);

  var json = JSON.parse(str);
  str = "foo";
  WScript.Echo("JSON.Parse result - " + json);

  TraverseJSONObject(msg, 1, json, doRecurse);
  WScript.Echo("---------------");
}

function TraverseJSONObject(msg, level, o, doRecurse) {
  doRecurse = doRecurse || false;
  var sp = "";
  for(var i=1; i<level; i++) {
    sp += "  ";
  }

  for(var l in o) {
    WScript.Echo(msg + sp + l + ": " + o[l]);
    if (doRecurse) {
      TraverseJSONObject(msg, level+1, o[l]);
    }
  }
}
