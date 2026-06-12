import React from 'react';
import { ArrowUpRight, Github, Instagram, Twitter } from 'lucide-react';

interface FooterProps {
  season?: string;
}

export const Footer: React.FC<FooterProps> = ({ season = '2026' }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Home', href: '/' },
      { label: 'Matches', href: '/matches' },
      { label: 'Teams', href: '/teams' },
      { label: 'Groups', href: '/groups' },
    ],
    Resources: [
      { label: 'API Docs', href: '/docs/api' },
      { label: 'Status', href: '/status' },
      { label: 'Feedback', href: '/feedback' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: <Twitter size={20} />, label: 'Twitter', href: 'https://twitter.com' },
    { icon: <Instagram size={20} />, label: 'Instagram', href: 'https://instagram.com' },
    { icon: <Github size={20} />, label: 'GitHub', href: 'https://github.com' },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/[0.07] bg-[#070a0f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(0,183,255,0.13),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/[0.07] pb-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent">
              World Cup {season}
            </div>
            <h3 className="text-2xl font-black tracking-[-0.03em] text-text-primary">FIFA Bro</h3>
            <p className="mt-4 max-w-sm text-sm font-semibold leading-relaxed text-text-secondary">
              Premium World Cup {season} coverage, fixtures, groups, standings, and editorial storylines.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-text-primary">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:text-accent"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-5 pt-8 md:flex-row">
          <div className="text-center text-sm font-semibold text-text-secondary md:text-left">
            © {currentYear} FIFA Bro. All rights reserved. FIFA World Cup {season}.
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/[0.08] hover:text-accent"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
