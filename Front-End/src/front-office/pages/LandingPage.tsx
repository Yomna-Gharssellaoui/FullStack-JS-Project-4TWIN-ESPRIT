import { NavigationBar } from "../organisms/NavigationBar";
import { HeroSection } from "../organisms/HeroSection";
import { FeaturesSection } from "../organisms/FeaturesSection";
import { PricingSection } from "../organisms/PricingSection";
import { RegisterSection } from "../organisms/RegisterSection";
import { ContactSection } from "../organisms/ContactSection";
import { FooterSection } from "../organisms/FooterSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <NavigationBar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <RegisterSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
