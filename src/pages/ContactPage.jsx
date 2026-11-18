import React from 'react';
import { useDocumentMeta } from '../lib/router';
import BandText from '../components/animations/BandText';
import ContactSection from '../sections/ContactSection';

const INQUIRY_TYPES = ['residential', 'interior', 'hospitality', 'other'];

export default function ContactPage() {
  useDocumentMeta('Contact', 'Begin a commission with Design Studio by WS, Hyderabad.');
  const type = new URLSearchParams(window.location.search).get('type');

  return (
    <>
      <section className="contact-hero">
        <div className="contact-hero__head">
          <span className="sec-roman">Contact</span>
          <h1 className="contact-hero__title">Every home begins with a word.</h1>
        </div>
        <BandText text=" Begin " label="Interactive headline — click to type your own word" />
      </section>
      <ContactSection initialType={INQUIRY_TYPES.includes(type) ? type : ''} />
    </>
  );
}
