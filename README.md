# Half Million Cafe — Frontend

This is the frontend for my graduation project. Half Million is a cafe web app where customers can browse the menu, place orders, book a table, and manage their profile. There's also an admin side where staff can manage everything.

## What's in it

- Login, register, and profile pages
- Menu page with category filtering
- Cart and checkout
- Table booking
- FAQ page
- Admin dashboard — manage users, orders, bookings, menu items and categories

## Tech stack

I used React 19 with Vite for the build setup since it's fast and easy to work with. Routing is handled by React Router, and all API calls go through Axios. Styling is done with plain CSS files per component.

## Running it

Make sure the backend is running first, then:

```bash
npm run dev
```

## Folder structure

```
src/
  api/          axios setup
  components/   reusable UI sections (Home, About)
  context/      auth state
  layout/       navbar, topbar, footer
  pages/        one folder per route
```

> The backend repo is separate. You'll need it running for login, orders, and everything dynamic to work.

