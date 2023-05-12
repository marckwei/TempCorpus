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

function write(v) { WScript.Echo("" + v); }

var x = ['x'];
x.call1 = function() { write('In x.call1: this = ' + this) };

var y = ['y'];
y.call1 = function() { write('In y.call1: this = ' + this) };

function call1()
{
    write('In call1: this = ' + this);
}

function call2()
{
    write('In call2: this = ' + this);
}

var savecall1 = call1;
call1(call1 = call2);
call1 = savecall1;

savecall1 = x.call1;
x.call1(x.call1 = call1);
x.call1 = savecall1;

var savex = x;
x.call1(x.call1 = y.call1);
x = savex;
x.call1 = savecall1;

var s = 'call1';
x[x = s]();
x = savex;

x[s](s = 'call2');
s = 'call1';

x[s](x[s] = y.call1);
x[s] = x.call1;

(function() {
    // Now try the same set of stuff when call target components are local.

    var x = ['x'];
    x.call1 = function() { write('In x.call1: this = ' + this) };

    var y = ['y'];
    y.call1 = function() { write('In y.call1: this = ' + this) };

    function call1()
    {
        write('In call1: this = ' + this);
    }

    function call2()
    {
        write('In call2: this = ' + this);
    }

    var savecall1 = call1;
    call1(call1 = call2);
    call1 = savecall1;

    savecall1 = x.call1;
    x.call1(x.call1 = call1);
    x.call1 = savecall1;

    var savex = x;
    x.call1(x.call1 = y.call1);
    x = savex;
    x.call1 = savecall1;

    var s = 'call1';
    x[x = s]();
    x = savex;

    x[s](s = 'call2');
    s = 'call1';

    x[s](x[s] = y.call1);
    x[s] = x.call1;
})();

(function() {
var evalExpr = '' +
    'var x = ["x"];' +
    'x.call1 = function() { write("In x.call1: this = " + this) };' +

    'var y = ["y"];' +
    'y.call1 = function() { write("In y.call1: this = " + this) };' +

    'function call1()' +
    '{' +
        'write("In call1: this = " + this);' +
    '}' +

    'function call2()' +
    '{' +
        'write("In call2: this = " + this);' +
    '}' +

    'var savecall1 = call1;' +
    'call1(call1 = call2);' +
    'call1 = savecall1;' +

    'savecall1 = x.call1;' +
    'x.call1(x.call1 = call1);' +
    'x.call1 = savecall1;' +

    'var savex = x;' +
    'x.call1(x.call1 = y.call1);' +
    'x = savex;' +
    'x.call1 = savecall1;' +

    'var s = "call1";' +
    'x[x = s]();' +
    'x = savex;' +

    'x[s](s = "call2");' +
    's = "call1";' +

    'x[s](x[s] = y.call1);' +
    'x[s] = x.call1;';

    eval(evalExpr);
})();

// Verify that we assign regs properly in a compound assignment to function call result.
// Note: this will cease to be a valid test when early reference errors are thrown by default.
function test5921858() {
    function eval([]){}
    function shapeyConstructor(fujzty){
        Object.defineProperty(this, "a", 
                              ({value: ((eval("true", window)) ^= z), writable: true, configurable: false}));
    }
}
