#!/bin/bash
# Exit on any error
set -e

echo "Starting build process..."

# Navigate to the client/frontend directory
# This might be 'client', 'frontend', or similar in your project
if [ -d "client" ]; then
    echo "Changing to client directory..."
    cd client
elif [ -d "frontend" ]; then
    echo "Changing to frontend directory..."
    cd frontend
else
    echo "No client or frontend directory found. Continuing in root."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the frontend
echo "Building frontend..."
npm run build

# Go back to the root directory
cd ..

# Create a dist directory in the root if it doesn't exist
echo "Creating dist directory..."
mkdir -p dist

# Copy built assets to the dist directory
echo "Copying built assets to dist directory..."
if [ -d "client/dist" ]; then
    cp -r client/dist/* dist/
elif [ -d "frontend/dist" ]; then
    cp -r frontend/dist/* dist/
elif [ -d "dist" ]; then
    # If build output is already in a dist directory at root
    echo "Build output already in dist directory"
else
    echo "ERROR: No build output directory found!"
    exit 1
fi

echo "Build completed successfully!"
