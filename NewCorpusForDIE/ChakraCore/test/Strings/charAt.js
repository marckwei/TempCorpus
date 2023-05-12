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


function write(v) { WScript.Echo(v + ""); }

function allChars(s, len) {
    write("AllChars : " + s + ". Length : " + len);
    for (var i=0; i<len; ++i) {
        write(s.charAt(i));
    }
}

function firstChar(obj, showOutput) {
    if (showOutput != false)
        write(">> FirstChar : " + obj);
        
    try {
        write(String.prototype.charAt.call(obj, 0));
    } catch (e) {
        write("Got a exception. " + e.message);
        return;
    }
    
    if (showOutput != false)
        write("<< FirstChar.");
}

allChars("Hello", 5);
allChars("Hello" + "World", 10);

var objs = [ /*null,*/ undefined, 0, 1.1, new Number(10), new String("Hello"), 
             true, false, new Boolean(true), new Object() ];
 
firstChar(null, false);

for (var i=0; i<objs.length; ++i) {
    firstChar(objs[i]);
}
