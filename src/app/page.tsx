import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { landingContent } from "@/content/bg";

export const dynamic = "force-dynamic";

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold leading-tight text-[var(--foreground)] md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm text-zinc-700 md:text-base">{subtitle}</p> : null}
    </div>
  );
}

export default function HomePage() {
  const { hero, navItems, problem, solution, features, metrics, logos, testimonials, faq, finalCta } =
    landingContent;

  return (
    <div className="sa-landing min-h-screen">
      <header className="sa-top-nav sticky top-0 z-40 border-b border-white/70 bg-[var(--background)]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <BrandLogo priority className="h-auto w-[170px]" />

          <nav className="hidden items-center gap-5 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm font-medium text-zinc-700 transition hover:text-[var(--brand-ink)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand)] md:px-4"
            >
              {hero.primaryCtaLabel}
            </Link>
            <Link
              href="/zayavka-za-demo"
              className="rounded-full bg-[var(--brand-ink)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--brand)] md:px-4"
            >
              {hero.secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16">
        <section id="hero" className="sa-reveal pt-10 pb-14 md:pt-14">
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="sa-card sa-card-premium p-7 md:p-10">
              <p className="inline-block rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-xs font-bold tracking-[0.12em] text-[var(--brand-ink)]">
                {hero.badge}
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-[var(--brand-ink)] md:text-5xl">
                {hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-zinc-700 md:text-base">{hero.subtitle}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-[var(--brand-ink)] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand)]"
                >
                  {hero.primaryCtaLabel}
                </Link>
                <Link
                  href="/zayavka-za-demo"
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5 hover:border-[var(--brand)]"
                >
                  {hero.secondaryCtaLabel}
                </Link>
              </div>

              <div className="mt-7 grid gap-2 md:grid-cols-3">
                {hero.trustPoints.map((point) => (
                  <div key={point} className="rounded-xl border border-[var(--line)] bg-white/75 p-3 text-xs font-semibold text-zinc-700">
                    {point}
                  </div>
                ))}
              </div>
            </article>

            <aside className="sa-card sa-card-premium p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Преглед на платформата</p>
              <h3 className="mt-2 text-lg font-bold text-[var(--brand-ink)]">Център за управление на човешкия риск</h3>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <p className="text-xs text-zinc-500">Организационен риск</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--brand-ink)]">64/100</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                    <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                    <p className="text-xs text-zinc-500">Клик върху фишинг</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--brand-ink)]">28%</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                    <p className="text-xs text-zinc-500">Докладване</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--brand-ink)]">46%</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <p className="text-xs text-zinc-500">Най-рисков модел</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-700">
                    Социално инженерство с телефонен натиск и OTP искане
                  </p>
                  <p className="mt-3 text-xs text-[var(--brand)]">Автоматично назначен последващ модул за 14 дни</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="problem" className="sa-reveal py-10">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="sa-card p-6 md:p-7">
              <SectionHeading eyebrow={problem.eyebrow} title={problem.title} subtitle={problem.body} />
              <ul className="mt-5 space-y-3 text-sm text-zinc-700">
                {problem.risks.map((risk) => (
                  <li key={risk} className="rounded-xl border border-[var(--line)] bg-zinc-50 px-4 py-3">
                    {risk}
                  </li>
                ))}
              </ul>
            </article>

            <article id="solution" className="sa-card sa-card-premium p-6 md:p-7">
              <SectionHeading eyebrow={solution.eyebrow} title={solution.title} subtitle={solution.body} />
              <div className="mt-5 grid gap-3">
                {solution.outcomes.map((outcome, index) => (
                  <div key={outcome} className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Резултат {index + 1}</p>
                    <p className="mt-1 text-sm text-zinc-700">{outcome}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="features" className="sa-reveal py-10">
          <SectionHeading
            eyebrow="Ключови възможности"
            title="Ключови възможности за бизнес екипи"
            subtitle="Всеки компонент е ориентиран към по-малко инциденти и по-добри управленски решения."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <article key={feature.title} className="sa-card sa-hover-lift p-5">
                <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)]/12 text-sm font-bold text-[var(--brand-ink)]">
                  {index + 1}
                </p>
                <h3 className="mt-3 text-lg font-bold text-[var(--brand-ink)]">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-700">{feature.body}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                  {feature.outcome}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="metrics" className="sa-reveal py-10">
          <SectionHeading
            eyebrow="Резултати и доверие"
            title="Демо метрики, които говорят на езика на мениджмънта"
            subtitle="Показателите са създадени да подкрепят решения за обучение, риск и съответствие."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.label} className="sa-card p-5">
                <p className="text-3xl font-bold text-[var(--brand-ink)]">{metric.value}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-800">{metric.label}</p>
                <p className="mt-2 text-xs text-zinc-600">{metric.hint}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="sa-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Компании в демо сценарии</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {logos.map((logo) => (
                  <div
                    key={logo}
                    className="rounded-xl border border-[var(--line)] bg-white px-3 py-4 text-center text-xs font-semibold text-zinc-700"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </article>

            <article className="sa-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Клиентски отзиви</p>
              <div className="mt-4 space-y-3">
                {testimonials.map((item) => (
                  <blockquote key={item.author} className="rounded-xl border border-[var(--line)] bg-white p-4">
                    <p className="text-sm text-zinc-700">“{item.quote}”</p>
                    <footer className="mt-3 text-xs font-semibold text-[var(--brand-ink)]">
                      {item.author} · {item.role}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="faq" className="sa-reveal py-10">
          <SectionHeading
            eyebrow="FAQ"
            title="Често задавани въпроси"
            subtitle="Кратки отговори за внедряване, употреба и бизнес стойност."
          />

          <div className="mt-6 space-y-3">
            {faq.map((item) => (
              <details key={item.question} className="sa-card group overflow-hidden p-0">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[var(--brand-ink)] marker:content-none">
                  {item.question}
                </summary>
                <div className="border-t border-[var(--line)] px-5 py-4 text-sm text-zinc-700">{item.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section id="cta" className="sa-reveal py-10">
          <div className="sa-gradient sa-card rounded-3xl p-7 text-white md:flex md:items-center md:justify-between md:gap-6 md:p-10">
            <div className="max-w-3xl">
              <h3 className="text-3xl font-bold leading-tight">{finalCta.title}</h3>
              <p className="mt-3 text-sm text-white/90 md:text-base">{finalCta.subtitle}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
              <Link
                href="/login"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5"
              >
                {finalCta.primaryCtaLabel}
              </Link>
              <Link
                href="/zayavka-za-demo"
                className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {finalCta.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </section>

        <section className="sa-reveal border-t border-[var(--line)] py-8">
          <div className="flex flex-col gap-3 text-xs text-zinc-600 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} SecureAware. Демо платформа за представяне на продукта.</p>
            <div className="flex items-center gap-4">
              <a href="#hero" className="hover:text-[var(--brand-ink)]">
                Начало
              </a>
              <a href="#features" className="hover:text-[var(--brand-ink)]">
                Възможности
              </a>
              <a href="#faq" className="hover:text-[var(--brand-ink)]">
                Въпроси
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
