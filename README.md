# Buvsalidzinis - Building Material Price Comparison 

A web application that scrapes construction material prices from different online stores in Latvia (Depo, Ksenukai, etc.) and provides a price comparison.

## Features

- Search for building materials across multiple stores
- Compare prices in one place
- Group similar products

## Tech Stack

- **Backend**: Node.js, Express
- **Web Scraping**: Puppeteer
- **Frontend**: JavaScript, HTML, CSS (to be implemented)

## Setup

1. Clone the repository
   ```
   git clone https://github.com/AleksisVejs/buvsalidzinis.git
   ```

2. Install dependencies
   ```
   cd backend
   npm install
   ```

3. Run the server
   ```
   npm start
   ```

## Project Structure

- `/backend` - Node.js backend code
  - `/routes` - API routes
  - `/scrapers` - Web scraper modules for different stores
  - `/utils` - Utility functions

## API Endpoints

- `POST /api/search` - Start a new search for products
- `GET /api/search/:searchId` - Get search results by search ID
- `GET /api/results/:searchId` - Get results for a search

## Currently Supported Stores

- Depo (online.depo.lv)
- Ksenukai (k-senukai.lv) 