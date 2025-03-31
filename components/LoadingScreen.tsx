export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl text-white">Loading...</p>
      </div>
    </div>
  )
}

