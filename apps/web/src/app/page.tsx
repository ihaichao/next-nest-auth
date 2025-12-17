import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Next-Nest Auth</h1>
      <p className="home-subtitle">
        A full-stack authentication system built with Next.js, NestJS, tRPC,
        PostgreSQL, and Prisma. Featuring type-safe APIs and secure JWT
        authentication.
      </p>
      <div className="home-buttons">
        <Link href="/signin" className="btn btn-primary">
          Sign In
        </Link>
        <Link href="/signup" className="btn btn-outline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
