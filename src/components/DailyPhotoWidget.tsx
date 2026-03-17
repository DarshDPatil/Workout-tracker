import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Camera, X, Aperture } from 'lucide-react';

const DailyPhotoWidget = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  
  // --- WEBCAM STATES ---
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Load saved photo on mount
  useEffect(() => {
    const savedPhoto = localStorage.getItem('todays_pic');
    if (savedPhoto) setPhoto(savedPhoto);
  }, []);

  // --- STANDARD GALLERY UPLOAD ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhoto(result);
        localStorage.setItem('todays_pic', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- WEBCAM LOGIC ---
  const startWebcam = async () => {
    setIsWebcamOpen(true);
    try {
      // Ask the browser for video permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } // 'user' prefers webcam, 'environment' prefers rear camera
      });
      // Attach the live stream to our video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied or unavailable:", err);
      alert("Please allow camera permissions in your browser.");
      setIsWebcamOpen(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop()); // Turn off the camera light
    }
    setIsWebcamOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match the video feed
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame onto the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas drawing into a Base64 image
        const imageDataUrl = canvas.toDataURL('image/png');
        setPhoto(imageDataUrl);
        localStorage.setItem('todays_pic', imageDataUrl);
        
        stopWebcam(); // Close the modal
      }
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    localStorage.removeItem('todays_pic');
  };

  return (
    <div className="glass-liquid-terminal p-8 flex flex-col relative overflow-hidden w-full">
      
      {/* Header & Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black uppercase text-slate-950 tracking-tight">
          Today's Pic
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => galleryInputRef.current?.click()}
            className="w-10 h-10 rounded-[14px] bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-white/10 text-indigo-600"
          >
            <ImageIcon size={18} />
          </button>
          
          {/* Changed this button to trigger the new webcam function */}
          <button 
            onClick={startWebcam}
            className="w-10 h-10 rounded-[14px] bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-white/10 text-indigo-600"
          >
            <Camera size={18} />
          </button>
        </div>
      </div>

      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageUpload} className="hidden" />

      {/* Main Preview Area */}
      <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-black/5 border border-dashed border-white/20 flex flex-col items-center justify-center group hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
        {photo ? (
          <>
            <img src={photo} alt="Progress" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
            <button 
              onClick={removePhoto}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer" onClick={() => galleryInputRef.current?.click()}>
            <Camera size={32} strokeWidth={1.5} className="text-indigo-600/60" />
            <span className="tech-label opacity-60">No Photo Yet</span>
          </div>
        )}
      </div>

      {/* --- THE WEBCAM MODAL --- */}
      {isWebcamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          
          {/* Close Button */}
          <button onClick={stopWebcam} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full backdrop-blur-md">
            <X size={24} />
          </button>

          {/* Live Video Feed */}
          <div className="w-full max-w-md aspect-square rounded-[32px] overflow-hidden bg-black mb-6 relative shadow-[0_0_40px_rgba(79,70,229,0.2)] border border-white/10">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirrors the video so it feels like a mirror
            />
            {/* Tactical Crosshair Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/20 m-8 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                </div>
            </div>
          </div>

          {/* Snap Photo Button */}
          <button 
            onClick={capturePhoto}
            className="flex items-center gap-2 px-8 py-4 bg-white text-slate-950 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            <Aperture size={18} />
            Capture Target
          </button>

          {/* Hidden Canvas used to freeze the frame */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

    </div>
  );
};

export default DailyPhotoWidget;
