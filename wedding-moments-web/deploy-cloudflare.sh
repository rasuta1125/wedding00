#!/bin/bash

# Cloudflare Pages Deployment Script for WeddingMoments
# This script helps deploy the app to Cloudflare Pages

echo "🚀 WeddingMoments - Cloudflare Pages Deployment"
echo "================================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed"
    echo "📦 Installing wrangler..."
    npm install -g wrangler
fi

echo "✅ Wrangler CLI is installed"
echo ""

# Check if logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare"
    echo "🔑 Please login to Cloudflare..."
    wrangler login
else
    echo "✅ Logged in to Cloudflare"
fi
echo ""

# Check environment variables
echo "🔍 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found"
    echo "📝 Please create .env.local with your Firebase credentials"
    echo "   You can copy .env.example and fill in the values"
    exit 1
fi
echo "✅ Environment variables file found"
echo ""

# Load environment variables
echo "📥 Loading environment variables..."
set -a
source .env.local
set +a
echo "✅ Environment variables loaded"
echo ""

# Validate required environment variables
echo "✔️  Validating environment variables..."
REQUIRED_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done
echo "✅ All required environment variables are set"
echo ""

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

# Set environment variables in Cloudflare Pages
echo "🔧 Setting environment variables in Cloudflare Pages..."
echo "   (You can also set these manually in Cloudflare Dashboard)"
echo ""

read -p "Do you want to set environment variables via CLI? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    for var in "${REQUIRED_VARS[@]}"; do
        echo "Setting $var..."
        echo "${!var}" | wrangler pages secret put "$var" --project-name=weddingmoments
    done
    echo "✅ Environment variables set"
else
    echo "⏭️  Skipping environment variable setup"
    echo "   Please set them manually in Cloudflare Dashboard:"
    echo "   https://dash.cloudflare.com/ > Workers & Pages > weddingmoments > Settings > Environment variables"
fi
echo ""

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy out --project-name=weddingmoments

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "🌐 Your app is now live at:"
    echo "   https://weddingmoments.pages.dev"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Verify all environment variables in Cloudflare Dashboard"
    echo "   2. Test Firebase authentication"
    echo "   3. Test Stripe payment flow"
    echo "   4. Set up custom domain (optional)"
else
    echo ""
    echo "❌ Deployment failed"
    echo "   Please check the error messages above"
fi
