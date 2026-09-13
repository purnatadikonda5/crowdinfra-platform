'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { toast } from 'react-toastify'

const SignupPage = ({ setIsLogin, profilePhoto }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    age: '',
    address: '',
    bio: '',
    agreeTerms: false,
    otp: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms and Conditions'

    return newErrors
  }

  const sendOtp = async () => {
    if (!formData.phone.trim()) {
      setErrors({ ...errors, phone: 'Phone number is required to receive OTP' })
      return
    }

    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'
      await axios.post(`${backendUrl}/api/auth/send-otp`, { phone: formData.phone })
      toast.success('OTP sent to your phone number!')
      setShowOtpInput(true)
      setFormData(prev => ({ ...prev, otp: '' }))
      setErrors((prev) => ({ ...prev, phone: '', otp: '' }))
    } catch (error) {
      setErrors({
        ...errors,
        phone: error.response?.data?.message || 'Failed to send OTP. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!formData.otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'Please enter the OTP' }))
      return
    }
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'
      const res = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        phone: formData.phone,
        otp: formData.otp,
      })
      if (res.data?.verified) {
        setEmailVerified(true)
        toast.success('Phone verified successfully!')
      } else {
        setErrors(prev => ({ ...prev, otp: 'Incorrect OTP. Please try again.' }))
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        otp: error.response?.data?.message || 'OTP verification failed',
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()

    // Ensure OTP is provided if it's required
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Enforce that OTP verification has occurred
    if (!emailVerified) {
      toast.error('Please verify your email with the OTP')
      setErrors((prev) => ({
        ...prev,
        otp: 'Please verify your email with the OTP',
      }))
      return
    }

    // Proceed with signup after OTP verification succeeds
    setIsSubmitting(true)
    try {
      const formDataWithPhoto = new FormData()
      Object.keys(formData).forEach((key) => {
        formDataWithPhoto.append(key, formData[key])
      })

      if (profilePhoto) {
        formDataWithPhoto.append('profilePhoto', profilePhoto)
      }

      for (let pair of formDataWithPhoto.entries()) {
        console.log(pair[0], pair[1])
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';
      const response = await axios.post(
        `${backendUrl}/api/auth/signup`,
        formDataWithPhoto,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      toast.success('Registration successful! Redirecting to login...')
      setIsLogin(true)
    } catch (error) {
      console.error('Registration error:', error)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';
      setErrors({
        submit:
          error.response?.data?.message ||
          error.message + ` (URL: ${backendUrl})` ||
          'Failed to register. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  //   // Proceed with signup after OTP verification succeeds
  //   setIsSubmitting(true)
  //   try {
  //     const formDataWithPhoto = new FormData()
  //     Object.keys(formData).forEach((key) => {
  //       formDataWithPhoto.append(key, formData[key])
  //     })

  //     if (profilePhoto) {
  //       formDataWithPhoto.append('profilePhoto', profilePhoto)
  //     }

  //     // Log each field for debugging purposes
  //     for (let pair of formDataWithPhoto.entries()) {
  //       console.log(pair[0], pair[1])
  //     }

  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/auth/signup`,
  //       formDataWithPhoto,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       }
  //     )

  //     toast.success('Registration successful! Redirecting to login...')
  //     setIsLogin(true)
  //   } catch (error) {
  //     console.error('Registration error:', error)
  //     setErrors({
  //       submit:
  //         error.response?.data?.message ||
  //         'Failed to register. Please try again.',
  //     })
  //   } finally {
  //     setIsSubmitting(false)
  //     setLoading(false)
  //   }
  // }

  return (
    <div className='w-full p-3 sm:p-6 rounded-lg shadow-md text-gray-800 dark:text-gray-200'>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Name */}
          <div className='col-span-2 md:col-span-1'>
            <label
              className='block text-gray-700 dark:text-gray-300 mb-1 text-sm'
              htmlFor='name'
            >
              Full Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border ${
                errors.name
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder='John Doe'
            />
            {errors.name && (
              <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className='col-span-2 md:col-span-1'>
            <label className='block text-gray-700 dark:text-gray-300 mb-1 text-sm' htmlFor='email'>
              Email Address <span className='text-red-500'>*</span>
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 dark:bg-gray-800 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder='your.email@example.com'
            />
            {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
          </div>

          {/* Phone with OTP */}
          <div className='col-span-2 md:col-span-1'>
            <label className='block text-gray-700 dark:text-gray-300 mb-1 text-sm' htmlFor='phone'>
              Phone Number <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-col space-y-2'>
              <div className='flex items-center'>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder='10-digit mobile number'
                  disabled={emailVerified}
                />
                {!emailVerified && (
                  <button
                    type='button'
                    onClick={sendOtp}
                    className='ml-2 px-3 py-2 h-full whitespace-nowrap bg-blue-600 text-sm text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 disabled:opacity-50'
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : showOtpInput ? 'Resend' : 'Send OTP'}
                  </button>
                )}
              </div>
              {errors.phone && <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>}

              {showOtpInput && !emailVerified && (
                <div className='w-full'>
                  <input
                    type='text'
                    id='otp'
                    name='otp'
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                    className='w-full px-3 py-2 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-lg font-mono'
                    placeholder='Enter 6-digit OTP'
                  />
                  {errors.otp && <p className='text-red-500 text-xs mt-1'>{errors.otp}</p>}
                  <button
                    type='button'
                    onClick={verifyOtp}
                    className='mt-2 px-4 py-2 bg-green-600 text-sm text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              )}

              {emailVerified && (
                <p className='text-green-600 text-sm flex items-center gap-1'>✓ Phone verified!</p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className='col-span-2 md:col-span-1'>
            <label
              className='block text-gray-700 dark:text-gray-300 mb-1 text-sm'
              htmlFor='gender'
            >
              Gender
            </label>
            <select
              id='gender'
              name='gender'
              value={formData.gender}
              onChange={handleChange}
              className='w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option
                value=''
                disabled
                className='text-gray-700 dark:text-gray-300'
              >
                Select gender
              </option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Other'>Other</option>
            </select>
          </div>

          {/* Age */}
          <div className='col-span-2 md:col-span-1'>
            <label
              className='block text-gray-700 dark:text-gray-300 mb-1 text-sm'
              htmlFor='age'
            >
              Age
            </label>
            <input
              type='number'
              id='age'
              name='age'
              value={formData.age}
              onChange={handleChange}
              min='18'
              max='120'
              className='w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Age'
            />
          </div>

          {/* Address */}
          <div className='col-span-2 md:col-span-1'>
            <label
              className='block text-gray-700 dark:text-gray-300 mb-1 text-sm'
              htmlFor='address'
            >
              Address
            </label>
            <input
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleChange}
              className='w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='123, Main Street, City'
            />
          </div>

          {/* Password */}
          <div className='col-span-2 md:col-span-1'>
            <label
              className='block text-gray-700 dark:text-gray-300 mb-1 text-sm'
              htmlFor='password'
            >
              Password <span className='text-red-500'>*</span>
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border ${
                errors.password
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder='••••••••'
            />
            {errors.password && (
              <p className='text-red-500 text-xs mt-1'>{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className='col-span-2 md:col-span-1'>
            <label
              className='block text-gray-700 dark:text-gray-300 mb-1 text-sm'
              htmlFor='confirmPassword'
            >
              Confirm Password <span className='text-red-500'>*</span>
            </label>
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border ${
                errors.confirmPassword
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder='••••••••'
            />
            {errors.confirmPassword && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className='col-span-2'>
            <div className='flex items-start'>
              <input
                type='checkbox'
                id='agreeTerms'
                name='agreeTerms'
                checked={formData.agreeTerms}
                onChange={handleChange}
                className='mt-1 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500'
              />
              <label
                className='ml-2 block text-sm text-gray-700 dark:text-gray-300'
                htmlFor='agreeTerms'
              >
                I agree to the{' '}
                <Link href='/terms' className='text-blue-600 hover:underline'>
                  Terms and Conditions
                </Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className='text-red-500 text-xs mt-1'>{errors.agreeTerms}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className='col-span-2 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 rounded-lg p-3 mb-4'>
              <p className='text-red-700 dark:text-red-400 text-sm'>
                {errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className='col-span-2'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full mb-5 mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SignupPage
