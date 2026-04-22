import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    // Helpers
    const shortenHash = (hash) => {
        if (!hash) return '';
        return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    };

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket.io connected successfully:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });

        // Event for new campaign creation
        newSocket.on('onchain:createCampaign', (data) => {
            toast.success(`Chiến dịch mới vừa được tạo trên chuỗi khối!\nTx: ${shortenHash(data.transactionHash)}`, {
                icon: '🎉',
                duration: 5000,
            });
            window.dispatchEvent(new CustomEvent('blockchain:update', { detail: { type: 'createCampaign', data } }));
        });

        // Event for new donation -> Should trigger progress bar update
        newSocket.on('onchain:recordDonation', (data) => {
            toast.success(`Có quyên góp mới: $${data.amount} từ ${data.donor}!\nTx: ${shortenHash(data.transactionHash)}`, {
                icon: '💰',
                duration: 6000,
            });
            window.dispatchEvent(new CustomEvent('blockchain:update', { detail: { type: 'recordDonation', data } }));
        });

        // Event for fund disbursement
        newSocket.on('onchain:disburseFunds', (data) => {
            toast.success(`Đã giải ngân $${data.amount} thành công!\nTx: ${shortenHash(data.transactionHash)}`, {
                icon: '💸',
                duration: 6000,
            });
            window.dispatchEvent(new CustomEvent('blockchain:update', { detail: { type: 'disburseFunds', data } }));
        });

        // Event for closing campaign
        newSocket.on('onchain:closeCampaign', (data) => {
            toast.success(`Chiến dịch đã được đóng trên chuỗi.\nTx: ${shortenHash(data.transactionHash)}`, {
                icon: '🔒',
                duration: 5000,
            });
            window.dispatchEvent(new CustomEvent('blockchain:update', { detail: { type: 'closeCampaign', data } }));
        });

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            <Toaster 
               position="bottom-right"
               toastOptions={{
                 style: {
                   borderRadius: '10px',
                   background: '#333',
                   color: '#fff',
                 },
               }}
            />
            {children}
        </SocketContext.Provider>
    );
};
