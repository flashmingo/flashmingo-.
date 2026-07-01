import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-primary hover:underline mb-8 block">← Back to FlashMingo</Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 1, 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-lg font-semibold mb-2">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              FlashMingo is an educational flashcard platform designed for K–12 school districts.
              We are committed to protecting student privacy in compliance with the Family Educational
              Rights and Privacy Act (FERPA) and applicable state student data privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">We collect only the minimum data necessary to operate the platform:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Name and email address provided by your school's Google Workspace</li>
              <li>Flashcard decks and cards you create</li>
              <li>Study session activity (cards reviewed, accuracy, timestamps)</li>
              <li>Classroom memberships assigned by your teacher</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>To provide and operate the FlashMingo service</li>
              <li>To display study progress to your teacher (if enrolled in a classroom)</li>
              <li>To power spaced repetition — showing you the right cards at the right time</li>
              <li>To maintain district leaderboards (opt-in only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. What We Do Not Do</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>We do not sell student data to any third party</li>
              <li>We do not use student data for advertising or marketing</li>
              <li>We do not share data across districts</li>
              <li>We do not use student data to build profiles for non-educational purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. FERPA Compliance</h2>
            <p className="text-muted-foreground leading-relaxed">
              FlashMingo operates as a "school official" under FERPA when contracted by a school
              district. Student education records are accessible only to authorized school personnel.
              Parents and eligible students may request access to or deletion of their records by
              contacting their district administrator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Data Deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              District administrators can permanently delete a student's data at any time via the
              Admin Dashboard. This removes all decks, cards, study sessions, and profile data
              associated with that student and cannot be undone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              All data is stored in Supabase (PostgreSQL) with row-level security policies enforced.
              Authentication is handled exclusively via Google Workspace SSO — no passwords are
              stored by FlashMingo. All data is encrypted in transit via TLS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy questions or data deletion requests, contact your district administrator
              or reach us at <strong>privacy@flashmingo.org</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
