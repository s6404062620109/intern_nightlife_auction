import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/payment.module.css';

function Payment() {
    const { auctionId } = useParams();
    const [ paymentData, setPaymentData ] = useState();

    useEffect(() => {
        if(!auctionId) return;

        const fetchAuctionPayment = async () => {
            try{
                const response = await backend.get(`/payment/readPaymentByAuctionId/${auctionId}`);

                if(response.status === 200){
                    setPaymentData(response.data);
                }
            } catch(error){
                console.log(error);
            }
        }
        fetchAuctionPayment();
    },[auctionId]);

  return (
    <div className={style.paymentPage}>
        <div className={style.container}>
            <h2 className={style.pageTitle}>Auction Payment</h2>

            {paymentData ? (
                <div className={style.paymentDetails}>
                    <div className={style.infoSection}>
                        <h3 className={style.title}>Payment Details</h3>
                        <div className={style.paymentInfo}>
                            <p><strong>Auction ID:</strong> {paymentData.paymentFind.auctionId}</p>
                            <p><strong>Price:</strong> ${paymentData.paymentFind.price}</p>
                            <p><strong>Payment Timeout:</strong> {new Date(paymentData.paymentFind.timeout).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className={style.qrSection}>
                        <h3 className={style.title}>QR Code</h3>
                        <img className={style.qrImage} src={paymentData.paymentFind.qrCode} alt="QR Code for Payment" />
                    </div>

                    <div className={style.proceedSection}>
                        <a
                            href={`BANK_PAY://pay?amount=${paymentData.paymentFind.price}&user=${paymentData.userId}`}
                            className={style.proceedButton}
                        >
                            Proceed to Payment
                        </a>
                    </div>
                </div>
            ) : (
                <p>Loading payment details...</p>
            )}
        </div>
    </div>
  )
}

export default Payment