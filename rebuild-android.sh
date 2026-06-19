#!/bin/bash

# Beedi Management App - Rebuild Script for AsyncStorage
# This script rebuilds the Android app to link AsyncStorage native module

echo "🔧 Cleaning Android build..."
cd android
./gradlew clean
cd ..

echo "📦 Rebuilding and running Android app..."
npx react-native run-android

echo "✅ Done! The app should now have AsyncStorage properly linked."
