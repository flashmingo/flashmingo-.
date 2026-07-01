import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16 text-sm leading-7 text-slate-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Privacy Policy</h1>
        <p>FlashMingo is designed for K–12 school districts and is committed to protecting student information.</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">What we collect</h2>
        <p>We collect account and profile information needed to provide access to the service, including your school-issued Google Workspace identity and account preferences.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">How we use it</h2>
        <p>We use this information to authenticate users, support classroom study workflows, maintain audit logs, and provide district-admin controls.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Student privacy</h2>
        <p>Student data is not sold or shared for advertising. We support FERPA-aligned practices and provide district administrators with controls for account management and data access.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Your rights</h2>
        <p>Users may request account and data deletion by contacting the district administrator or the service provider through the support process.</p>
      </section>
    </main>
  );
}
