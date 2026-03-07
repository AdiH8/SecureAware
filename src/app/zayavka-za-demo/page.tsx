import Link from "next/link";

import { DemoRequestForm } from "@/components/demo-request-form";

export default function DemoRequestPage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto w-full max-w-4xl px-4 pt-12 pb-6">
        <div className="sa-card sa-gradient rounded-3xl p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">SecureAware</p>
          <h1 className="mt-3 text-4xl font-bold">Заявка за бизнес демо</h1>
          <p className="mt-2 text-sm text-white/90">
            Тази страница е част от презентационния поток и симулира реална бизнес заявка.
          </p>
          <Link className="mt-4 inline-block text-sm font-semibold underline" href="/">
            Назад към начална страница
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 pb-14">
        <DemoRequestForm />
      </section>
    </div>
  );
}
