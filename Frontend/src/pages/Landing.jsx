import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import LenisWrapper from '../components/LenisWrapper';

function Landing() {
  return (
    <LenisWrapper>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </LenisWrapper>
  );
}

export default Landing;
