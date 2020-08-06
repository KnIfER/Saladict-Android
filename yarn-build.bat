@echo off
for /l %%i in (1,1,999) do (
  @echo off
  set /p a=BUILD
  yarn devbuild
  @echo off
)