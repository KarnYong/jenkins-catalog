import { Suspense } from "react";
import { connection } from "next/server";
import { pool } from "@/lib/db";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#123e2e_0%,_transparent_55%)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-emerald-300/15 pb-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Academic Programs
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Course Catalog
            </h1>
            <p className="mt-3 text-sm text-emerald-50/70 sm:text-base">
              Browse courses, instructors, and seat counts by semester.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
            <span aria-hidden="true" className="size-2 rounded-full bg-emerald-400" />
            Deployed by Jenkins
          </span>
        </header>

        <Suspense
          fallback={
            <p role="status" className="rounded-2xl border border-emerald-300/15 bg-emerald-950/50 p-6 text-emerald-100/70">
              Loading courses…
            </p>
          }
        >
          <Courses />
        </Suspense>
      </div>
    </main>
  );
}

async function Courses() {
  await connection();

  const [courses] = await pool.query(
    `SELECT c.id, c.code, c.title, c.credits, c.semester, c.seats,
            i.fullname AS instructor
     FROM courses c
     JOIN instructor i ON i.id = c.instructorId
     ORDER BY c.semester, c.code`
  );

  if (courses.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-emerald-300/25 p-8 text-center text-emerald-100/70">
        No courses are listed yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <li
          key={course.id}
          className="flex flex-col rounded-2xl border border-emerald-300/15 bg-emerald-950/50 p-5 shadow-lg shadow-black/15 transition-colors hover:border-emerald-300/40 hover:bg-emerald-950/80"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-lg bg-emerald-400/15 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-200">
              {course.code}
            </span>
            <span className="text-xs font-medium text-emerald-100/70">
              Semester {course.semester}
            </span>
          </div>

          <h2 className="mb-5 text-xl font-semibold tracking-tight">
            {course.title}
          </h2>

          <dl className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/20 px-3 py-2">
              <dt className="text-xs text-emerald-100/70">Credits</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {course.credits}
              </dd>
            </div>
            <div className="rounded-xl bg-black/20 px-3 py-2">
              <dt className="text-xs text-emerald-100/70">Seats</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {course.seats}
              </dd>
            </div>
          </dl>

          <div className="mt-auto border-t border-emerald-300/15 pt-3">
            <p className="text-xs text-emerald-100/70">Instructor</p>
            <p className="mt-1 text-sm font-medium">{course.instructor}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}