import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16 text-sm leading-7 text-slate-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Terms of Service</h1>
        <p>These terms govern use of FlashMingo for educational and district-approved purposes.</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Acceptable use</h2>
        <p>Users must use the service in a lawful, respectful, and school-appropriate manner. Inappropriate or harmful content is not permitted.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">School district use</h2>
        <p>District administrators may manage user access, approvals, and reporting controls in accordance with their policies and applicable laws.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Limitation of liability</h2>
        <p>FlashMingo is provided for educational use and is not a substitute for district policy or legal advice.</p>
      </section>
    </main>
  );
}
