import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/payment.module.css';

function Payment() {
    const { auctionId } = useParams();
    const [paymentData, setPaymentData] = useState();
    const [user, setUser] = useState({
        id: null,
        email: null,
        name: null,
        role: null,
        coin: null,
        profileImg: null,
        payment_method: [],
    });
    const [receipt, setReceipt] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const autherization = async () => {
            try {
                const response = await backend.get('/auth/authorization', { withCredentials: true });
                if (response.status === 200) {
                    setUser(response.data);
                }
            } catch (error) {
                console.log(error);
                if (error.response?.status === 401) {
                    alert("Please sign in first.");
                    window.location.href = '/signin';
                }
            }
        };
        autherization();
    }, []);

    useEffect(() => {
        if (!auctionId) return;
        const fetchAuctionPayment = async () => {
            try {
                const response = await backend.get(`/payment/readPaymentByAuctionId/${auctionId}`);
                if (response.status === 200) {
                    setPaymentData(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchAuctionPayment();
    }, [auctionId]);

    useEffect(() => {
        if (!paymentData || !user.id) return;
        if (user.id !== paymentData.paymentFind.userId) {
            alert("You are not the owner of this auction.");
            window.location.href = '/';
        }
    }, [user.id, paymentData]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setReceipt(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!receipt) {
            alert("Please select a receipt to upload.");
            return;
        }
    
        const formData = new FormData();
        formData.append("receipt", receipt);
        formData.append("userId", user.id);
        formData.append("auctionId", auctionId);
    
        try {
            const response = await backend.post('/payment/uploadReceipt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
    
            if (response.status === 200) {
                alert("Receipt uploaded successfully!");
            }
        } catch (error) {
            console.error("Error uploading receipt:", error);
        }
    };
    

    return (
        <div className={style.paymentPage}>
            <div className={style.container}>
                <h2 className={style.pageTitle}>Auction Payment</h2>
                {paymentData ? (
                    <div className={style.paymentDetails}>
                        <div className={style.infoSection}>
                            <h3 className={style.title}>Payment Details</h3>
                            <div className={style.paymentInfo}>
                                <p><strong>Auction ID:</strong> {paymentData.paymentFind._id}</p>
                                <p><strong>Price:</strong> ${paymentData.paymentFind.price}</p>
                                <p><strong>Payment Timeout:</strong> {new Date(paymentData.paymentFind.timeout).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className={style.qrSection}>
                            <h3 className={style.title}>QR Code</h3>
                            <img className={style.qrImage} src={paymentData.paymentFind.qrCode} alt="QR Code for Payment" />
                        </div>
                        <div className={style.uploadSection}>
                            <h3 className={style.title}>Upload Receipt</h3>
                            <input type="file" accept="image/*" onChange={handleFileChange} className={style.fileInput} />
                            {preview && <img className={style.receiptPreview} src={preview} alt="Receipt Preview" />}
                            <button className={style.uploadButton} onClick={handleUpload}>Upload</button>
                        </div>
                    </div>
                ) : (
                    <p>Loading payment details...</p>
                )}
            </div>
        </div>
    );
}

export default Payment;