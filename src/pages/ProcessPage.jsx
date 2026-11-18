import React from 'react';
import { useDocumentMeta } from '../lib/router';
import { PROCESS_PHASES } from '../data/site';
import PageHero from '../components/layout/PageHero';
import CtaBand from '../components/layout/CtaBand';
import ObserverChapters from '../components/animations/ObserverChapters';

const CHAPTERS = PROCESS_PHASES.map((p) => ({
  num: p.num,
  kicker: `${p.num} — ${p.title}`,
  heading: p.heading,
  text: p.text,
  outputs: p.outputs,
  image: p.image,
}));

export default function ProcessPage() {
  useDocumentMeta('Process', 'How Design Studio by WS works — brief and survey, concept, 3D development, craft and execution, and handover.');

  return (
    <>
      <PageHero
        kicker="Process"
        title="Five phases. No guesswork."
        lead="Nothing is ordered before it has been drawn, rendered and approved. Each phase closes with a document you sign off, so the next one starts from fact."
        meta={PROCESS_PHASES.map((p) => [p.num, p.title])}
      />

      <ObserverChapters chapters={CHAPTERS} label="Studio process, five phases" />

      <section className="process-ledger">
        <div className="sec-rule" />
        <div className="sec-head">
          <span className="sec-roman">Ledger</span>
          <h2 className="sec-title">What you receive.</h2>
          <p className="sec-sub">Every phase ends with tangible documents — kept for the life of the building.</p>
        </div>
        <div className="process-ledger__table" role="table" aria-label="Deliverables by phase">
          {PROCESS_PHASES.map((p) => (
            <div className="process-ledger__row" role="row" key={p.num}>
              <span role="cell" className="process-ledger__num">{p.num}</span>
              <strong role="cell">{p.title}</strong>
              <span role="cell" className="process-ledger__outputs">{p.outputs.join(' · ')}</span>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Start with phase one."
        text="A conversation and a measured survey. That is all it takes to begin."
        label="Book a survey"
      />
    </>
  );
}
