import { QRCodeSVG } from 'qrcode.react'
import { useLocation } from 'react-router-dom'
import { Printer } from 'lucide-react'

export function QRPage() {
  const location = useLocation()
  const baseUrl = window.location.origin
  const qrUrl = `${baseUrl}/`

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Código QR</h1>
        <p className="text-sm text-gray-500 mt-1">Imprime este código y colócalo en la entrada de la finca</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center" id="qr-print">
        <div className="mb-4">
          <span className="text-4xl">🌴</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Finca San Luis</h2>
        <p className="text-sm text-gray-500 mb-6">Sistema de Asistencia</p>

        <div className="inline-block p-4 bg-white rounded-xl border-2 border-gray-200">
          <QRCodeSVG
            value={qrUrl}
            size={280}
            level="H"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#111827"
          />
        </div>

        <p className="text-sm text-gray-500 mt-6">Escanea con tu celular para registrar tu asistencia</p>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">URL: {qrUrl}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          <Printer className="w-5 h-5" />
          Imprimir QR
        </button>
      </div>

      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 text-sm mb-2">Instrucciones:</h3>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>1. Imprime este código QR en tamaño grande (mínimo 20x20 cm)</li>
          <li>2. Colócalo en un lugar visible en la entrada de la finca</li>
          <li>3. Los trabajadores escanean con su celular</li>
          <li>4. Ingresan su PIN y registran su entrada/salida</li>
          <li>5. El sistema verifica la ubicación GPS automáticamente</li>
        </ul>
      </div>
    </div>
  )
}