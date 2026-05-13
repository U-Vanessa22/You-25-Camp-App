// src/App.jsx
import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { Sun, Moon, Globe, LayoutDashboard, QrCode, X, Download, Menu, ArrowRight, Users, Calendar, Shield } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from './lib/supabase'
import AdminDashboard from './components/AdminDashboard'
import Home from './components/Home'

// QR Scanner Modal Component
function QRScannerModal({ onClose, onScan }) {
  const [error, setError] = useState('')
  const scannerRef = useRef(null)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader-container')
    scannerRef.current = scanner

    const startScanning = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            scanner.stop()
            if (decodedText.includes('/register') || decodedText.includes('registration')) {
              onScan('registration')
            } else {
              onScan(decodedText)
            }
            onClose()
          },
          (errorMessage) => {
            if (!errorMessage.includes('NotFoundException')) {
              console.warn(errorMessage)
            }
          }
        )
      } catch (err) {
        console.error('Error starting scanner:', err)
        setError('Cannot access camera. Please check permissions.')
      }
    }

    startScanning()

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [onScan, onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black/50">
        <h3 className="text-xl font-bold text-white">Scan QR Code</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div id="qr-reader-container" className="w-full max-w-md rounded-2xl overflow-hidden" />
      </div>
      <div className="p-6 bg-black/50">
        {error && (
          <div className="p-3 bg-red-500/20 rounded-xl border border-red-500 mb-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        <p className="text-gray-400 text-sm text-center">Scan the QR code displayed at the church</p>
      </div>
    </div>
  )
}

// QR Code Display Modal
function QRCodeModal({ onClose }) {
  const envHost = import.meta.env.VITE_HOST_IP
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://you-25-camp-app.vercel.app'
  const hostIsLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const baseUrl = hostIsLocal && envHost
    ? `${window.location.protocol}//${envHost}${window.location.port ? `:${window.location.port}` : ''}`
    : publicSiteUrl.replace(/\/$/, '')
  const qrValue = `${baseUrl}/register`

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas')
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = 'registration-qrcode.png'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      toast.success('QR Code downloaded!')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Registration QR Code</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="flex justify-center py-6">
          <QRCodeCanvas
            id="qr-code-canvas"
            value={qrValue}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scan this QR code to open the registration page on this app
          </p>
          <p className="text-xs text-gray-500 mt-2 break-all">{qrValue}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadQR} className="flex-1 bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2">
            <Download size={18} /> Download
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Homepage Component
function HomePage({ isDarkMode, toggleTheme, language, toggleLanguage, t }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: language === 'en' ? 'Community Based' : 'Isunganirizo',
      description: language === 'en' 
        ? 'Connect with fellow youth in a faith-filled environment'
        : 'Hurira n\'abandi bakristu mu mimerere myiza'
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: language === 'en' ? 'Well Planned' : 'Itegurwa Ryiza',
      description: language === 'en'
        ? 'Activities and sessions carefully planned for spiritual growth'
        : 'Ibikorwa bitegurwa neza kugirango wigire byinshi'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: language === 'en' ? 'Safe Environment' : 'Umutekano',
      description: language === 'en'
        ? 'Secure and supervised camp for all participants'
        : 'Ahabugenewe kandi afite umutekano kuri buri wese'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img src="/Logo-ERC.jpeg" alt="ERC" className="w-full h-full rounded-xl object-cover" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-xs">YC</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-800 text-lg">You-25 Camp 2026</h1>
                <p className="text-xs text-gray-500">Evangelical Restoration Church</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium transition">
                {language === 'en' ? 'Home' : 'Ahabanza'}
              </Link>
              <Link to="/camp-registration" className="text-gray-700 hover:text-purple-600 font-medium transition">
                {language === 'en' ? 'Camp Registration' : 'Iyandikishwa'}
              </Link>
              
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                <Globe size={16} />
                <span className="text-sm font-medium">{language === 'en' ? 'EN' : 'RW'}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link to="/camp-registration">
                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                  {language === 'en' ? 'Register Now' : 'Iyandikishe'}
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-3 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={toggleLanguage}
                className="px-2 py-1 rounded-lg bg-gray-100 text-sm font-medium"
              >
                {language === 'en' ? 'RW' : 'EN'}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 animate-slideDown">
            <div className="px-4 py-3 space-y-2">
              <Link to="/" className="block py-2 text-gray-700 hover:text-purple-600" onClick={() => setMobileMenuOpen(false)}>
                {language === 'en' ? 'Home' : 'Ahabanza'}
              </Link>
              <Link to="/camp-registration" className="block py-2 text-gray-700 hover:text-purple-600" onClick={() => setMobileMenuOpen(false)}>
                {language === 'en' ? 'Camp Registration' : 'Iyandikishwa'}
              </Link>
              <Link to="/camp-registration">
                <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold">
                  {language === 'en' ? 'Register Now' : 'Iyandikishe'}
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <span className="mr-2">🌟</span>
              {language === 'en' ? 'You-25 Camp 2026' : "YOU-25 Camp 2026"}
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              {language === 'en' ? (
                <>
                  Join You-25 Camp,
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block mt-2">
                    Grow in Faith
                  </span>
                </>
              ) : (
                <>
                  Injira mu YOU-25 Camp,
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block mt-2">
                    Kura Mu Kwizera
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              {language === 'en' 
                ? 'Join us for an unforgettable spiritual journey. Connect with fellow youth, grow in faith, and make lasting memories.'
                : 'Injira muri uru rugendo rwo mu mwuka rutazibagirana. Hurira n\'urubyiruko, gukura mu kwizera, no gukora ibyibutso bidazima.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/camp-registration">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto sm:mx-0">
                  {language === 'en' ? 'Register Now' : 'Iyandikishe Ubu'} 
                  <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-gray-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">100+</p>
              <p className="text-gray-600 text-sm">{language === 'en' ? 'Campers' : 'Abitabiriye'}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">20+</p>
              <p className="text-gray-600 text-sm">{language === 'en' ? 'Activities' : 'Ibikorwa'}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">5+</p>
              <p className="text-gray-600 text-sm">{language === 'en' ? 'Churches' : 'Amatorero'}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">5+</p>
              <p className="text-gray-600 text-sm">{language === 'en' ? 'Speakers' : 'Abavuga'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main App Component
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState('en')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showQRCodeModal, setShowQRCodeModal] = useState(false)
  const [supabaseConnected, setSupabaseConnected] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('registered_children').select('count', { count: 'exact', head: true })
        if (error) throw error
        setSupabaseConnected(true)
        toast.success('Connected to database!')
      } catch (error) {
        console.error('Supabase connection error:', error)
        setSupabaseConnected(false)
        toast.error('Database connection failed. Check your .env file')
      }
    }
    checkConnection()
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode(!isDarkMode)
  const toggleLanguage = () => setLanguage(language === 'en' ? 'rw' : 'en')

  const t = (key) => {
    const translations = {
      en: {
        appTitle: 'YOU-25 Camp 2026',
        churchName: 'Evangelical Restoration Church Gikondo Parish',
      },
      rw: {
        appTitle: 'YOU-25 Camp 2026',
        churchName: 'Itorero ry\'Isanamitiro Paruwasi ya Gikondo',
      }
    }
    return translations[language][key] || translations.en[key] || key
  }

  const handleQRScan = (scannedType) => {
    if (scannedType === 'registration') {
      toast.success('Opening Registration Form')
    } else {
      toast.info(`Scanned: ${scannedType}`)
    }
  }

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <Toaster position="top-center" />
        
        {showQRScanner && <QRScannerModal onClose={() => setShowQRScanner(false)} onScan={handleQRScan} />}
        {showQRCodeModal && <QRCodeModal onClose={() => setShowQRCodeModal(false)} />}
        
        <Routes>
          <Route path="/" element={
            <Home 
              isDarkMode={isDarkMode}
              language={language}
            />
          } />
          <Route path="/register" element={
            <MainContent 
              t={t} 
              isDarkMode={isDarkMode} 
              setShowQRCodeModal={setShowQRCodeModal} 
              supabaseConnected={supabaseConnected}
              showQRScanner={showQRScanner}
              setShowQRScanner={setShowQRScanner}
            />
          } />
          <Route path="/camp-registration" element={
            <MainContent 
              t={t} 
              isDarkMode={isDarkMode} 
              setShowQRCodeModal={setShowQRCodeModal} 
              supabaseConnected={supabaseConnected}
              showQRScanner={showQRScanner}
              setShowQRScanner={setShowQRScanner}
            />
          } />
          <Route path="/admin" element={<AdminDashboard t={t} isDarkMode={isDarkMode} />} />
        </Routes>
      </div>
    </Router>
  )
}

// Main Content Component (Registration Form - same as before)
function MainContent({ t, isDarkMode, setShowQRCodeModal, supabaseConnected, showQRScanner, setShowQRScanner }) {
  const [loading, setLoading] = useState(false)
  const [paymentProof, setPaymentProof] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [regForm, setRegForm] = useState({
    child_name: '',
    child_age: '',
    gender: '',
    fellowships: '',
    phone_number: '',
    guardian_name: '',
    guardian_phone: ''
  })
  
  const [payForm, setPayForm] = useState({
    payer_name: '',
    recipient_name: '',
    amount: ''
  })

  const FIXED_CODE = '1395770'

  const handleRegChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value })
  }

  const handlePayChange = (e) => {
    setPayForm({ ...payForm, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      toast.error(`Invalid file type. Please upload PNG or JPG only.`);
      e.target.value = '';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB.`);
      e.target.value = '';
      return;
    }
    
    setPaymentProof(file);
    toast.success(`File ready: ${(file.size / 1024).toFixed(0)} KB`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentProof) {
      toast.error(t('uploadProof'));
      return;
    }

    if (!supabaseConnected) {
      toast.error('Database not connected. Check your .env file');
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      toast.loading('Saving registration...', { id: 'save' });
      
      const { data: registrationData, error: registrationError } = await supabase
        .from('registered_children')
        .insert([
          {
            child_name: regForm.child_name,
            child_age: parseInt(regForm.child_age),
            gender: regForm.gender || null,
            pickup_location: regForm.fellowships || null,
            phone_number: regForm.phone_number || null,
            guardian_name: regForm.guardian_name,
            guardian_phone: regForm.guardian_phone || null,
            qr_code: `CAMP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
          }
        ])
        .select();

      if (registrationError) throw registrationError;
      
      const childId = registrationData[0]?.id;
      toast.success('Registration saved!', { id: 'save' });
      setUploadProgress(40);

      toast.loading('Uploading receipt...', { id: 'upload' });
      
      const originalExt = paymentProof.name.split('.').pop().toLowerCase();
      const fileName = `payment-${Date.now()}.${originalExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProof, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      setUploadProgress(70);
      
      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      toast.loading('Saving payment record...', { id: 'payment' });
      
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            payer_name: payForm.payer_name,
            recipient_name: payForm.recipient_name,
            amount: parseFloat(payForm.amount),
            payment_code: FIXED_CODE,
            payment_proof_url: publicUrlData.publicUrl,
            child_id: childId,
            status: 'completed'
          }
        ]);

      if (paymentError) throw paymentError;
      
      setUploadProgress(100);
      toast.success('✅ Registration & Payment Complete!', { id: 'payment', duration: 3000 });

      setRegForm({
        child_name: '', child_age: '', gender: '', fellowships: '',
        phone_number: '', guardian_name: '', guardian_phone: ''
      });
      setPayForm({ payer_name: '', recipient_name: '', amount: '' });
      setPaymentProof(null);
      const fileInput = document.getElementById('payment-proof');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: "url('/DF.jpeg')" }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button and QR Button */}
          <div className="flex justify-between items-center mb-4">
            <Link to="/" className="inline-flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-lg transition">
              ← Back to Home
            </Link>
            <button onClick={() => setShowQRCodeModal(true)} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg">
              <QrCode size={18} /> QR Code
            </button>
          </div>

          {/* Form Container */}
          <div className={`rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg`}>
            <div className="p-4 sm:p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Camp Registration</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Fill in the form below to register for Youth Camp 2025</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Registration Section */}
                <div id="registration-section">
                  <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                    Child Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input type="text" name="child_name" placeholder="Child's Full Name *" value={regForm.child_name} onChange={handleRegChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-purple-500" required />
                    <input type="number" name="child_age" placeholder="Child's Age *" value={regForm.child_age} onChange={handleRegChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-purple-500" required />
                    <select name="gender" value={regForm.gender} onChange={handleRegChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-purple-500">
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                    <input type="text" name="fellowships" placeholder="Gathers From (Fellowship)" value={regForm.fellowships} onChange={handleRegChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-purple-500" />
                    <input type="tel" name="phone_number" placeholder="Child's Phone" value={regForm.phone_number} onChange={handleRegChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-purple-500" />
                    <input type="text" name="guardian_name" placeholder="Guardian's Name *" value={regForm.guardian_name} onChange={handleRegChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-purple-500" required />
                    <input type="tel" name="guardian_phone" placeholder="Guardian's Phone" value={regForm.guardian_phone} onChange={handleRegChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>

                {/* Payment Section */}
                <div id="payment-section" className="mt-6 sm:mt-8">
                  <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                    Payment Information
                  </h3>

                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                    <p className="font-semibold text-center text-blue-800 text-sm sm:text-base">
                      📌 Use code: {FIXED_CODE} - Name: Guy
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input type="text" name="payer_name" placeholder="Payer's Name *" value={payForm.payer_name} onChange={handlePayChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-green-500" required />
                    <input type="text" name="recipient_name" placeholder="Recipient's Name *" value={payForm.recipient_name} onChange={handlePayChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-green-500" required />
                    <input type="number" name="amount" placeholder="Amount (RWF) *" value={payForm.amount} onChange={handlePayChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:ring-2 focus:ring-green-500" required />
                    <input type="text" placeholder="Payment Code" value={FIXED_CODE} readOnly className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border bg-gray-100 text-gray-600 cursor-not-allowed" />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">📎 Upload Payment Proof *</label>
                    <input id="payment-proof" type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border" required />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG files accepted (Max 5MB)</p>
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">Uploading: {uploadProgress}%</p>
                  </div>
                )}

                <button type="submit" disabled={loading || !supabaseConnected} className="w-full mt-6 sm:mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50">
                  {loading ? 'Processing...' : 'Submit Registration & Payment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App