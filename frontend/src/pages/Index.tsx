import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import DashboardPreview from '@/components/DashboardPreview';
import FooterSection from '@/components/FooterSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DashboardPreview />
      <FooterSection />
    </div>
  );
};

export default Index;
