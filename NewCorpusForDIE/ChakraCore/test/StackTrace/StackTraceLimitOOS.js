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

var output = (function(){
    var glob = this;
    var buf = "";
    return {
        clear: function() {
            buf = "";
        },
        echo: function(s) {
            buf += s + "\n";
        },
        all: function() {
            return buf;
        },
        first: function(lines) {
            var i = -1, len;
            while (lines--) {
                i = buf.indexOf("\n", i + 1);
                if (i < 0) {
                    break;
                }
                len = i;
            }
            return buf.substring(0, len);
        },
        last: function(lines) {
            var i = buf.length;
            while (lines--) {
                if (i < 0) {
                    break;
                }
                i = buf.lastIndexOf("\n", i - 1);
            }
            return buf.substring(i);
        },
        capture: function(f) {
            glob.echo = this.echo;
            f();
            glob.echo = undefined;
        }
    };
})();

function Dump(output)
{
    if (this.echo)
    {
        this.echo(output);
    }
    else if (this.WScript)
    {
        WScript.Echo(output);
    }
    else
    {
        alert(output);
    }
}

function throwExceptionWithCatch()
{
    try
    {
        throwException();
    }
    catch(e)
    {
        Dump(TrimStackTracePath(e.stack));
    }
}

function throwException()
{
    function foo() {
        bar();
    }
    function bar() {
        foo();
    }
    foo();
}

function runtest(catchException)
{
    return catchException == undefined ? throwExceptionWithCatch() : throwException();
}

if (this.WScript && this.WScript.LoadScriptFile) {
    this.WScript.LoadScriptFile("../UnitTestFramework/TrimStackTracePath.js");
}

Error.stackTraceLimit = Infinity;
Dump("Error.stackTraceLimit: " + Error.stackTraceLimit);
output.capture(runtest);
Dump(output.first(1) + "\n   ..." + output.last(20));
