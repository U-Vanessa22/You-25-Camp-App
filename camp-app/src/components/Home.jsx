import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Users, Calendar, Award, ChevronLeft, ChevronRight } from 'lucide-react'

function Home({ language, isDarkMode }) {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Extended gallery with all available images for carousel
  const allImages = [
    { src: '/DF.jpeg', title: 'Gatherings' },
    { src: '/DF 10.jpeg', title: 'Retreats' },
    { src: '/DF 9.jpeg', title: 'Bring and Share' },
    { src: '/DF 11.jpeg', title: 'Fellowship' },
    { src: '/Df 1.jpeg', title: 'Service' },
    { src: '/DF 5.jpg', title: 'Ceremonies' },
    { src: '/DF 2.jpg', title: 'Thanksgiving' },
    { src: '/DF 4.jpg', title: 'Special Events' },
  ]

  // Auto-rotate slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [allImages.length])

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % allImages.length)
  }

  // Get 5 images for display (centered on current slide)
  const getDisplayImages = () => {
    const display = []
    for (let i = 0; i < 5; i++) {
      const index = (currentSlide + i) % allImages.length
      display.push({ ...allImages[index], originalIndex: index })
    }
    return display
  }

  const translations = {
    en: {
      title: 'Join Youth Camp',
      subtitle: 'Grow in Faith',
      description: 'An exciting opportunity for young people to connect, learn, and grow together in a supportive community.',
      cta: 'Register Now',
      features: [
        {
          icon: Users,
          title: 'Prayer',
          description: 'Spend time in prayer, worship, and spiritual reflection together.'
        },
        {
          icon: Calendar,
          title: 'Creating Unforgettable Memories',
          description: 'Enjoy moments and activities that will stay with you long after the camp ends.'
        },
        {
          icon: Award,
          title: 'Career Building and Guidance',
          description: 'Receive encouragement, guidance, and inspiration for your future career path.'
        }
      ]
    },
    rw: {
      title: 'Jira mu Umunara',
      subtitle: 'Kwiteza mu Mahoro',
      description: 'Inzira nziza y\'abagore n\'abagabo bataramuca kwiteza mu mahoro, kwiga, n\'kunvirana hamwe mu buryoherane.',
      cta: 'Andika',
      features: [
        {
          icon: Users,
          title: 'Gusenga',
          description: 'Gusengera hamwe, kuramya, no kwibaza ku buzima bw’umwuka.'
        },
        {
          icon: Calendar,
          title: 'Gukora Ibihe Bitazibagirana',
          description: 'Kwishimira ibihe n’ibikorwa bizakugumamo nyuma y’inkambi.'
        },
        {
          icon: Award,
          title: 'Kubaka Umwuga no Kuyoborwa',
          description: 'Gahabwa inama, ubutumwa, n’inkunga bijyanye n’inzira y’umwuga wawe.'
        }
      ]
    }
  }

  const t = translations[language] || translations.en

  const createPlaceholder = (label, accentA, accentB) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accentA}" />
            <stop offset="100%" stop-color="${accentB}" />
          </linearGradient>
        </defs>
        <rect width="600" height="800" rx="48" fill="url(#g)" />
        <circle cx="470" cy="140" r="90" fill="rgba(255,255,255,0.12)" />
        <circle cx="120" cy="650" r="120" fill="rgba(255,255,255,0.10)" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="54" font-weight="700">${label}</text>
        <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="Arial, sans-serif" font-size="24">Replace later</text>
      </svg>
    `
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }

  // Use five curated DF images from /public (DF 1..8 set)
  // Use getDisplayImages() to render current carousel slide set

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-900/60 border-gray-800/50' : 'bg-white/70 border-gray-200/60'} backdrop-blur-md border-b shadow-sm`}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/60' : 'bg-white/90'} shadow-sm ring-1 ring-black/5 flex items-center justify-center p-1`}>
                <img src="/Logo-ERC.jpeg" alt="Camp logo" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm md:text-base font-semibold text-gray-900">YOU-25 Camp 2026</p>
                <p className="text-xs text-gray-500">Evangelical Restoration Church</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/" className="inline-flex items-center transition hover:opacity-90">
                <img src="/8558.png" alt="YOU-25 logo" className="h-10 w-auto object-contain md:h-14" />
              </Link>
              <Link
                to="/"
                className="px-3 py-2 rounded-full text-sm md:text-base font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition"
              >
                {language === 'en' ? 'Home' : 'Ahabanza'}
              </Link>
              <button
                onClick={() => navigate('/camp-registration')}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
              >
                {language === 'en' ? 'Register Now' : 'Iyandikishe'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {/* Badge / YOU-25 logo */}
            <img
              src="/8558.png"
              alt={language === 'en' ? 'YOU-25 logo' : 'YOU-25'}
              className="mx-auto mb-8 mb-6 w-40 md:w-52 h-auto object-contain"
            />

            {/* Main Heading */}
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'en' ? (
                <>
                  {t.title}
                  <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">
                    {t.subtitle}
                  </span>
                </>
              ) : (
                <>
                  {t.title}
                  <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">
                    {t.subtitle}
                  </span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className={`text-xl md:text-2xl mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t.description}
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-lg font-semibold hover:shadow-xl hover:scale-105 transition transform"
            >
              {t.cta}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-5 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 right-5 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2s"></div>
      </div>

      {/* Gallery Strip */}
      <div className="py-10 md:py-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.4rem] bg-white/5 backdrop-blur-sm shadow-[0_24px_60px_rgba(40,20,90,0.04)] px-2 md:px-6 py-8 md:py-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/85 via-white/35 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/85 via-white/35 to-transparent" />

            <div className="relative h-[440px] md:h-[520px] flex items-end justify-center">
              {/* Auto-rotating carousel with 5 visible images */}
              {getDisplayImages().map((item, i) => {
                const leftOffsets = ['5%', '24%', '48%', '72%', '91%']
                const topOffsets = [140, 80, 35, 80, 140]
                const rotations = [-14, -7, 0, 7, 14]
                const sizes = [
                  { width: 180, height: 340 },
                  { width: 210, height: 380 },
                  { width: 240, height: 420 },
                  { width: 210, height: 380 },
                  { width: 180, height: 340 },
                ]
                const size = sizes[i] ?? sizes[2]
                const animationClasses = ['float-slow', 'float-fast', 'float-anim', 'float-fast', 'float-slow']
                const animationDelay = i * 0.3

                return (
                  <div
                    key={i}
                    className={`absolute image-badge ${animationClasses[i]} transition-all duration-500`} 
                    style={{
                      left: leftOffsets[i] ?? '50%',
                      top: `${topOffsets[i] ?? 60}px`,
                      width: `${size.width}px`,
                      height: `${size.height}px`,
                      transform: `translateX(-50%) rotate(${rotations[i] ?? 0}deg)`,
                      transformOrigin: 'bottom center',
                      zIndex: i === 2 ? 50 : 40 - Math.abs(2 - i),
                      animationDelay: `${animationDelay}s`,
                    }}
                  >
                    <img src={item.src} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                    <div className="image-caption">{item.title}</div>
                  </div>
                )
              })}

              {/* Navigation buttons */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-60 bg-white/60 hover:bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg transition"
              >
                <ChevronLeft size={24} className="text-gray-800" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-60 bg-white/60 hover:bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg transition"
              >
                <ChevronRight size={24} className="text-gray-800" />
              </button>

              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-60 flex gap-2">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'en' ? 'Why Join Us?' : 'Kuki Jira?'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={`group p-8 rounded-2xl transition transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-white hover:shadow-2xl'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'en' ? "Ready to Start Your Journey?" : "Nimeze kumuritamo Inzira?"}
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            {language === 'en' 
              ? 'Join hundreds of youth this summer. Limited spots available!'
              : 'Jira hamwe n\'amahoro menshi ino mwaka. Ibifo bitigiti!'}
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition"
          >
            {t.cta}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
