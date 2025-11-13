/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH: string
  // Add other VITE_ env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend Window interface for runtime-env.js
interface Window {
  env: {
    PUBLIC_URL: string
    REACT_APP_BASE_PATH: string
    REACT_APP_ENVIRONMENT: string
    REACT_APP_FIREBASE_API_KEY: string
    REACT_APP_FIREBASE_AUTH_DOMAIN: string
    REACT_APP_FIREBASE_APP_ID: string
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string
    REACT_APP_FIREBASE_PROJECT_ID: string
    REACT_APP_FIREBASE_STORAGE_BUCKET: string
    REACT_APP_FIREBASE_MEASUREMENT_ID: string
    REACT_APP_ISM_USER_INTERACTION_BASE_URL: string
    REACT_APP_ISM_API_BASE_URL: string
    REACT_APP_ISM_QUERY_API_BASE_URL: string
    REACT_APP_ISM_STREAM_API_BASE_URL: string
  }
}
