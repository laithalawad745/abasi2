// components/ToastNotification.jsx
'use client';

import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// تخصيص التوست للعبة
export const showSuccessToast = (message, duration = 4000) => {
  toast.success(message, {
    position: "top-center",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '12px',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  });
};

export const showErrorToast = (message, duration = 4000) => {
  toast.error(message, {
    position: "top-center",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '12px',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  });
};

export const showWarningToast = (message, duration = 4000) => {
  toast.warning(message, {
    position: "top-center",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '12px',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  });
};

export const showInfoToast = (message, duration = 4000) => {
  toast.info(message, {
    position: "top-center",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '12px',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  });
};

// Component التوست الأساسي
export default function ToastNotification() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={true}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      style={{
        zIndex: 9999,
        fontFamily: 'Arial, sans-serif',
      }}
      toastStyle={{
        borderRadius: '12px',
        padding: '16px',
        fontSize: '16px',
        fontWeight: 'bold',
        minHeight: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    />
  );
}