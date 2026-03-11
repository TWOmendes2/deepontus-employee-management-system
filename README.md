# Deepontus

Deepontus is a web-based employee management and internal operations system built to centralize time tracking, employee profiles, internal requests, calendar view and financial monitoring in a single interface.

The project was designed with a strong focus on clean UI, modular structure and practical day-to-day operations. It combines a multi-page frontend built with HTML, CSS and vanilla JavaScript with Supabase for authentication, database access and SQL migrations.

## Overview

This project was created as an internal management solution for employee operations, including:

- employee login
- personal profile management
- time and attendance workflow
- calendar visualization
- individual financial area
- admin dashboard
- employee management panel
- pending requests and approvals
- admin financial monitoring

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Supabase
- SQL Migrations
- LocalStorage

## Features

### Employee Area
- secure login flow
- personal dashboard
- employee profile page
- financial page
- calendar page

### Admin Area
- employee list and management
- password reset workflow
- financial overview
- request approval panel
- attendance adjustments and attestations handling

## Project Structure

```bash
.
├── admin
│   ├── employees.html
│   ├── finance.html
│   └── requests.html
├── assets
│   ├── css
│   ├── img
│   └── js
├── migrations
├── supabase
│   └── migrations
├── calendar.html
├── dashboard.html
├── finance.html
├── index.html
├── login.html
└── profile.html


## Database

The project includes SQL migration files for employee profile creation and expansion, including fields related to identification, contact information and CLT-related registration data.

## Setup

1. Clone the repository

2. Configure your Supabase project

3. Create a config.js file based on config.example.js

4. Run the SQL migrations in your Supabase SQL editor

5. Open index.html in your browser or deploy the project in a static hosting environment

## Supabase Config Example
window.DEEPONTUS_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
};

## Deployment

This project can be deployed on static hosting platforms such as:

Vercel

Netlify

GitHub Pages


## Notes

This repository is presented as a portfolio case focused on interface architecture, workflow organization and integration with Supabase.

Author

Developed by Felipe Mendes.
