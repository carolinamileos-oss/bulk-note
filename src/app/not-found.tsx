import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-6xl mb-4">🍽️</p>
      <h1 className="section-title text-3xl mb-2">Página não encontrada</h1>
      <p className="text-muted-foreground mb-6">Esta página não existe ou foi removida.</p>
      <Link href="/" className="btn-primary">Voltar ao dashboard</Link>
    </div>
  )
}
