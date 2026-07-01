import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-primary hover:underline mb-8 block">← Back to FlashMingo</Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 1, 2026</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing FlashMingo, you agree to these Terms of Service. FlashMingo is intended
              for use by students, teachers, and administrators within authorized school districts.
              Access is granted only through your school's Google Workspace account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              FlashMingo is a closed platform. All accounts must be approved by a district
              administrator before gaining access. Accounts are non-transferable and tied to
              your school Google account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Share your account credentials with others</li>
              <li>Upload content that is illegal, harmful, or violates school policy</li>
              <li>Attempt to access another user's data or account</li>
              <li>Use the platform to harass, bully, or harm other users</li>
              <li>Attempt to reverse engineer or tamper with the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Content Ownership</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of flashcard content you create. By making a deck public,
              you grant other users in your district a non-exclusive right to view and study
              that content. You may make your decks private at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Account Suspension</h2>
            <p className="text-muted-foreground leading-relaxed">
              District administrators may suspend or delete accounts that violate these terms
              or school policies. Suspended accounts lose access to all platform features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              FlashMingo is provided "as is" without warranties of any kind. We are not
              responsible for any loss of study data due to unforeseen technical issues,
              though we take reasonable precautions to prevent data loss.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. District administrators will be
              notified of material changes. Continued use of the platform constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these terms? Contact us at <strong>legal@flashmingo.org</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
