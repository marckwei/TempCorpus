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

var count = 0;
class A {
    constructor() { count++; }
    increment() { count++; }
}
class B extends A {
    constructor() {
        super();
        ((B) => { super.increment() })();
        (A=> { super.increment() })();
        let C = async (B) => { B };
        let D = async A => { A };
    }
}
let b = new B();
class async extends A {
    constructor() {
        super();
        let Q = async A => { A };
    }
}
let a = new async();
if (count !== 4) {
    WScript.Echo('fail');
}

(vjczgj = (function(y) { try{}catch(e){} }), fkvcij = (y)) => {};

(omabpn = (function(x) {return { getOwnPropertyNames: function(){ switch({}) { case 0:  "" ; }},  }; }), pkgrln = (TypeError(x))) => {};

var error = false;
try {
    eval('( oqixuw = function  window () {}, (window)) => undefined;');
}
catch(e) {
    // Above all should throw syntax error on parenthesized name in formals list
    error = true;    
}
if (!error) WScript.Echo('fail');

WScript.Echo('pass');
