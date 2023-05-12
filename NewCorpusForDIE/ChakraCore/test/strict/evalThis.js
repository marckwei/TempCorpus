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

"use strict";

var echo = WScript.Echo;

echo("** Checking 'this' using 'eval' in global scope");
eval("echo(this);");
eval("'use strict'; echo(this);");
eval("eval('echo(this);');");
eval("'use strict'; eval('echo(this);');");

echo("** Checking 'this' using 'my_eval' in global scope");
var my_eval = eval;
my_eval("echo(this);");
my_eval("'use strict'; echo(this);");
my_eval("eval('echo(this);');");
my_eval("'use strict'; eval('echo(this);');");

function foo() {
    echo("** Checking 'this' using 'eval' in function scope");
    eval("echo(this);");
    eval("'use strict'; echo(this);");
    eval("eval('echo(this);');");
    eval("'use strict'; eval('echo(this);');");

    echo("** Checking 'this' using 'my_eval' in function scope");
    var my_eval = eval;
    my_eval("echo(this);");
    my_eval("'use strict'; echo(this);");
    my_eval("eval('echo(this);');");
    my_eval("'use strict'; eval('echo(this);');");
}
foo();
