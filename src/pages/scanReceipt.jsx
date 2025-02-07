// import { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Tesseract from 'tesseract.js';

// const ScanReceipt = () => {
//     const [image, setImage] = useState(null);
//     const [ocrData, setOcrData] = useState([]);
//     const [receiptName, setReceiptName] = useState('');
//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const startCamera = () => {

//             const constraints = {
//                 video: {
//                     facingMode: "environment" // This specifies the rear camera
//                 }
//             };

//             navigator.mediaDevices.getUserMedia(constraints)
//                 .then(stream => {
//                     videoRef.current.srcObject = stream;
//                     videoRef.current.play();
//                 })
//                 .catch(err => {
//                     console.error("Error accessing webcam: ", err);
//                 });
//         };
//         startCamera();
//         return () => {
//             if (videoRef.current && videoRef.current.srcObject) {
//                 const stream = videoRef.current.srcObject;
//                 const tracks = stream.getTracks();
//                 tracks.forEach(track => track.stop());
//             }
//         };
//     }, []);

//     const parseText = (text) => {
//         console.log("OCR Text:", text);

//         const itemPattern = /(\d+)\s+(.+?)\s+(\d+\.\d+)/g;
//         const namePattern = /Nama Nota\s*:\s*(.+)/i;
//         const matches = [];
//         let match;
//         let receiptName = '';

//         const nameMatch = namePattern.exec(text);
//         if (nameMatch) {
//             receiptName = nameMatch[1].trim();
//         }

//         while ((match = itemPattern.exec(text)) !== null) {
//             matches.push({
//                 quantity: match[1].trim(),
//                 name: match[2].trim(),
//                 price: match[3].trim()
//             });
//         }

//         console.log("Parsed Items:", matches);
//         return { matches, receiptName };
//     };

//     const capturePhoto = () => {
//         const canvas = canvasRef.current;
//         const context = canvas.getContext('2d');
//         context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
//         const photoData = canvas.toDataURL('image/png');
//         setImage(photoData);
//         processOCR(photoData);
//     };

//     const processOCR = (dataUrl) => {
//         Tesseract.recognize(dataUrl, 'eng', {
//             logger: (m) => console.log(m)
//         }).then(({ data: { text } }) => {
//             console.log("OCR Text:", text);
//             const { matches, receiptName } = parseText(text);
//             setOcrData(matches);
//             setReceiptName(receiptName);
//         });
//     };

//     const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 const imgUrl = reader.result;
//                 setImage(imgUrl);
//                 processOCR(imgUrl);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleNext = () => {
//         const scanDate = new Date().toLocaleDateString('id-ID', {
//             day: '2-digit',
//             month: 'long',
//             year: 'numeric'
//         });
//         console.log("Navigating with data:", ocrData);
//         navigate('/receiptList', { state: { items: ocrData, receiptName, scanDate } });
//     };

//     const back = () => {
//         console.log("Navigating back")
//         navigate("/home")
//     }

//     return (
//         <div className="flex flex-col p-8">
//             <button
//                 className="top-4 left-4 text-3xl font-bold hover:opacity-80 mr-auto pb-8"
//                 onClick={back} // Navigasi kembali
//             >
//                 &#8592;
//             </button>
//             <div className='flex flex-col h-[660px] justify-between'>
//                 <div className='flex flex-col'>
//                     <div className='flex flex-col justify-center items-center'>
//                         <video ref={videoRef} width="1000" height="500" className="border text-center" />
//                         <canvas ref={canvasRef} width="400" height="300" style={{ display: 'none' }} />
//                         <button
//                             onClick={capturePhoto}
//                             className="mt-4 bg-gray-400 text-white py-2 px-4 rounded-full w-12 h-12 flex items-center justify-center"
//                         >
//                         </button>
//                     </div>
//                     <div className='flex justify-center'>
//                         <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleFileChange}
//                             className="mt-4"
//                         />
//                     </div>
//                     {image && (
//                         <div className="flex mt-4 gap-3">
//                             <h2 className="text-lg font-semibold">Preview :</h2>
//                             <img src={image} alt="Captured" className="mt-2 border w-[180px]" width="400" />
//                         </div>
//                     )}
//                 </div>
//                 <div>
//                     <button
//                         onClick={handleNext}
//                         className={`mt-4 w-full rounded border-2 border-gray-400 px-12 py-2 text-sm font-medium ${image ? 'bg-gray-400 text-white hover:bg-transparent hover:text-gray-700' : 'bg-gray-200 border-gray-200 text-white border-transparent cursor-not-allowed'} focus:outline-none focus:ring active:text-gray-00`}
//                         disabled={!image}
//                     >
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ScanReceipt;

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const ScanReceipt = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);

    // Start the camera when the component is mounted
    useEffect(() => {
        console.log("Starting camera...");
        const startCamera = () => {
            const constraints = {
                video: {
                    facingMode: "environment", // Use the rear camera
                },
            };

            navigator.mediaDevices
                .getUserMedia(constraints)
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                })
                .catch((err) => {
                    console.error("Error accessing webcam: ", err);
                });
        };

        startCamera();

        return () => {
            // Stop the camera when the component is unmounted
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, []);

    // Capture a photo from the video feed
    const capturePhoto = () => {
        console.log("Capturing photo...");
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (videoRef.current && canvas) {
            console.log("Video and canvas are available");
            // Set the canvas dimensions to match the video feed
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            // Draw the current video frame onto the canvas
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            // Convert the canvas content to a data URL
            const photoData = canvas.toDataURL("image/png");
            setImage(photoData);
            console.log("Photo data URL:", photoData);

            // Process the image for OCR
            processOCR(photoData);
        }
    };

    // Upload the captured photo to Veryfi
    const processOCR = async (photoData) => {
        console.log("Processing receipt...");
        const blob = await fetch(photoData).then((res) => res.blob());

        const formData = new FormData();
        formData.append("file", blob, "receipt.png");

        const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://api.veryfi.com/api/v8/partner/documents/",
            headers: {
                "Content-Type": "multipart/form-data",
                "Accept": "application/json",
                "CLIENT-ID": "vrfTOGLGPcV0jRLEWUUn1HsLlAhfIseICrONOG0", // Replace with your CLIENT-ID
                "AUTHORIZATION": "apikey smurfoxalion:919b3541a92862707f0d813c94ca2859", // Replace with your API key
            },
            data: formData,
        };

        try {
            console.log("Sending request to Veryfi...");
            const response = await axios(config);
            setResult(response.data);
            console.log("Receipt processed successfully:", response.data);
        } catch (error) {
            console.error("Error processing receipt:", error);
        }
    };

    return (
        <div className="receipt-uploader">
            <h1>Upload Receipt</h1>

            {/* Video Feed */}
            <video ref={videoRef} style={{ width: "100%", maxHeight: "300px" }} />

            {/* Canvas (hidden, used for capturing the image) */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Capture Button */}
            <button onClick={capturePhoto}>Capture Photo</button>

            {/* Display Captured Image */}
            {image && (
                <div>
                    <h3>Captured Photo:</h3>
                    <img src={image} alt="Captured Receipt" style={{ maxWidth: "100%" }} />
                </div>
            )}

            {/* Display OCR Results */}
            {result && (
                <div>
                    <h3>Parsed Receipt Data:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default ScanReceipt;