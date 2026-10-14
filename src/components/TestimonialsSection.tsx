import React from 'react';
import { Star, ShieldCheck, Lock, CheckCircle2, Award } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Étienne Nguemo',
      role: 'Owner of 4 Residential Complexes',
      location: 'Bonapriso & Akwa, Douala',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      quote:
        'Before FindNdap, tracking rent deposits from 48 tenants took 10 days of physical bank visits and manual receipts. Now, 98% of rent lands via MTN MoMo and Orange Money directly in our account with automated PDF receipts before the 5th of every month.'
    },
    {
      name: 'Béatrice Mengue',
      role: 'Licensed Senior Broker (RCCM Verified)',
      location: 'Yaoundé Realty & Asset Partners',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      quote:
        'As a certified agent, the building registration portal allows me to onboard full complexes with their Titre Foncier in under 15 minutes. Tenants and diaspora buyers trust us because only certified, audited brokers can register buildings.'
    },
    {
      name: 'Armand Tchounkeu',
      role: 'Managing Director, Cité Verte Properties',
      location: 'Bastos & Omnisport, Yaoundé',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      quote:
        'The maintenance work-order hub cut our repair triage time from 3 days to under 4 hours. Tenants upload photos of booster pumps or transfer switches, and our contracted technicians dispatch immediately with transparent cost tracking.'
    }
  ];

  return (
    <section className="py-20 px-4 md:px-8 lg:px-12 bg-[#faf8ff] relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaedff] text-[#002044] text-[11px] font-bold uppercase tracking-wider mb-3 border border-[#d5e3ff]">
            <Award className="w-3.5 h-3.5 text-[#ff9827]" />
            Proven Across CEMAC &amp; West Africa
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002044] tracking-tight mb-4">
            Trusted by Institutional Landlords and Top Certified Brokers
          </h2>
          <p className="text-[#43474f] text-base leading-relaxed">
            Real property owners share how FindNdap eliminated rent defaults, automated maintenance, and brought institutional trust to African rental markets.
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#002044]/5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4 text-[#ff9827]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#43474f] leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#eaedff]">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border border-[#002044]/10 shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#002044]">{t.name}</h4>
                  <div className="text-xs text-[#ff9827] font-semibold">{t.role}</div>
                  <div className="text-[11px] text-[#747780]">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Trust & Security Pillars */}
        <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xs border border-[#002044]/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Lock className="w-6 h-6 text-[#002044] mb-2" />
            <span className="text-xs font-bold text-[#002044]">256-Bit SSL Encryption</span>
            <span className="text-[11px] text-[#747780]">Tenant identity protection</span>
          </div>

          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-[#ff9827] mb-2" />
            <span className="text-xs font-bold text-[#002044]">Cadastral Land Audit</span>
            <span className="text-[11px] text-[#747780]">Titre Foncier verified</span>
          </div>

          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
            <span className="text-xs font-bold text-[#002044]">OHADA Compliant Leases</span>
            <span className="text-[11px] text-[#747780]">Enforceable digital agreements</span>
          </div>

          <div className="flex flex-col items-center">
            <Award className="w-6 h-6 text-[#0f3563] mb-2" />
            <span className="text-xs font-bold text-[#002044]">Instant MoMo Settlement</span>
            <span className="text-[11px] text-[#747780]">MTN &amp; Orange Money gateways</span>
          </div>
        </div>
      </div>
    </section>
  );
};
