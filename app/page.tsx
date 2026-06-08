import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fdf8f0] via-[#faf6ef] to-[#f3ead9] text-[#3a352e] overflow-hidden">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="text-2xl">🌙</span> A&apos;insyirah
        </div>
        <Link
          href="/chat"
          className="rounded-full bg-[#caa86a] text-white px-5 py-2 text-sm font-semibold hover:bg-[#b8965a] transition shadow-md hover:shadow-lg"
        >
          Mulai Chat ✨
        </Link>
      </nav>

      {/* HERO */}
      <section className="px-6 pt-16 pb-20 text-center max-w-2xl mx-auto relative">
        {/* dekorasi blur */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#caa86a]/10 rounded-full blur-3xl -z-10" />

        <span className="inline-block rounded-full border border-[#e0d4bd] bg-white/70 backdrop-blur px-5 py-1.5 text-xs font-medium text-[#8a7a55] mb-8 shadow-sm">
          ✨ Asisten AI Pintar Berbahasa Indonesia
        </span>

        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-[#2e2a23]">
          Tanya apa saja,
          <span className="block mt-1 bg-gradient-to-r from-[#caa86a] to-[#b8965a] bg-clip-text text-transparent">
            A&apos;insyirah siap bantu
          </span>
        </h1>

        <p className="mt-6 text-lg text-[#6b6353] leading-relaxed max-w-lg mx-auto">
          Asisten AI yang bisa diajak ngobrol, menjawab pertanyaan, menulis,
          menerjemahkan, membuat ide, dan banyak lagi — gratis dan mudah dipakai.
        </p>

        {/* TOMBOL CTA */}
        <div className="mt-10">
          <Link
            href="/chat"
            className="group rounded-full bg-gradient-to-r from-[#caa86a] to-[#b8965a] text-white px-10 py-4 font-bold hover:shadow-xl hover:scale-105 transition-all duration-200 inline-block shadow-lg text-lg"
          >
            🚀 Mulai Ngobrol Gratis
          </Link>
          <p className="mt-3 text-xs text-[#a99a78]">Tanpa daftar · Tanpa biaya · Langsung pakai</p>
        </div>

        {/* AYAT / MOTTO */}
        <div className="mt-14 rounded-3xl border border-[#e8dcc4] bg-white/50 backdrop-blur-sm px-8 py-8 shadow-sm">
          <p className="text-2xl sm:text-3xl leading-loose text-[#5a513f]" dir="rtl" lang="ar">
            فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا
          </p>
          <p className="mt-4 text-sm italic text-[#8a7a55]">
            &ldquo;Fa inna ma&apos;al &apos;usri yusra, inna ma&apos;al &apos;usri yusra&rdquo;
          </p>
          <p className="mt-2 text-sm text-[#6b6353]">
            Sesungguhnya setiap kesulitan disertai kemudahan. Sesungguhnya setiap
            kesulitan disertai kemudahan.
          </p>
          <p className="mt-3 text-xs text-[#a99a78] font-medium">— QS. Al-Insyirah: 5-6</p>
        </div>
      </section>

      {/* FITUR */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-[#2e2a23]">
          Apa yang Bisa Ditanyakan?
        </h2>
        <p className="text-center text-sm text-[#8a7a55] mb-10">
          A&apos;insyirah dibekali AI canggih untuk membantumu dalam berbagai hal.
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: "💬", title: "Tanya Jawab", desc: "Tanya apa saja, dari pelajaran sampai hal sehari-hari.", color: "from-[#fef3e2] to-[#fdf8f0]" },
            { icon: "✍️", title: "Bantu Menulis", desc: "Buat caption, surat, artikel, atau ringkasan teks.", color: "from-[#f0f6fe] to-[#f6fafe]" },
            { icon: "🌐", title: "Terjemah & Ide", desc: "Terjemahkan bahasa atau cari ide kreatif.", color: "from-[#f2fef4] to-[#f7fef8]" },
          ].map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border border-[#e8dcc4] bg-gradient-to-br ${f.color} p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-[#2e2a23]">{f.title}</h3>
              <p className="text-sm text-[#6b6353] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIGA MODE */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-8 text-[#2e2a23]">
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
              className="flex items-center gap-3 bg-white/60 border border-[#e8dcc4] rounded-2xl px-5 py-3 text-sm"
            >
              <span className="text-xl">{p.emoji}</span>
              <div>
                <p className="font-semibold text-[#2e2a23]">{p.name}</p>
                <p className="text-xs text-[#8a7a55]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 text-center text-sm text-[#a99a78] border-t border-[#e8dcc4] mt-8">
        <a
          href="https://www.tiktok.com/@insyirah694"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-[#b8965a] transition font-medium"
        >
          🎵 Ikuti di TikTok @insyirah694
        </a>
        <p className="mt-3">A&apos;insyirah · Asisten AI · {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
