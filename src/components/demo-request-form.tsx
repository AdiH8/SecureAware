"use client";

import { FormEvent, useState } from "react";

export function DemoRequestForm() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="sa-card p-6">
        <h2 className="text-2xl font-bold">Благодарим за заявката</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Демонстрационен режим: формата е UI макет и не изпраща реални данни.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="sa-card p-6">
      <h2 className="text-2xl font-bold">Заявка за демо</h2>
      <p className="mt-2 text-sm text-zinc-700">
        Попълнете информацията, за да симулирате заявка като собственик или мениджър.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Име и фамилия
          <input className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" required />
        </label>
        <label className="text-sm">
          Работен имейл
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            required
          />
        </label>
        <label className="text-sm">
          Компания
          <input className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" required />
        </label>
        <label className="text-sm">
          Брой служители
          <select className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" required>
            <option value="">Избери</option>
            <option>1-25</option>
            <option>26-100</option>
            <option>101-500</option>
            <option>500+</option>
          </select>
        </label>
      </div>

      <label className="mt-3 block text-sm">
        Какво искате да подобрите най-спешно?
        <textarea
          rows={4}
          className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          placeholder="Пример: фишинг риск, процент докладвани имейли, обучения по отдели..."
        />
      </label>

      <button
        type="submit"
        className="mt-4 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Изпрати заявка
      </button>
    </form>
  );
}
