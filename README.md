# Gear Share

An Airbnb for gear and tools.
This peer-to-peer gear sharing platform is built as a thesis project. Gear Share enables users to rent out their equipment (sports gear, DIY tools, outdoor equipment, etc.) to others in their community, while also allowing users to discover and book gear for their own needs.

## Project Description

Gear Share is a full-stack web application that connects gear owners with renters, with the purpose of providing an income stream for owners and resources to renters.

### Key Features

- **User Authentication & Profiles**: Secure user registration and authentication system with personalized profiles
- **Gear Listings**: Create, edit, and manage equipment listings with images, descriptions, pricing, and categorization
- **Search & Discovery**: Browse available gear with search functionality and filtering by category
- **Booking System**: Request bookings for specific date ranges with an approval workflow
- **Booking Management**: Owners can approve or decline booking requests; renters can track their booking status
- **Location-Based**: Gear listings are organized by Copenhagen neighborhoods (Amagerbro, Østerbro, Nørrebro, Vesterbro)
- **Category Organization**: Equipment is categorized into DIY, Sports, Outdoor, Photography, and Music
- **Condition Tracking**: Listings include condition ratings (New, Like New, Good, Fair, Poor)

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL database, authentication, serverless functions)
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns, react-day-picker
- **Testing**: Jest, Playwright (E2E testing)
- **Icons**: Lucide React

### Architecture

The application follows Next.js App Router architecture with:
- Server-side rendering for initial page loads
- Client-side interactivity for dynamic components
- Server Actions for data mutations
- Optimistic UI updates for improved user experience
- Real-time booking status updates

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
