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

/**exception(firstchance):stack();**/


function unhandledPromiseRejection1() {
    Promise.resolve(true)
        .then(() => {
            throw new Error('error for unhandledPromiseRejection1')
        });
}
unhandledPromiseRejection1();

function unhandledPromiseRejection2() {
    Promise.resolve(true)
        .then(() => {
            throw new Error('error for unhandledPromiseRejection2');
        })
        .then(() => {
            // no catch
        });
}
unhandledPromiseRejection2();

function unhandledPromiseRejection3() {
    let p = Promise.resolve(true)
        .then(() => {
            throw new Error('error for unhandledPromiseRejection3');
        })
        .then(() => 0);
    p.then(() => 0).then(() => 1); // this path is not caught
    p.then(() => 2, (err) => { }); // this path is caught

}
unhandledPromiseRejection3();

function unhandledPromiseRejection4() {
    let p = Promise.resolve(true)
        .then(() => {
            throw new Error('error for unhandledPromiseRejection3');
        })
        .catch((err) => {
            throw err;
        });
}
unhandledPromiseRejection4();

function handledPromiseRejection5() {
    Promise.resolve(true)
        .then(() => {
            throw new Error('error for handledPromiseRejection5')
        }).catch(() => { });
}
handledPromiseRejection5();

function handledPromiseRejection6() {
    Promise.resolve(true)
        .then(() => {
            throw new Error('error for handledPromiseRejection6');
        })
        .then(() => { }, () => { });
}
handledPromiseRejection6()

function handledPromiseRejection7() {
    let p = Promise.resolve(true)
        .then(() => {
            throw new Error('error for handledPromiseRejection7');
        })
        .then(() => 0);
    p.then(() => 0).then(() => 1).catch(() => { }); // this path is  caught
    p.then(() => 2, (err) => { }); // this path is caught

}
handledPromiseRejection7();

function handledPromiseRejection8() {
    var p = Promise.resolve(0).then(() => {
        p.catch(() => { }); // lazily added catch on the currently executing promise
        throw new Error('error for handledPromiseRejection8');
    });
}
handledPromiseRejection8();

function noRejection9() {
    let p = Promise.resolve(true)
        .then(() => {
            try {
                throw new Error('error for noRejection9');
            } catch (err) {
            }
        });
}
noRejection9();
