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

function test1() {
    function foo () {
        "use strict";
    }
    function bar () {
        function baz () {
            "use strict";
        }
    }
    try {
        foo.caller;  // should throw TypeError
        return false;
    }
    catch (e) {
        bar.caller;  // should pass
        return e instanceof TypeError;
    }
}

function test2() {
    function foo () {
        "use strict";
    }
    function bar () {
        function baz () {
            "use strict";
        }
    }
    try {
        foo.caller = 42;  // should throw TypeError
        return false;
    }
    catch (e) {
        bar.caller = 42;  // should pass
        return e instanceof TypeError;
    }
}

function test3() {
    function foo () {
        "use strict";
    }
    function bar () {
        function baz () {
            "use strict";
        }
    }
    try {
        foo.arguments;  // should throw TypeError
        return false;
    }
    catch (e) {
        bar.arguments;  // should pass
        return e instanceof TypeError;
    }
}

function test4() {
    function foo () {
        "use strict";
    }
    function bar () {
        function baz () {
            "use strict";
        }
    }
    try {
        foo.arguments = 42;  // should throw TypeError
        return false;
    }
    catch (e) {
        bar.arguments = 42;  // should pass
        return e instanceof TypeError;
    }
}

// The following statements should pass.
test1.caller;
test2.caller = 42;
test3.arguments;
test4.arguments = 42;

// The following statements should print "true".
var echo = WScript.Echo;
echo(test1());
echo(test2());
echo(test3());
echo(test4());
