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

//Configuration: Configs\full_with_strings.xml
//Testcase Number: 4018
//Switches: -PrintSystemException  -ArrayMutationTestSeed:2004204769  -maxinterpretcount:1 -maxsimplejitruncount:2 -MinMemOpCount:0 -werexceptionsupport  -MinSwitchJumpTableSize:2 -bgjit- -loopinterpretcount:1 -MaxLinearStringCaseCount:2 -MaxLinearIntCaseCount:2 -on:CaptureByteCodeRegUse -force:rejit -PoisonIntArrayLoad- -force:ScriptFunctionWithInlineCache -force:atom -force:fixdataprops
//Baseline Switches: -nonative -werexceptionsupport  -PrintSystemException  -ArrayMutationTestSeed:2004204769
//Arch: x86
//Flavor: debug
//BuildName: chakrafull.full
//BuildRun: 180827_0314
//BuildId: 
//BuildHash: 
//BinaryPath: \\chakrafs\fs\Builds\ChakraFull\unreleased\rs5\1808\00025.55398_180827.0925_sethb_4fd79162a0d5cbf937f5f47fa77d55a211ea9c2b\bin\x86_debug
//MachineName: master-vm
//Reduced Switches: -printsystemexception -maxinterpretcount:1 -maxsimplejitruncount:2 -werexceptionsupport -bgjit- -loopinterpretcount:1 -bvt -oopjit- 
//noRepro switches0: -printsystemexception -maxinterpretcount:1 -maxsimplejitruncount:2 -werexceptionsupport -bgjit- -loopinterpretcount:1 -bvt -oopjit-  -off:DynamicProfile
//noRepro switches1: -printsystemexception -maxinterpretcount:1 -maxsimplejitruncount:2 -werexceptionsupport -bgjit- -loopinterpretcount:1 -bvt -oopjit-  -off:InterpreterAutoProfile
//noRepro switches2: -printsystemexception -maxinterpretcount:1 -maxsimplejitruncount:2 -werexceptionsupport -bgjit- -loopinterpretcount:1 -bvt -oopjit-  -off:InterpreterProfile
//noRepro switches3: -printsystemexception -maxinterpretcount:1 -maxsimplejitruncount:2 -werexceptionsupport -bgjit- -loopinterpretcount:1 -bvt -oopjit-  -off:JITLoopBody
//noRepro switches4: -printsystemexception -maxinterpretcount:1 -maxsimplejitruncount:2 -werexceptionsupport -bgjit- -loopinterpretcount:1 -bvt -oopjit-  -off:SimpleJit
function test0() {
  var __loopvar0 = -4;
  while (true) {
    __loopvar0 += 2;
    if (__loopvar0 > 3) {
      break;
    }

    if ('caller') {
      var strvar9 = '';
    } else {
      var strvar9 = '';
      do {
        (strvar9 + protoObj0)();
      } while ('');

      return this;
    }
  }
}

test0();
test0();
WScript.Echo("Pass");
 
  // === Output ===
  // command: D:\\BinariesCache\\1808\00025.55398_180827.0925_sethb_4fd79162a0d5cbf937f5f47fa77d55a211ea9c2b\bin\x86_debug\jshost.exe -printsystemexception -maxinterpretcount:1 -maxsimplejitruncount:2 -werexceptionsupport -bgjit- -loopinterpretcount:1 -bvt -oopjit-  step.js
  // exitcode: 0xC0000005
  // stdout:
  // 
  // stderr:
  // FATAL ERROR: jshost.exe failed due to exception code c0000005
  // 
  // 
  // 
