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

var output = "";

function echo(o) {
    try {
        document.write(o + "<br/>");
    } catch (ex) {
        try {
            WScript.Echo("" + o);
        } catch (ex2) {
            print("" + o);
        }
    }
}

echo("--- 1 ---");
try { echo(eval('/a\0b/').toString().length); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\n/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\r/")); } catch (e) { echo("EXCEPTION"); }
echo("--- 2 ---");
try { echo(eval("/\\\0/").toString().length); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\\\n/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\\\r/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\\\u2028/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\\\u2029/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\\"));        } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\\\0/").toString().length);     } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/\\\0a/").toString().length); } catch (e) { echo("EXCEPTION"); }
echo("--- 3 ---");
try { echo(eval("/[\n]/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/[\r]/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/[\u2028]/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/[\u2029]/")); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/[\0]/").toString().length); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/[").toString().length); } catch (e) { echo("EXCEPTION"); }
try { echo(eval("/a)/")); } catch (e) { echo("EXCEPTION"); }
echo("--- 4 ---");
try { echo(eval('/\u2028*/').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('/\u2029*/').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('/\r*/').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('/\n*/').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('\0*').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('\0a*').toString().length) } catch (e) { echo("EXCEPTION"); }
echo("--- 5 ---");
try { echo(eval('\\\0*').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('/\\\r*/').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('/\\\n*/').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('/[\r]/').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('/[\n]/').toString().length) } catch (e) { echo("EXCEPTION"); }
try { echo(eval('[\0]').toString().length) } catch (e) { echo("EXCEPTION"); }
