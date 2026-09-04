import { useRef, useState, useEffect } from 'react'

interface WeighingCameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

export default function WeighingCameraModal({ isOpen, onClose, onCapture }: WeighingCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    setCameraError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsCameraActive(true)
    } catch (err: any) {
      console.warn('Camera access error or unsupported:', err)
      setCameraError('Kamera tidak tersedia. Menggunakan upload file sebagai alternatif.')
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `weighing_${Date.now()}.jpg`, { type: 'image/jpeg' })
          onCapture(file)
          stopCamera()
          onClose()
        }
      }, 'image/jpeg', 0.85)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0])
      stopCamera()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="card-lifted w-full max-w-lg overflow-hidden bg-white p-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="font-display font-bold text-lg">Ambil Foto Bukti Penimbangan</h3>
          <button onClick={() => { stopCamera(); onClose() }} className="text-on-surface-variant hover:text-on-surface text-xl font-bold">✕</button>
        </div>

        <div className="my-4 relative bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[400px] object-cover" />
          ) : (
            <div className="p-6 text-center text-white space-y-3">
              <p className="text-sm opacity-80">{cameraError || 'Kamera sedang disiapkan...'}</p>
              <label className="btn-primary cursor-pointer inline-block">
                Pilih File Foto
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-between items-center pt-2">
          {isCameraActive ? (
            <button onClick={handleCapture} className="btn-primary w-full py-3">
              📸 Ambil Foto Penimbangan
            </button>
          ) : (
            <label className="btn-secondary w-full text-center cursor-pointer">
              📁 Upload dari File / Galeri
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
