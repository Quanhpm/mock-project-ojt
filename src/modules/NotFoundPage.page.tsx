import { ArrowLeft, Coffee, Home, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--cf-bg)] px-4 py-8 text-[var(--cf-primary)] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-56 w-56 rounded-full bg-[var(--cf-accent-light)]/40 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute bottom-[-7rem] right-[-4rem] h-64 w-64 rounded-full bg-[var(--cf-secondary)]/30 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute left-1/4 top-1/3 h-3 w-3 rounded-full bg-[var(--cf-primary)]/20" />
        <div className="absolute right-1/4 top-1/4 h-2 w-2 rounded-full bg-[var(--cf-dark)]/30" />
        <div className="absolute bottom-1/4 left-1/3 h-4 w-4 rounded-full bg-[var(--cf-secondary)]/20" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <nav className="mb-8 flex items-center justify-between rounded-full border border-white/40 bg-white/55 px-5 py-3 shadow-[0_18px_45px_rgba(127,85,57,0.08)] backdrop-blur-xl sm:px-6">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[var(--cf-primary)] uppercase">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cf-surface)] text-[var(--cf-primary)]">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline"> BOUTIQUE BREWS</span>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-[var(--cf-secondary)]/20 bg-[var(--cf-surface)]/55 px-3 py-2 text-sm text-[var(--cf-dark)]">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Ôi,, có gì đó không ổn</span>
          </div>
        </nav>

        <main className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-3xl text-center">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/55 px-6 py-10 shadow-[0_25px_80px_rgba(127,85,57,0.12)] backdrop-blur-xl sm:px-10 sm:py-14 lg:px-14">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--cf-accent-light)] via-[var(--cf-secondary)] to-[var(--cf-primary)]" />
              <div className="absolute left-[-3rem] top-12 h-28 w-28 rounded-full bg-[var(--cf-surface)]/80 blur-2xl" />
              <div className="absolute bottom-8 right-[-2rem] h-32 w-32 rounded-full bg-[var(--cf-accent-light)]/55 blur-2xl" />

              <div className="relative z-10">
                <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(221,184,146,0.55),rgba(230,204,178,0.95))] shadow-[0_18px_40px_rgba(127,85,57,0.12)]">
                  <div className="relative">
                    <Coffee className="h-11 w-11 text-[var(--cf-primary)]" strokeWidth={2.2} />
                    <Sparkles className="absolute -right-4 -top-4 h-5 w-5 text-[var(--cf-dark)]" strokeWidth={2.2} />
                  </div>
                </div>

                <div className="mb-4 bg-gradient-to-br from-[var(--cf-primary)] to-[var(--cf-dark)] bg-clip-text text-7xl font-black tracking-[-0.08em] text-transparent sm:text-8xl lg:text-9xl">
                  404
                </div>

                <div className="mx-auto mb-10 max-w-2xl space-y-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-[var(--cf-primary)] sm:text-4xl">
                    Ôi! Trang bạn tìm không còn ở đây
                  </h1>
                  <p className="text-base leading-7 text-[color:rgba(127,85,57,0.78)] sm:text-lg">
                    Có thể đường dẫn đã thay đổi hoặc trang này không còn tồn tại. Bạn có thể quay lại bước trước đó
                    hoặc về trang chủ để tiếp tục trải nghiệm.
                  </p>
                  <p className="text-sm italic text-[color:rgba(156,102,68,0.8)]">
                    Nếu lạc đường, mình mời bạn một ly cà phê rồi quay lại nhé.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    to="/"
                    className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-[var(--cf-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(127,85,57,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--cf-dark)]"
                  >
                    <Home className="h-4 w-4" />
                    <span>Về trang chủ</span>
                  </Link>

                  <button
                    onClick={() => window.history.back()}
                    className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-[var(--cf-secondary)]/35 bg-white/45 px-6 py-3.5 text-sm font-semibold text-[var(--cf-primary)] transition-colors duration-200 hover:bg-[var(--cf-surface)]/60"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFoundPage;
