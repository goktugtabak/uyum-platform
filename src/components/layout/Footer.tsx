import { UyumLogo } from '../ui/UyumLogo'

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 md:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <UyumLogo size={24} />
            <span className="font-bold text-[#320E3B]">UYUM</span>
          </div>
          <p>© 2026 UYUM — METU Sports Tech Hackathon</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-[#320E3B]">KVKK</a>
            <a href="#" className="hover:text-[#320E3B]">Erişilebilirlik</a>
            <a href="#" className="hover:text-[#320E3B]">İletişim</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
