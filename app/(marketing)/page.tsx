"use client";

import { FinalCTA } from "../shared/components/landing/cta";
import { Features } from "../shared/components/landing/features";
import { Hero } from "../shared/components/landing/hero";
import { HowItWorks } from "../shared/components/landing/howItWorks";
import { Problems } from "../shared/components/landing/problems";
import { Testimonials } from "../shared/components/landing/testimonials";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Problems />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
