import React from 'react';
import { Link, useDocumentMeta } from '../lib/router';
import { FILMS, fmtTime } from '../data/film';
import FilmStage from '../components/media/FilmStage';
import CtaBand from '../components/layout/CtaBand';

/* /films — a screening room. Two different films, set out like a printed programme:
   "What we do" (the disciplines) and "The Residences" (the two homes, room by room). */
export default function FilmsPage() {
  useDocumentMeta('Films', 'Two short films by Design Studio by WS: what the studio does, and a walk through two Hyderabad residences, made from the studio’s own renders.');
  const total = FILMS.reduce((s, f) => s + f.duration, 0);

  return (
    <div className="films">
      <header className="films-head">
        <span className="home-kicker">Films</span>
        <h1 className="films-head__title">Two screenings.</h1>
        <p className="films-head__lead">
          One about the work, one inside it. Both are made from the studio’s own renders of real client homes.
        </p>
        <ol className="films-programme" aria-label="Programme">
          {FILMS.map((f, i) => (
            <li key={f.slug}>
              <Link to={`/films#${f.slug}`}>
                <span className="films-programme__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="films-programme__title">{f.title}</span>
                <span className="films-programme__lead">{f.lead}</span>
                <span className="films-programme__len">{fmtTime(f.duration)}</span>
              </Link>
            </li>
          ))}
          <li className="films-programme__total">
            <span>Total running time</span><span>{fmtTime(total)}</span>
          </li>
        </ol>
      </header>

      {FILMS.map((f, i) => (
        <section key={f.slug} id={f.slug} className="films-screening" aria-labelledby={`${f.slug}-title`}>
          <div className="films-screening__head">
            <span className="films-screening__num">Screening {String(i + 1).padStart(2, '0')}</span>
            <h2 id={`${f.slug}-title`} className="films-screening__title">{f.title}</h2>
            <span className="films-screening__len">{fmtTime(f.duration)} · no sound</span>
          </div>
          <FilmStage
            items={f.chapters}
            poster={f.poster}
            strip={f.strip}
            title={`Play ${f.title}`}
            meta={`${fmtTime(f.duration)} · move across the frame to preview`}
          >
            {(play, list) => (
              <ol className="films-index" aria-label={`${f.title}: ${list.length > 1 ? 'chapters' : 'contents'}`}>
                {list.length > 1
                  ? list.map((c, ci) => (
                    <li key={c.key}>
                      <button type="button" onClick={() => play(ci)}>
                        <span className="films-index__num">{String(ci + 1).padStart(2, '0')}</span>
                        <strong>{c.title}<small>{c.subtitle}</small></strong>
                        <span className="films-index__len">{fmtTime(c.duration)}</span>
                      </button>
                      <Link to={`/projects/${c.projectId}`} className="films-index__more">The project <span aria-hidden="true">→</span></Link>
                    </li>
                  ))
                  : list[0].rooms.filter((r) => r.slug).map((r, ri) => (
                    <li key={r.slug}>
                      <button type="button" onClick={() => play(0, r.t)}>
                        <span className="films-index__num">{String(ri + 1).padStart(2, '0')}</span>
                        <strong>{r.label}</strong>
                        <span className="films-index__len">{fmtTime(r.t)}</span>
                      </button>
                      <Link to={`/services/${r.slug}`} className="films-index__more">The service <span aria-hidden="true">→</span></Link>
                    </li>
                  ))}
              </ol>
            )}
          </FilmStage>
        </section>
      ))}

      <section className="films-credits" aria-label="Credits">
        <dl>
          <div><dt>Made from</dt><dd>The studio’s own renders of residences F-204 and F-1002, Hyderabad</dd></div>
          <div><dt>Camera</dt><dd>2.5D moves built from each render’s depth</dd></div>
          <div><dt>Sound</dt><dd>None — watch anywhere</dd></div>
          <div><dt>Studio</dt><dd>Design Studio by WS</dd></div>
        </dl>
      </section>

      <CtaBand title="Begin a home like these." to="/contact?type=interior" />
    </div>
  );
}
