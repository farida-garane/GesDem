import React from 'react';
import Link from 'next/link';
import { GUIDE_SECTIONS } from '@/data/knowledgeBase';

export default function AidePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-fade-in">
      
      {/* En-tête sobre de la fiche avec bouton Nouvelle Demande */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#002B7F] tracking-tight">
            Fiche d&apos;Assistance 
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-2xl leading-relaxed">
            Ce document regroupe les vérifications rapides à effectuer en autonomie avant d&apos;ouvrir une demande, ainsi que les procédures pour les pannes matérielles nécessitant l&apos;intervention du support technique.
          </p>
        </div>

        {/* Bouton d'action directe vers le formulaire Nouvelle Demande */}
        <Link
          href="/demandes/nouvelle"
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-xs font-black shrink-0 active:scale-95 transition-all shadow-md"
        >
          <span>Nouvelle Demande</span>
        </Link>
      </div>

      {/* SECTION 1 : SOLUTIONS RAPIDES EN AUTONOMIE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-200/80 pb-3">
          <h2 className="text-lg font-black text-[#071530]">
            1. Solutions Rapides en Autonomie
          </h2>
          <p className="text-xs text-[#64748b] font-medium mt-0.5">
            À tester avant de créer une demande d&apos;intervention.
          </p>
        </div>

        <div className="divide-y divide-slate-100 space-y-6">
          {GUIDE_SECTIONS.selfService.map((item, idx) => (
            <div key={item.id} className={idx === 0 ? 'space-y-2' : 'pt-6 space-y-2'}>
              <h3 className="text-sm font-black text-[#002B7F]">
                {item.title}
              </h3>
              <p className="text-xs text-[#475569]">
                {item.summary}
              </p>

              <div className="mt-3 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-[#071530] uppercase tracking-wider">
                  Étapes à suivre :
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-[#1E293B] font-medium leading-relaxed pl-1">
                  {item.steps.map((step, sIdx) => (
                    <li key={sIdx} className="pl-1">{step}</li>
                  ))}
                </ol>
              </div>

              {item.notice && (
                <p className="text-[11px] text-[#002B7F] font-semibold italic pt-1">
                  Note : {item.notice}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2 : PANNES MATÉRIELLES & PROCÉDURES TECHNIQUES */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-200/80 pb-3">
          <h2 className="text-lg font-black text-[#071530]">
            2. Pannes Matérielles &amp; Procédures Techniques
          </h2>
          <p className="text-xs text-[#64748b] font-medium mt-0.5">
            Cas nécessitant l&apos;intervention des Services Généraux.
          </p>
        </div>

        <div className="divide-y divide-slate-100 space-y-6">
          {GUIDE_SECTIONS.interventionRequise.map((item, idx) => (
            <div key={item.id} className={idx === 0 ? 'space-y-2' : 'pt-6 space-y-2'}>
              <h3 className="text-sm font-black text-[#071530]">
                {item.title}
              </h3>
              <p className="text-xs text-[#475569]">
                {item.summary}
              </p>

              <div className="mt-3 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-[#071530] uppercase tracking-wider">
                  Procédure :
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-[#1E293B] font-medium leading-relaxed pl-1">
                  {item.steps.map((step, sIdx) => (
                    <li key={sIdx} className="pl-1">{step}</li>
                  ))}
                </ol>
              </div>

              {item.notice && (
                <p className="text-[11px] text-[#002B7F] font-semibold italic pt-1">
                  Note : {item.notice}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. BANNIÈRE D'ACTION FINALE */}
      <div className="bg-[#E8F1FF] border border-[#B3D1FF] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-base font-black text-[#002B7F]">
            Votre problème persiste ou nécessite une intervention ?
          </h3>
          <p className="text-xs text-[#071530] font-semibold">
            Remplissez le formulaire pour transmettre votre demande directement aux équipes techniques.
          </p>
        </div>
        <Link
          href="/demandes/nouvelle"
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-xs font-black shrink-0 active:scale-95 transition-all shadow-md"
        >
          <span>Créer une demande</span>
        </Link>
      </div>

    </div>
  );
}
