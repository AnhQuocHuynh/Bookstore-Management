import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScanBarcode, X, Zap } from "lucide-react";
import { toast } from "sonner";

interface ScannerModalProps {
    onClose: () => void;
    onScan: (code: string) => void; // Giả lập trả về code hoặc object
}

export const ScannerModal = ({ onClose, onScan }: ScannerModalProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                toast.error("Không thể truy cập camera.");
                onClose();
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [onClose]);

    const handleSimulateScan = () => {
        // Giả lập logic quét thành công
        onScan("SIMULATED_CODE");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <ScanBarcode className="text-teal-400" /> Quét mã vạch
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-square bg-black rounded-3xl overflow-hidden border-2 border-gray-800 shadow-2xl">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onClick={handleSimulateScan}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="relative w-64 h-40 border-2 border-teal-500/50 rounded-lg bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        {/* Laser effect */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_linear_infinite]"></div>
                    </div>
                    <p className="mt-8 text-teal-100 text-sm bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                        Di chuyển camera đến mã vạch
                    </p>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <Button variant="outline" className="border-teal-500 text-teal-400" onClick={() => toast.info("Bật đèn flash")}>
                    <Zap className="mr-2 h-4 w-4" /> Flash
                </Button>
                <Button className="bg-teal-600 text-white" onClick={onClose}>
                    Nhập thủ công
                </Button>
            </div>
        </div>
    );
};