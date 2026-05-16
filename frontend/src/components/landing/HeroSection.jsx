import { BrandLogo } from '../../components/ui/BrandLogo'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()
  return (
    <section className="min-h-screen w-full bg-white px-6 md:px-12 lg:px-20 py-6">

      {/* ================= NAVBAR ================= */}
      <nav className="flex items-center justify-between">

        {/* Logo */}
        <div className="w-full max-w-sm">
                  <div className="mb-4 flex justify-center">
                    <BrandLogo />
                  </div>
        
        </div>

        {/* Links */}
        <ul className="hidden lg:flex gap-10 text-gray-500 text-sm font-medium">
          <li className="hover:text-black cursor-pointer">Features</li>
          <li className="hover:text-black cursor-pointer">Why Track</li>
          <li className="hover:text-black cursor-pointer">How it works</li>
          <li className="hover:text-black cursor-pointer">Pricing</li>
          <li className="hover:text-black cursor-pointer">FAQs</li>
        </ul>

        {/* Buttons */}
        <div className="hidden md:flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="h-8 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Login
          </button>
            <button
            type="button"
            onClick={() => navigate('/landing-signup')}
            className="px-5 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800"
            >
            Sign Up for Free
            </button>
        </div>
      </nav>

      {/* ================= HERO CONTENT ================= */}
      <div className="text-center max-w-3xl mx-auto mt-20">

        {/* Users pill */}
        <div className="flex items-center justify-center gap-2 border rounded-full px-4 py-2 w-fit mx-auto bg-white shadow-sm">
          <div className="flex -space-x-2">
            <img src="https://i.pravatar.cc/40?img=1" className="w-7 h-7 rounded-full border-2 border-white" />
            <img src="https://i.pravatar.cc/40?img=2" className="w-7 h-7 rounded-full border-2 border-white" />
            <img src="https://i.pravatar.cc/40?img=3" className="w-7 h-7 rounded-full border-2 border-white" />
            <img src="https://i.pravatar.cc/40?img=4" className="w-7 h-7 rounded-full border-2 border-white" />
          </div>

          <span className="text-sm text-gray-600 ml-2">
            Over 300,000+ people use Track daily
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mt-8 text-gray-900">
          See Who Worked.
          <br />
          Pay Who Earned It.
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-base md:text-lg mt-6 leading-relaxed max-w-2xl mx-auto">
          Track helps organizations track employee attendance, manage daily reports,
          and improve workforce accountability.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button className="px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
            Start 14-Day Free Trial
          </button>

          <button className="px-6 py-4 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200">
            Request a Demo
          </button>
        </div>

        {/* Trusted text */}
        <p className="text-gray-500 text-sm mt-14">
          Trusted by 300+ top leading companies
        </p>

        {/* Companies */}
        <div className="flex flex-wrap justify-center gap-8 mt-6 text-gray-400 font-bold text-2xl md:text-3xl">
          <span>Slack</span>
          <span>Asana</span>
          <span>Stripe</span>
          <span>Notion</span>
          <span>Figma</span>
        </div>
      </div>

      {/* ================= DASHBOARD IMAGE ================= */}
      <div className="mt-16 flex justify-center">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
          alt="dashboard"
          className="w-full max-w-6xl rounded-2xl shadow-xl"
        />
      </div>

    </section>
  );
};

export default HeroSection;