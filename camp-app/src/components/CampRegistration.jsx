// src/components/CampRegistration.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { QrCode, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

function CampRegistration({ t, isDarkMode, setShowQRCodeModal, supabaseConnected }) {
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
      toast.error('Please upload payment proof');
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
            status: 'pending'
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
              <ArrowLeft size={18} /> Back to Home
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

export default CampRegistration