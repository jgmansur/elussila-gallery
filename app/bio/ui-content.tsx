"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { defaultSiteContent } from "@/lib/site-content";

export default function BioContent() {
  const [bioTitle, setBioTitle] = useState(defaultSiteContent.bioTitle);
  const [bioBody, setBioBody] = useState(defaultSiteContent.bioBody);
  const [bioImageUrl, setBioImageUrl] = useState(defaultSiteContent.bioImageUrl);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "siteContent", "main"), (snapshot) => {
      const data = snapshot.data();
      if (!data) return;
      setBioTitle(data.bioTitle || defaultSiteContent.bioTitle);
      setBioBody(data.bioBody || defaultSiteContent.bioBody);
      setBioImageUrl(data.bioImageUrl || defaultSiteContent.bioImageUrl);
    });

    return () => unsub();
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-12">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-zinc-500">Biografía</p>
        <h1 className="mb-8 font-serif text-4xl text-white md:text-5xl">{bioTitle}</h1>

        {bioImageUrl && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <img
              src={bioImageUrl}
              alt="Retrato de Eva González"
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="space-y-6 text-zinc-300 leading-relaxed">
          {bioBody.split("\n").map((paragraph: string, index: number) => (
            <p key={`${paragraph}-${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
