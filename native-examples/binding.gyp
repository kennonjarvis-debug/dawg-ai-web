{
  "targets": [
    {
      "target_name": "vst3_bridge",
      "sources": ["vst3-bridge.cpp"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "/path/to/VST_SDK/pluginterfaces",
        "/path/to/VST_SDK/public.sdk",
        "/path/to/VST_SDK/base"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "cflags_cc": ["-std=c++17"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "libraries": [],
      "conditions": [
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.13",
            "OTHER_CFLAGS": ["-std=c++17"]
          }
        }],
        ["OS=='win'", {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          }
        }]
      ]
    },
    {
      "target_name": "au_bridge",
      "sources": ["au-bridge.mm"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "conditions": [
        ["OS=='mac'", {
          "link_settings": {
            "libraries": [
              "-framework AudioToolbox",
              "-framework CoreAudio",
              "-framework Foundation"
            ]
          },
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.13"
          }
        }],
        ["OS!='mac'", {
          "type": "none"
        }]
      ]
    }
  ]
}
