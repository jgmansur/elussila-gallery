export const metadata = {
  title: "Contacto",
  description:
    "Contacto oficial de Elussila para consultas, reservas y compra directa de obra original.",
};

const whatsappNumber = "5491136531320";
const defaultMessage = encodeURIComponent("Hola Elussila, me interesa una obra de tu galería.");

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-12">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-zinc-500">Contacto</p>
        <h1 className="mb-8 font-serif text-4xl text-white md:text-5xl">Hablemos de tu próxima pieza</h1>

        <div className="grid gap-6 text-zinc-300 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <h2 className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">WhatsApp</h2>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
              target="_blank"
              rel="noreferrer"
              className="text-lg text-white underline underline-offset-4"
            >
              Iniciar conversación
            </a>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <h2 className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Email</h2>
            <a href="mailto:contacto@elussila.art" className="text-lg text-white underline underline-offset-4">
              contacto@elussila.art
            </a>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 md:col-span-2">
            <h2 className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Instagram</h2>
            <a
              href="https://instagram.com/elussila"
              target="_blank"
              rel="noreferrer"
              className="text-lg text-white underline underline-offset-4"
            >
              @elussila
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
