import React from 'react';
import { Star, ShieldCheck, Lock, CheckCircle2, Award } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext';

export const TestimonialsSection: React.FC = () => {
  const { t } = useI18n();
  const testimonials = [
    {
      name: 'Étienne Nguemo',
      role: t('testimonials.role1'),
      location: 'Bonapriso & Akwa, Douala',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      quote: t('testimonials.quote1')
    },
    {
      name: 'Béatrice Mengue',
      role: t('testimonials.role2'),
      location: 'Yaoundé Realty & Asset Partners',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      quote: t('testimonials.quote2')
    },
    {
      name: 'Armand Tchounkeu',
      role: t('testimonials.role3'),
      location: 'Bastos & Omnisport, Yaoundé',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      rating: 5,
      quote: t('testimonials.quote3')
    }
  ];

  return (
    <section className="py-14 sm:py-20 px-4 md:px-8 lg:px-12 bg-[#faf8ff] relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaedff] text-[#002044] text-[11px] font-bold uppercase tracking-wider mb-3 border border-[#d5e3ff]">
            <Award className="w-3.5 h-3.5 text-[#ff9827]" />
            {t('testimonials.eyebrow')}
          </div>
          <h2 className="text-[1.75rem] sm:text-4xl font-extrabold text-[#002044] tracking-tight leading-tight mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-[#43474f] text-sm sm:text-base leading-relaxed">
            {t('testimonials.intro')}
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible mb-10 sm:mb-16">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[85%] min-[480px]:w-[70%] md:w-auto snap-center bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#002044]/5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4 text-[#ff9827]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#43474f] leading-relaxed italic mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#eaedff]">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover border border-[#002044]/10 shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#002044]">{item.name}</h4>
                  <div className="text-xs text-[#ff9827] font-semibold">{item.role}</div>
                  <div className="text-[11px] text-[#747780]">{item.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Trust & Security Pillars */}
        <div className="rounded-2xl bg-white p-5 md:p-8 shadow-xs border border-[#002044]/5 grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 text-center">
          <div className="flex flex-col items-center">
            <Lock className="w-6 h-6 text-[#002044] mb-2" />
            <span className="text-xs font-bold text-[#002044]">{t('testimonials.ssl')}</span>
            <span className="text-[11px] text-[#747780]">{t('testimonials.sslDesc')}</span>
          </div>

          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-[#ff9827] mb-2" />
            <span className="text-xs font-bold text-[#002044]">{t('testimonials.landAudit')}</span>
            <span className="text-[11px] text-[#747780]">{t('testimonials.landAuditDesc')}</span>
          </div>

          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
            <span className="text-xs font-bold text-[#002044]">{t('testimonials.ohada')}</span>
            <span className="text-[11px] text-[#747780]">{t('testimonials.ohadaDesc')}</span>
          </div>

          <div className="flex flex-col items-center">
            <Award className="w-6 h-6 text-[#0f3563] mb-2" />
            <span className="text-xs font-bold text-[#002044]">{t('testimonials.settlement')}</span>
            <span className="text-[11px] text-[#747780]">{t('testimonials.settlementDesc')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
