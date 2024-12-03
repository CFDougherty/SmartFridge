# Additional clean files
cmake_minimum_required(VERSION 3.16)

if("${CONFIG}" STREQUAL "" OR "${CONFIG}" STREQUAL "Debug")
  file(REMOVE_RECURSE
  "CMakeFiles\\smart_fridget1_autogen.dir\\AutogenUsed.txt"
  "CMakeFiles\\smart_fridget1_autogen.dir\\ParseCache.txt"
  "smart_fridget1_autogen"
  )
endif()
