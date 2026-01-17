export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-metron-purple/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-metron-purple rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg animate-pulse">{text}</p>
      </div>
    </div>
  )
}