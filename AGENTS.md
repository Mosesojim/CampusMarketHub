# CampusMarket Development Guide

## Project Overview
Building a React-based Single Page Application (SPA) for a campus marketplace named "CampusMarket".

## Core Principles
- **Strict UI Match**: The application must strictly mirror the UI/UX, layout, and functionality of the provided reference (`https://vendor-hub--mosesojin.replit.app/`). Do not deviate from the reference design.
- **Architecture**: Client-side React application using Vite, `wouter` for routing, and Lucide React for icons.
- **Styling**: Tailwind CSS v4 with custom CSS variables defined in `index.css`. Use `Plus Jakarta Sans` for sans-serif and `Space Mono` for monospace typography.

## Current Routes
- `/` - Marketplace Feed
- `/auth` - Authentication Portal (Login/Register tabs)
- `/vendor` - Vendor Dashboard
- `/products/:id` - Product Details
- `/cart` - Shopping Cart
- `/admin` - Admin Panel

## Status
Tailwind styling has been fixed and initialized in the Vite config. The base UI components are structurally mirroring the reference HTML. Next steps involve wiring up real backend connections, interactivity, or further refining specific views.
