import { UyumLogo } from '../ui/UyumLogo'

export function Footer() {
  return (
    <footer className="mx-auto mt-10 max-w-7xl px-4 pb-8 pt-6 md:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground">
        <UyumLogo size={24} />
        <p>© 2026 UYUM — METU Sports Tech Hackathon</p>
        <div className="flex gap-5">
          <a href="#" className="hover:text-primary">KVKK</a>
          <a href="#" className="hover:text-primary">Erişilebilirlik</a>
          <a href="#" className="hover:text-primary">İletişim</a>
        </div>
      </div>
    </footer>
  )
}
