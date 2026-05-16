import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep details out of the demo screen, but leave breadcrumbs for the dev console.
    console.error('[UYUM] runtime error', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center bg-uyum-dark text-white p-6"
      >
        <div className="max-w-md text-center space-y-4">
          <p className="text-3xl" aria-hidden="true">🛠️</p>
          <h1 className="text-2xl font-heading font-bold">
            Bir şey ters gitti
          </h1>
          <p className="text-sm font-body text-white/70 leading-relaxed">
            Demo sırasında beklenmedik bir hata oluştu. Sayfayı yenilemek genelde
            sorunu çözer. Sorun devam ederse demo URL'sini ekibimizle paylaşın.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
              bg-uyum-purple text-white text-sm font-heading font-semibold
              hover:bg-uyum-blue transition-colors
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-uyum-frost-blue
            "
          >
            Ana sayfaya dön
          </button>
        </div>
      </div>
    )
  }
}
