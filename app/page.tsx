import Link from "next/link";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden" style={{ background: "linear-gradient(to bottom, var(--bg), var(--bg-alt))" }}>
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-xl tracking-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
          <span className="text-2xl">🌙</span> A&apos;insyirah
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/chat"
            className="rounded-full text-white px-5 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-250"
            style={{ background: "var(--gold)", transitionTimingFunction: "var(--ease-out-expo)" }}
          >
            Mulai Chat ✨
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pt-16 pb-20 text-center max-w-2xl mx-auto relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl -z-10" style={{ background: "var(--glow)" }} />

        <span
          className="inline-block rounded-full border px-5 py-1.5 text-xs font-medium mb-8 shadow-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--ink-muted)" }}
        >
          ✨ Asisten AI Pintar Berbahasa Indonesia
        </span>

        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)", fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          Tanya apa saja,
          <span className="block mt-1" style={{ color: "var(--gold)" }}>
            A&apos;insyirah siap bantu
          </span>
        </h1>

        <p className="mt-6 text-lg leading-relaxed max-w-lg mx-auto" style={{ color: "var(--ink-secondary)" }}>
          Asisten AI yang bisa diajak ngobrol, menjawab pertanyaan, menulis,
          menerjemahkan, membuat ide, dan banyak lagi — gratis dan mudah dipakai.
        </p>

        {/* TOMBOL CTA */}
        <div className="mt-10">
          <Link
            href="/chat"
            className="group text-white px-10 py-4 font-bold inline-block shadow-lg text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
              borderRadius: "var(--radius-pill)",
              transitionTimingFunction: "var(--ease-out-expo)",
            }}
          >
            🚀 Mulai Ngobrol Gratis
          </Link>
          <p className="mt-3 text-xs" style={{ color: "var(--ink-muted)" }}>
            Tanpa daftar · Tanpa biaya · Langsung pakai
          </p>
        </div>

        {/* AYAT / MOTTO */}
        <div
          className="mt-14 px-8 py-8 shadow-sm"
          style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <p className="text-2xl sm:text-3xl leading-loose" style={{ color: "var(--ink-secondary)" }} dir="rtl" lang="ar">
            فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا
          </p>
          <p className="mt-4 text-sm italic" style={{ color: "var(--ink-muted)" }}>
            &ldquo;Fa inna ma&apos;al &apos;usri yusra, inna ma&apos;al &apos;usri yusra&rdquo;
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-secondary)" }}>
            Sesungguhnya setiap kesulitan disertai kemudahan. Sesungguhnya setiap
            kesulitan disertai kemudahan.
          </p>
          <p className="mt-3 text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
            — QS. Al-Insyirah: 5-6
          </p>
        </div>
      </section>

      {/* FITUR */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
          Apa yang Bisa Ditanyakan?
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: "var(--ink-muted)" }}>
          A&apos;insyirah dibekali AI canggih untuk membantumu dalam berbagai hal.
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: "💬", title: "Tanya Jawab", desc: "Tanya apa saja, dari pelajaran sampai hal sehari-hari." },
            { icon: "✍️", title: "Bantu Menulis", desc: "Buat caption, surat, artikel, atau ringkasan teks." },
            { icon: "🌐", title: "Terjemah & Ide", desc: "Terjemahkan bahasa atau cari ide kreatif." },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              style={{
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                transitionTimingFunction: "var(--ease-out-expo)",
              }}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-lg mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--ink)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODE */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-8" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
          🎭 Pilih Gaya Bicara
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {[
            { emoji: "💬", name: "Umum", desc: "Asisten serba bisa" },
            { emoji: "📚", name: "Belajar", desc: "Guru privat sabar" },
            { emoji: "✍️", name: "Menulis", desc: "Copywriter kreatif" },
            { emoji: "🕌", name: "Islami", desc: "Santun & bernuansa religius" },
          ].map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 px-5 py-3 text-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
            >
              <span className="text-xl">{p.emoji}</span>
              <div>
                <p className="font-semibold" style={{ color: "var(--ink)" }}>{p.name}</p>
                <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 text-center text-sm mt-8" style={{ borderTop: "1px solid var(--border)", color: "var(--ink-muted)" }}>
        <a
          href="https://www.tiktok.com/@insyirah694"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium transition-opacity duration-200 hover:opacity-80"
        >
          🎵 Ikuti di TikTok @insyirah694
        </a>
        <p className="mt-3">A&apos;insyirah · Asisten AI · {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
