"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signInWithPopup, User, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { defaultSiteContent } from "@/lib/site-content";

const ADMIN_EMAILS = ["elussila@gmail.com", "jgmansur2@gmail.com"];

export default function AdminContentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loadingApp, setLoadingApp] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bioTitle, setBioTitle] = useState(defaultSiteContent.bioTitle);
  const [bioBody, setBioBody] = useState(defaultSiteContent.bioBody);
  const [contactEmail, setContactEmail] = useState(defaultSiteContent.contactEmail);
  const [contactInstagram, setContactInstagram] = useState(defaultSiteContent.contactInstagram);
  const [contactWhatsapp, setContactWhatsapp] = useState(defaultSiteContent.contactWhatsapp);

  useEffect(() => {
    const unsubApp = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthorized(Boolean(u && (ADMIN_EMAILS.includes(u.email || "") || u.email?.includes("jaystudio"))));
      setLoadingApp(false);
    });

    const unsubContent = onSnapshot(doc(db, "siteContent", "main"), (snapshot) => {
      const data = snapshot.data();
      if (!data) return;
      setBioTitle(data.bioTitle || defaultSiteContent.bioTitle);
      setBioBody(data.bioBody || defaultSiteContent.bioBody);
      setContactEmail(data.contactEmail || defaultSiteContent.contactEmail);
      setContactInstagram(data.contactInstagram || defaultSiteContent.contactInstagram);
      setContactWhatsapp(data.contactWhatsapp || defaultSiteContent.contactWhatsapp);
    });

    return () => {
      unsubApp();
      unsubContent();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Error al iniciar sesión.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "siteContent", "main"),
        {
          bioTitle,
          bioBody,
          contactEmail,
          contactInstagram: contactInstagram.replace("@", ""),
          contactWhatsapp,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || "unknown",
        },
        { merge: true }
      );
      alert("Contenido guardado correctamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el contenido.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingApp) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-[2rem] text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Acceso CMS</h1>
          <p className="text-zinc-400 mb-8">Ingresá con una cuenta administradora para editar biografía y contacto.</p>
          {!user ? (
            <button onClick={handleLogin} className="w-full bg-white text-black font-bold py-3 rounded-xl">
              Continuar con Google
            </button>
          ) : (
            <button onClick={() => signOut(auth)} className="text-zinc-400 underline underline-offset-4">
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">CMS</p>
          <h1 className="text-3xl font-bold text-white">Contenido del sitio</h1>
        </div>
        <Link href="/admin" className="text-sm text-zinc-300 underline underline-offset-4">
          Volver al admin
        </Link>
      </header>

      <section className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Biografía</h2>
        <div className="space-y-4">
          <input
            value={bioTitle}
            onChange={(e) => setBioTitle(e.target.value)}
            placeholder="Título de biografía"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
          />
          <textarea
            value={bioBody}
            onChange={(e) => setBioBody(e.target.value)}
            rows={8}
            placeholder="Texto biográfico"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
          />
        </div>
      </section>

      <section className="mt-6 space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Contacto</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
          />
          <input
            value={contactWhatsapp}
            onChange={(e) => setContactWhatsapp(e.target.value)}
            placeholder="WhatsApp (sin +)"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
          />
          <input
            value={contactInstagram}
            onChange={(e) => setContactInstagram(e.target.value)}
            placeholder="Instagram (con o sin @)"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white md:col-span-2"
          />
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </main>
  );
}
