import "tailwindcss";
import Hero from "../../components/Home/Hero";
import MenuCategories from "../../components/Home/MenuCategories";
import FeaturedItems from "../../components/Home/FeaturedItems";
import PromoBanner from "../../components/Home/PromoBanner";
import DeliveryBanner from "../../components/Home/DeliveryBanner";
import Testimonials from "../../components/Home/Testimonials";
import BlogPreview from "../../components/Home/BlogPreview";

const Home = () => {
  return (
    <div>
      <Hero />
      <MenuCategories />
      <FeaturedItems />
      <PromoBanner />
      <DeliveryBanner />
      <Testimonials />
      <BlogPreview />
    </div>
  );
};

export default Home;
