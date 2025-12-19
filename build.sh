#!/bin/bash

# =============================================================================
# Wacap Docker Multi-Platform Build Script
# =============================================================================
# 
# Usage:
#   ./build.sh              # Build and push with default tag (latest)
#   ./build.sh v1.0.0       # Build and push with specific tag
#   ./build.sh latest local # Build locally without push (single platform)
#
# =============================================================================

set -e

# Configuration
IMAGE_NAME="bangfkr/wacap"
TAG="${1:-latest}"
MODE="${2:-push}"

echo "🐳 Wacap Docker Build"
echo "===================="
echo "Image: ${IMAGE_NAME}:${TAG}"
echo "Mode: ${MODE}"
echo ""

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Docker buildx not found. Please install Docker Desktop or enable buildx."
    exit 1
fi

# Create builder if not exists
BUILDER_NAME="wacap-builder"
if ! docker buildx inspect ${BUILDER_NAME} > /dev/null 2>&1; then
    echo "📦 Creating buildx builder..."
    docker buildx create --name ${BUILDER_NAME} --use --bootstrap
else
    docker buildx use ${BUILDER_NAME}
fi

if [ "$MODE" = "local" ]; then
    # Local build (single platform, no push)
    echo "🔨 Building for local platform only..."
    docker build -t ${IMAGE_NAME}:${TAG} .
    echo ""
    echo "✅ Local build complete: ${IMAGE_NAME}:${TAG}"
else
    # Multi-platform build and push
    echo "🔨 Building for linux/amd64 and linux/arm64..."
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        -t ${IMAGE_NAME}:${TAG} \
        --push \
        .
    
    echo ""
    echo "✅ Multi-platform build complete and pushed!"
    echo "   - linux/amd64 (Intel/AMD servers)"
    echo "   - linux/arm64 (ARM servers, Apple Silicon)"
fi

echo ""
echo "🎉 Done! Image: ${IMAGE_NAME}:${TAG}"
