// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { LogIn, ArrowLeft, LayoutDashboard, CreditCard, Settings, BarChart3, PieChart, Pencil, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'

function AdminDashboard({ t, isDarkMode }) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  
  // Mock data for charts
  const [dailyData, setDailyData] = useState([
    { day: 'Mon', amount: 45000, registrations: 5 },
    { day: 'Tue', amount: 62000, registrations: 7 },
    { day: 'Wed', amount: 38000, registrations: 4 },
    { day: 'Thu', amount: 71000, registrations: 8 },
    { day: 'Fri', amount: 55000, registrations: 6 },
    { day: 'Sat', amount: 89000, registrations: 10 },
    { day: 'Sun', amount: 95000, registrations: 12 },
  ])
  
  const [paymentDistribution, setPaymentDistribution] = useState([
    { name: 'Full Amount (30k)', value: 15, color: '#8b5cf6' },
    { name: 'Partial Amount', value: 8, color: '#10b981' },
  ])
  
  const [payments, setPayments] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalRegistrations, setTotalRegistrations] = useState(0)
  const [fullPaymentsCount, setFullPaymentsCount] = useState(0)
  const [partialPaymentsCount, setPartialPaymentsCount] = useState(0)
  const [registrationsWithPayments, setRegistrationsWithPayments] = useState([])
  const [reloadKey, setReloadKey] = useState(0)
  const [editPayment, setEditPayment] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editStatus, setEditStatus] = useState('')

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]
  
  const [settings, setSettings] = useState({
    username: 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('campAdminLoggedIn')
    if (adminLoggedIn === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  useEffect(() => {
    // Fetch registrations and payments from Supabase
    const fetchData = async () => {
      try {
        const { data: regs, error: regsError } = await supabase
          .from('registered_children')
          .select('*')
          .order('created_at', { ascending: false })

        if (regsError) throw regsError

        const { data: pays, error: paysError } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false })

        if (paysError) throw paysError

        setRegistrations(regs || [])
        setPayments(pays || [])

        // compute totals
        const revenue = (pays || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
        setTotalRevenue(revenue)
        setTotalRegistrations((regs || []).length)

        // Group payments by child_id to determine full vs partial and per-child totals
        const paymentsByChild = {}
        ;(pays || []).forEach((p) => {
          const cid = p.child_id || 'unknown'
          paymentsByChild[cid] = (paymentsByChild[cid] || 0) + (parseFloat(p.amount) || 0)
        })

        const FULL_AMOUNT = 30000
        let full = 0
        let partial = 0
        Object.entries(paymentsByChild).forEach(([cid, sum]) => {
          if (sum >= FULL_AMOUNT) full += 1
          else partial += 1
        })

        setFullPaymentsCount(full)
        setPartialPaymentsCount(partial)

        // enrich registrations with paid and remaining
        const enriched = (regs || []).map((r) => {
          const paid = paymentsByChild[r.id] || 0
          const remaining = Math.max(FULL_AMOUNT - paid, 0)
          const status = paid >= FULL_AMOUNT ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid'
          return { ...r, paid, remaining, payment_status: status }
        })

        setRegistrationsWithPayments(enriched)
      } catch (err) {
        console.error('Error fetching admin data:', err)
        toast.error('Failed to load registrations or payments. Check DB connection.')
      }
    }
    fetchData()
  }, [reloadKey])

  // helper to compute payments by child from state
  const paymentsByChildMap = React.useMemo(() => {
    const map = {}
    payments.forEach((p) => {
      const cid = p.child_id || 'unknown'
      map[cid] = (map[cid] || 0) + (parseFloat(p.amount) || 0)
    })
    return map
  }, [payments])

  // Approve a pending payment (mark as completed)
  const approvePayment = async (paymentId) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', paymentId)

      if (error) throw error
      toast.success('Payment approved')
      setReloadKey((k) => k + 1)
    } catch (err) {
      console.error('Approve payment error:', err)
      toast.error('Failed to approve payment')
    }
  }

  const openEditPayment = (payment) => {
    setEditPayment(payment)
    setEditAmount(payment.amount || '')
    setEditStatus(payment.status || '')
  }

  const deletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment record?')) return

    try {
      const { error } = await supabase.from('payments').delete().eq('id', paymentId)
      if (error) throw error
      toast.success('Payment deleted')
      setReloadKey((k) => k + 1)
    } catch (err) {
      console.error('Delete payment error:', err)
      toast.error('Failed to delete payment')
    }
  }

  const saveEditPayment = async () => {
    if (!editPayment) return
    try {
      const payload = { amount: parseFloat(editAmount) || 0, status: editStatus }
      const { error } = await supabase.from('payments').update(payload).eq('id', editPayment.id)
      if (error) throw error
      toast.success('Payment updated')
      setEditPayment(null)
      setEditAmount('')
      setEditStatus('')
      setReloadKey(k => k + 1)
    } catch (err) {
      console.error('Save payment edit error:', err)
      toast.error('Failed to save changes')
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginData.username === 'admin' && loginData.password === 'admin123') {
      setIsLoggedIn(true)
      localStorage.setItem('campAdminLoggedIn', 'true')
      toast.success('Welcome Admin!')
    } else {
      toast.error('Invalid credentials. Use admin / admin123')
    }
  }

  const handleSaveSettings = () => {
    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    localStorage.setItem('adminUsername', settings.username)
    toast.success('Settings saved successfully!')
    setSettings({ ...settings, currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleLogout = () => {
    localStorage.removeItem('campAdminLoggedIn')
    setIsLoggedIn(false)
    toast.success('Logged out successfully')
    navigate('/')
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
            <p className="text-gray-600 mt-2">Enter your credentials to access dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            {/* <p className="text-sm text-gray-500">Demo: admin / admin123</p> */}
            <Link to="/" className="text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 mt-4">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard Content
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
      {/* Admin Navbar */}
      <div className={`sticky top-0 z-40 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="text-purple-600 hover:text-purple-700">
                <ArrowLeft size={24} />
              </button>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Admin Dashboard
              </h1>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-16 z-30 bg-inherit`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`relative grid grid-cols-3 overflow-hidden rounded-full p-1 shadow-inner ${isDarkMode ? 'bg-gray-700/70' : 'bg-gray-100/90'}`}>
            <div
              className={`absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full shadow-md transition-transform duration-300 ease-out ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
              style={{ transform: `translateX(${navTabs.findIndex((tab) => tab.id === activeTab) * 100}%)` }}
            />
            {navTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                  activeTab === id
                    ? isDarkMode
                      ? 'text-purple-300'
                      : 'text-purple-700'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} RWF</p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-sm text-gray-500">Total Registrations</p>
                <p className="text-2xl font-bold text-purple-600">{totalRegistrations}</p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-sm text-gray-500">Full Payments (30k)</p>
                <p className="text-2xl font-bold text-blue-600">{fullPaymentsCount}</p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-sm text-gray-500">Partial Payments</p>
                <p className="text-2xl font-bold text-orange-600">{partialPaymentsCount}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Daily Transactions */}
              <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <BarChart3 size={20} /> Daily Transactions
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="day" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis yAxisId="left" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }} 
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="amount" fill="#8b5cf6" name="Amount (RWF)" />
                    <Bar yAxisId="right" dataKey="registrations" fill="#10b981" name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Payment Distribution */}
              <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <PieChart size={20} /> Payment Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={paymentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center text-sm text-gray-500">
                  Full Amount: 30,000 RWF | Partial: Any amount below 30,000 RWF
                </div>
              </div>
            </div>
            {/* All Registrations Table (full list) */}
            <div className={`mt-8 p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>All Registrations</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">#</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Child</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Guardian</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Phone</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Paid</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Remaining</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {registrationsWithPayments.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        <td className="px-4 py-3 text-sm">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm">{r.child_name}</td>
                        <td className="px-4 py-3 text-sm">{r.guardian_name || '—'}</td>
                        <td className="px-4 py-3 text-sm">{r.phone_number || '—'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">{(r.paid || 0).toLocaleString()} RWF</td>
                        <td className="px-4 py-3 text-sm">{(r.remaining || 0).toLocaleString()} RWF</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${r.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : r.payment_status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                            {r.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Payment History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Payer</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Recipient</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Proof</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {payments.map((payment) => {
                    const payer = payment.payer_name || payment.payer || '—'
                    const recipient = payment.recipient_name || payment.recipient || '—'
                    const amount = parseFloat(payment.amount) || 0
                    const date = payment.created_at ? new Date(payment.created_at).toLocaleDateString() : payment.date || '—'
                    const code = payment.payment_code || payment.code || '—'
                    const status = payment.status || 'pending'
                    // derive child total and overall status
                    const childTotal = paymentsByChildMap[payment.child_id] || 0
                    const childStatus = childTotal >= 30000 ? 'completed' : childTotal > 0 ? 'partial' : 'pending'

                    return (
                      <tr key={payment.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        <td className="px-6 py-4 text-sm">{payer}</td>
                        <td className="px-6 py-4 text-sm">{recipient}</td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">{amount.toLocaleString()} RWF</td>
                        <td className="px-6 py-4 text-sm">{date}</td>
                        <td className="px-6 py-4 text-sm font-mono">{code}</td>
                        <td className="px-6 py-4 text-sm">
                          {payment.payment_proof_url ? (
                            <a href={payment.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs inline-flex items-center gap-1">
                              <img src={payment.payment_proof_url} alt="proof" className="w-8 h-8 rounded object-cover" />
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className={`px-2 py-1 rounded-full text-xs ${status === 'completed' ? 'bg-green-100 text-green-700' : status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{status}</span>
                              <small className="text-xs text-gray-500">child: {childStatus}</small>
                            </div>
                            {status !== 'completed' && (
                              <button onClick={() => approvePayment(payment.id)} className="px-2 py-1 bg-purple-600 text-white text-xs rounded-md hover:opacity-90">
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditPayment(payment)}
                              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={() => deletePayment(payment.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`max-w-md mx-auto rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                  type="text"
                  value={settings.username}
                  onChange={(e) => setSettings({...settings, username: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={settings.currentPassword}
                  onChange={(e) => setSettings({...settings, currentPassword: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  value={settings.newPassword}
                  onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={settings.confirmPassword}
                  onChange={(e) => setSettings({...settings, confirmPassword: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      {/* Edit Payment Modal */}
      {editPayment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Edit Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Payer</label>
                <p className="font-medium">{editPayment.payer_name || editPayment.payer}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Amount (RWF)</label>
                <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border">
                  <option value="pending">pending</option>
                  <option value="completed">completed</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => { setEditPayment(null); setEditAmount(''); setEditStatus('') }} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={saveEditPayment} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default AdminDashboard