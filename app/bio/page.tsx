export const metadata = {
  title: "Biografía",
  description:
    "Conocé la historia de Eva Lucila González, artista tamaulipeca que firma su obra como Elussila.",
};

export default function BioPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-12">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-zinc-500">Biografía</p>
        <h1 className="mb-8 font-serif text-4xl text-white md:text-5xl">Eva Lucila González · Elussila</h1>

        <div className="space-y-6 text-zinc-300 leading-relaxed">
          <p>
            Eva Lucila González, conocida artísticamente como <strong>Elussila</strong>, es una artista
            tamaulipeca enfocada en pintura contemporánea. Su trabajo explora emoción, memoria y textura
            con una mirada íntima, sensible y profundamente personal.
          </p>
          <p>
            Cada pieza es <strong>única e irrepetible</strong>. Su proceso creativo parte de la observación
            cotidiana y del vínculo con la naturaleza, transformando experiencias en obras originales para
            coleccionistas que valoran autenticidad y carácter.
          </p>
          <p>
            En esta galería vas a encontrar una selección curada de su obra pictórica disponible para
            reserva o compra directa.
          </p>
        </div>
      </section>
    </main>
  );
}
