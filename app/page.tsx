import { getContent } from "@/lib/content";
import Sidebar from "@/components/Sidebar";
import StickyCta from "@/components/StickyCta";
import ActionFlow from "@/components/ActionFlow";
import WhySection from "@/components/WhySection";
import Community from "@/components/Community";
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
    <div className="flex flex-col pb-20 sm:pb-0 lg:flex-row lg:pb-0">
      <Sidebar content={content} />
      <main className="min-w-0 flex-1 bg-white">
        <ActionFlow content={content} />
        <WhySection content={content} />
        <Community content={content} />
        <BillSummary content={content} />
        <BillStatus content={content} />
        <Endorsements content={content} />
        <Donate content={content} />
        <Press content={content} />
        <Faq content={content} />
        <Footer content={content} />
      </main>
      <StickyCta label={content.hero.ctaLabel} />
    </div>
  );
}
