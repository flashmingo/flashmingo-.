'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-600">
          <p>© {currentYear} Kenmei. Secure learning platform for K-12 education.</p>
          <p className="mt-2">
            <a href="#" className="text-sakura-600 hover:text-sakura-700">
              Privacy Policy
            </a>
            {' • '}
            <a href="#" className="text-sakura-600 hover:text-sakura-700">
              Terms of Service
            </a>
            {' • '}
            <a href="#" className="text-sakura-600 hover:text-sakura-700">
              Contact Us
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
