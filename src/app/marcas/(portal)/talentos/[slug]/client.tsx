'use client';

import { useState } from 'react';
import { ProposalModal } from '@/components/brand/ProposalModal';

interface Props {
  talentId: number;
  talentName: string;
}

export function BrandTalentFichaClient({ talentId, talentName }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-8 py-3 rounded-full font-bold text-white text-sm bg-sp-grad hover:opacity-90 transition-opacity"
      >
        Enviar propuesta
      </button>
      {showModal && (
        <ProposalModal talentId={talentId} talentName={talentName} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
