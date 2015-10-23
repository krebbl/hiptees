#!/bin/bash
echo "Building rappid app"
rappidjs build
echo "Builing cordova app"
( cd cordova ; cordova build ios)
echo "Starting emulator"
ios-sim launch ./cordova/platforms/ios/build/emulator/Hiptees.app --devicetypeid "com.apple.CoreSimulator.SimDeviceType.iPhone-6"
exit 1




