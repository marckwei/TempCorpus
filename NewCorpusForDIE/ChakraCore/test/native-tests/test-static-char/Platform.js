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
// Copyright (c) ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var isWindows = !WScript.Platform || WScript.Platform.OS == 'win32';
var path_sep = isWindows ? '\\' : '/';
var isStaticBuild = WScript.Platform && WScript.Platform.LINK_TYPE == 'static';

if (!isStaticBuild) {
    // test will be ignored
    print("# IGNORE_THIS_TEST");
} else {
    var platform = WScript.Platform.OS;
    var arch = WScript.Platform.ARCH;
    var binaryPath = WScript.Platform.BINARY_PATH;
    // discard `ch` from path
    binaryPath = binaryPath.substr(0, binaryPath.lastIndexOf(path_sep));
    var makefile =
"IDIR=" + WScript.Arguments[0] + "/lib/Jsrt \n\
\n\
LIBRARY_PATH=" + binaryPath + "/lib\n\
PLATFORM=" + platform + "\n\
ARCH=" + arch + "\n\
LDIR=$(LIBRARY_PATH)/libChakraCoreStatic.a \n\
\n\
ifeq (darwin, ${PLATFORM})\n\
\tifeq (ARM64, ${ARCH})\n\
\t\tICU4C_LIBRARY_PATH ?= /opt/homebrew/opt/icu4c\n\
\t\else\n\
\t\tICU4C_LIBRARY_PATH ?= /usr/local/opt/icu4c\n\
\tendif\n\
\tCFLAGS=-lstdc++ -I$(IDIR)\n\
\tFORCE_STARTS=-Wl,-force_load,\n\
\tFORCE_ENDS=\n\
\tLIBS=-framework CoreFoundation -framework Security -lm -ldl -Wno-c++11-compat-deprecated-writable-strings \
    -Wno-deprecated-declarations -Wno-unknown-warning-option -o sample.o\n\
\tLDIR+=$(ICU4C_LIBRARY_PATH)/lib/libicudata.a \
    $(ICU4C_LIBRARY_PATH)/lib/libicuuc.a \
    $(ICU4C_LIBRARY_PATH)/lib/libicui18n.a\n\
else\n\
\tCFLAGS=-lstdc++ -I$(IDIR)\n\
\tFORCE_STARTS=-Wl,--whole-archive\n\
\tFORCE_ENDS=-Wl,--no-whole-archive\n\
\tLIBS=-pthread -lm -ldl -licuuc -Wno-c++11-compat-deprecated-writable-strings \
    -Wno-deprecated-declarations -Wno-unknown-warning-option -o sample.o\n\
endif\n\
\n\
testmake:\n\
\t$(CC) sample.cpp dummy-1.c dummy-2.c $(CFLAGS) $(FORCE_STARTS) $(LDIR) $(FORCE_ENDS) $(LIBS)\n\
\n\
.PHONY: clean\n\
\n\
clean:\n\
\trm sample.o\n";

    print(makefile)
}
