import { getContent } from "@/lib/content";
import Hero from "@/components/Hero";
import StickyCta from "@/components/StickyCta";
import ActionFlow from "@/components/ActionFlow";
import WhySection from "@/components/WhySection";
import BillSummary from "@/components/BillSummary";
import BillStatus from "@/components/BillStatus";
import Endorsements from "@/components/Endorsements";
import Donate from "@/components/Donate";
import Press from "@/components/Press";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";

export default function Home() {
  const content = getContent();

  return (
    <main className="pb-20 sm:pb-0">
      <Hero content={content} />
      <ActionFlow content={content} />
      <WhySection content={content} />
      <BillSummary content={content} />
      <BillStatus content={content} />
      <Endorsements content={content} />
      <Donate content={content} />
      <Press content={content} />
      <Faq content={content} />
      <Footer content={content} />
      <StickyCta label={content.hero.ctaLabel} />
    </main>
  );
}
