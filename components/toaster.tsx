import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full max-w-sm p-4 space-y-4 sm:p-6">
      {toasts.map((toast) => (
        <div key={toast.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            {toast.title && <h3 className="text-sm font-medium text-gray-900">{toast.title}</h3>}
            {toast.description && <p className="mt-1 text-sm text-gray-500">{toast.description}</p>}
          </div>
          {toast.action}
          <button
            onClick={() => dismissToast(toast.id)}
            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

