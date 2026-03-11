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
