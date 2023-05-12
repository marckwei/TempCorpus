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

function write(x) { WScript.Echo(x + ""); }

(function f(x) {
    write(f);
    write(x);
    (function () {
        write(f);
        write(x);
        eval('f = "inner f";');
        eval('x = "inner x";');
        write(f);
        write(x);
        eval('var f = "inner f 2";');
        eval('var x = "inner x 2";');
        write(f);
        write(x);
    })();
    write(f);
    write(x);
})('outer x');

var functest;
var vartest = 0;
var value = (function functest(arg) {
    eval('');
    if (arg) return 1;
    vartest = 1;
    functest = function(arg) {
        return 2;
    }; // this line does nothing as 'functest' is ReadOnly here
    return functest(true); // this is therefore tail recursion and returns 1
})(false);
WScript.Echo('vartest = ' + vartest);
WScript.Echo('value = ' + value);

(function (){
    try {
        throw 'hello';
    }
    catch(e) {
        var f = function(){ eval('WScript.Echo(e)') };
    }
    f();
})();

var moobah = function moobah() {
    this.innerfb = function() {
        moobah.x = 'whatever';
    }
    this.innerfb();
    write(moobah.x);
}

moobah();
