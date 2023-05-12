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

function makeobj(n)
{
    var obj = { };

    for(var i = 0; i < n; ++i)
    {
        obj[i] = 1;
    }

    return obj;
}

function testdelete(n)
{
    for(var propToDelete = 0; propToDelete <= n; ++propToDelete)
    {
        for(var iterToDelete = 0; iterToDelete <= n; ++iterToDelete)
        {
            for(var iterToAdd = 0; iterToAdd <= n; ++iterToAdd)
            {

                WScript.Echo("testing with " + n + " properties");
                WScript.Echo("deleting property number " + propToDelete + " on iteration " + iterToDelete);
                WScript.Echo("adding a property on iteration " + iterToAdd);

                var iter = 0;
                var o = makeobj(n);

                for(var i in o)
                {
                    if(iter == iterToDelete)
                        delete o[propToDelete];

                    if(iter == iterToAdd)
                        o["xxx"] = 1;

                    WScript.Echo(i);

                    ++iter;
                }
            }
        }
    }
}

for(var i = 0; i < 8; ++i)
{
    testdelete(i);
}
