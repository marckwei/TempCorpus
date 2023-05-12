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

function printError(e) {
    print(e.name);
    print(e.number);
    print(e.description);
}

var isMac = (WScript.Platform.OS === 'darwin');
var isWin = (WScript.Platform.OS === 'win32');

var expects = [
    '#1', // 0
    'In finally',
    'Error: Out of stack space', // 2
    '#2',
    'In finally', // 4
    'Error: Out of stack space',
    '#3', // 6
    'In finally',
    'Error: Out of stack space' // 8
    ];

if (isWin) {
    expects.push('testing stack overflow handling with catch block'); // 9
    expects.push('Error: Out of stack space'); // 10
}

expects.push('testing stack overflow handling with finally block'); // 11
expects.push('Error: Out of stack space'); // 12

if (!isMac) // last test (sometimes) we hit timeout before we hit stackoverflow.
    expects.push('Error: Out of stack space'); // 13

expects.push('END'); // 14

var index = 0;
function printLog(str) {
    if (expects[index++] != str) {
        WScript.Echo('At ' + (index - 1) + ' expected \n' + expects[index - 1] + '\nOutput:' + str);
        WScript.Quit(1);
    }
}

for (var i = 1; i < 4; i++) {
    printLog("#" + i);
    try {
        try {
            function f() {
                f();
            }
            f();
        } finally {
            printLog("In finally");
        }
    }
    catch (e) {
        printLog(e);
    }
}

if (isWin) { // xplat CI timeouts (it doesn't st. overflows as soon as Windows does)
    printLog("testing stack overflow handling with catch block");
    try {
        function stackOverFlowCatch() {
            try {
                stackOverFlowCatch();
                while (true) { }
            }
            catch (e) {
                throw e;
            }
        }
        stackOverFlowCatch();
    }
    catch (e) {
        printLog(e);
    }
}

printLog("testing stack overflow handling with finally block");
try
{
    function stackOverFlowFinally() {
        try {
            stackOverFlowFinally();
            while (true) {
            }
        }
        finally {
            DoSomething();
        }
    }
    stackOverFlowFinally();
}
catch(e) {
    printLog(e);
}

function DoSomething()
{
}

// 10K is not enough for our osx setup.
// for bigger numbers, we hit to timeout on CI (before we actually hit to S.O)
if (!isMac) {
    try
    {
        var count = 100000;

        var a = {};
        var b = a;

        for (var i = 0; i < count; i++)
        {
            a.x = {};
            a = a.x;
        }
        eval("JSON.stringify(b)");
    }
    catch(e) {
        printLog(e);
    }
}

printLog('END'); // do not remove this

WScript.Echo("Pass");
