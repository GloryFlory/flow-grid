// Main showcase page — server component that composes all sections.
// Each section is a separate client component for interactivity.
import ShowcaseNav from '@/components/showcase/ShowcaseNav'
import HeroSection from '@/components/showcase/HeroSection'
import ProblemSection from '@/components/showcase/ProblemSection'
import ProductPreview from '@/components/showcase/ProductPreview'
import WhyFlowGrid from '@/components/showcase/WhyFlowGrid'
import SocialProof from '@/components/showcase/SocialProof'
import PartnershipSection from '@/components/showcase/PartnershipSection'
import FinalCTA from '@/components/showcase/FinalCTA'

export default function ShowcasePage() {
  return (
    <>
      {/* Sticky top navigation */}
      <ShowcaseNav />

      <main>
        {/* 1. Hero — first impression */}
        <HeroSection />

        {/* 2. Problem — why PDFs are broken */}
        <ProblemSection />

        {/* 3. Product Preview — interactive heart of the page */}
        <ProductPreview />

        {/* 4. Why FlowGrid — key benefits */}
        <WhyFlowGrid />

        {/* 5. Social Proof — stats + testimonials */}
        <SocialProof />

        {/* 6. Partnership — for platforms and collaborators */}
        <PartnershipSection />

        {/* 7. Final CTA — closing push */}
        <FinalCTA />
      </main>
    </>
  )
}
