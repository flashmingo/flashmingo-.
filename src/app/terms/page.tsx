import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Terms of Service' };

const sections = [
  {
    h: '1. Agreement to Terms',
    p: [
      'These Terms of Service ("Terms") govern access to and use of the FlashMingo platform ("Service") provided to school districts, schools, teachers, and students ("you"). By accessing the Service, you agree to be bound by these Terms.',
      'If you are using the Service under a district agreement, the terms of that agreement control where they conflict with these Terms.',
    ],
  },
  {
    h: '2. Eligibility & Accounts',
    p: [
      'FlashMingo is a closed platform for educational institutions. Access requires a school-issued Google Workspace or Microsoft account; no separate credentials are created or stored.',
      'New accounts remain in a pending state until approved by a district administrator. Accounts are non-transferable and may be suspended or removed by a district administrator at any time.',
    ],
  },
  {
    h: '3. Acceptable Use',
    p: ['You agree not to:'],
    list: [
      'Share account access or attempt to access another user\'s data',
      'Upload content that is unlawful, harmful, or violates school policy',
      'Harass, bully, or target other users',
      'Probe, scan, or test the vulnerability of the Service without written authorization',
      'Reverse engineer, decompile, or resell any part of the Service',
      'Use the Service to develop a competing product',
    ],
  },
  {
    h: '4. Educational Content & Ownership',
    p: [
      'You retain all rights to flashcard content you create. By publishing a deck to a classroom or district library, you grant other authorized users within your district a non-exclusive, revocable license to view and study that content.',
      'You may return a deck to private status at any time. AI-generated draft content is provided as a starting point and should be reviewed by an educator before classroom use.',
    ],
  },
  {
    h: '5. Student Data & Privacy',
    p: [
      'Student personal information is collected and processed solely to provide the Service, consistent with FERPA, COPPA, and applicable state student-privacy laws. Student data is never sold, rented, or used for targeted advertising.',
      'Our full practices are described in the Privacy Policy, which is incorporated into these Terms by reference.',
    ],
  },
  {
    h: '6. Suspension & Termination',
    p: [
      'District administrators may suspend or delete accounts within their district. We may suspend access that threatens the security or integrity of the Service, with notice to the district where practicable.',
      'Upon termination of a district agreement, student data is made available for export and then deleted in accordance with the agreement and applicable law.',
    ],
  },
  {
    h: '7. Disclaimers',
    p: [
      'The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted or error-free.',
    ],
  },
  {
    h: '8. Limitation of Liability',
    p: [
      'To the maximum extent permitted by law, FlashMingo will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, use, or goodwill, arising from or related to your use of the Service.',
    ],
  },
  {
    h: '9. Changes to These Terms',
    p: [
      'We may update these Terms from time to time. Material changes will be communicated to district administrators at least 30 days before taking effect. Continued use of the Service after the effective date constitutes acceptance.',
    ],
  },
  {
    h: '10. Governing Law',
    p: [
      'These Terms are governed by the laws of the state specified in the applicable district agreement, without regard to conflict-of-law principles.',
    ],
  },
  {
    h: '11. Contact',
    p: [
      'Questions about these Terms may be directed to legal@flashmingo.org, or to your district administrator.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm font-medium text-[#1E40AF] hover:underline">← Back to FlashMingo</Link>

        <div className="mb-12 mt-8 border-b border-slate-200 pb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Legal</p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-slate-900">Terms of Service</h1>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm text-slate-500">
            <span>Effective date: July&nbsp;1,&nbsp;2026</span>
            <span>Last updated: July&nbsp;3,&nbsp;2026</span>
          </div>
        </div>

        <div className="space-y-10">
          {sections.map(({ h, p, list }) => (
            <section key={h}>
              <h2 className="mb-3 font-display text-[19px] font-bold tracking-[-0.02em] text-slate-900">{h}</h2>
              {p.map((para) => (
                <p key={para.slice(0, 40)} className="mb-3 text-[15px] leading-[1.7] text-slate-600">{para}</p>
              ))}
              {list && (
                <ul className="mt-2 space-y-2 pl-1">
                  {list.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-[1.6] text-slate-600">
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm leading-[1.65] text-slate-600">
            See also our{' '}
            <Link href="/privacy" className="font-medium text-[#1E40AF] hover:underline">Privacy Policy</Link>
            {' '}for how student data is collected, used, and protected.
          </p>
        </div>
      </div>
    </div>
  );
}
