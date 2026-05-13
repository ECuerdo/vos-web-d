name: Next.js CD (Standalone Build)

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Build Application
        run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.NEXT_PUBLIC_API_BASE_URL }}
          NEXT_PUBLIC_AUTH_DISABLED: ${{ secrets.NEXT_PUBLIC_AUTH_DISABLED }}
          SPRING_API_BASE_URL: ${{ secrets.SPRING_API_BASE_URL }}
          DIRECTUS_STATIC_TOKEN: ${{ secrets.DIRECTUS_STATIC_TOKEN }}
          COOKIE_SECURE: ${{ secrets.COOKIE_SECURE }}

      - name: Prepare Standalone Artifact
        run: |
          # Copy public folder to standalone
          cp -r public .next/standalone/public
          
          # Copy static files to standalone/.next/static
          mkdir -p .next/standalone/.next/static
          cp -r .next/static .next/standalone/.next/static

      - name: Upload Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: standalone-build
          path: .next/standalone/
          retention-days: 7
