import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  // Helpers
  const shortenHash = (hash) => {
    if (!hash) return "";
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  useEffect(() => {
    const apiHost =
      process.env.REACT_APP_API_URL ||
      (() => {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        if (port === "3002") {
          return `${protocol}//${hostname}:3000`;
        }
        return `${protocol}//${hostname}:${process.env.REACT_APP_API_URL ? "" : "3000"}`.replace(
          /:\d+$/,
          ":3000",
        );
      })();

    console.log("🔌 SocketProvider resolved backend host:", apiHost);
    const newSocket = io(apiHost);
    setSocket(newSocket);

    console.log("🔌 SocketProvider connecting to:", apiHost);
    newSocket.on("connect", () => {
      console.log("Socket.io connected successfully:", newSocket.id, {
        uri: newSocket.io.uri,
      });
    });

    newSocket.on("connect_error", (err) => {
      console.warn("❌ Socket connection error:", err.message);
      console.log("Socket target:", newSocket.io.uri);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason, {
        uri: newSocket.io.uri,
      });
    });

    // Event for new campaign creation
    newSocket.on("onchain:createCampaign", (data) => {
      toast.success(
        `Chiến dịch mới vừa được tạo trên chuỗi khối!\nTx: ${shortenHash(data.transactionHash)}`,
        {
          icon: "🎉",
          duration: 5000,
        },
      );
      window.dispatchEvent(
        new CustomEvent("blockchain:update", {
          detail: { type: "createCampaign", data },
        }),
      );
    });

    // Event for new donation -> Should trigger progress bar update
    newSocket.on("onchain:recordDonation", (data) => {
      toast.success(
        `Có quyên góp mới: $${data.amount} từ ${data.donor}!\nTx: ${shortenHash(data.transactionHash)}`,
        {
          icon: "💰",
          duration: 6000,
        },
      );
      window.dispatchEvent(
        new CustomEvent("blockchain:update", {
          detail: { type: "recordDonation", data },
        }),
      );
    });

    // Event for fund disbursement
    newSocket.on("onchain:disburseFunds", (data) => {
      toast.success(
        `Đã giải ngân $${data.amount} thành công!\nTx: ${shortenHash(data.transactionHash)}`,
        {
          icon: "💸",
          duration: 6000,
        },
      );
      window.dispatchEvent(
        new CustomEvent("blockchain:update", {
          detail: { type: "disburseFunds", data },
        }),
      );
    });

    // Event for closing campaign
    newSocket.on("onchain:closeCampaign", (data) => {
      toast.success(
        `Chiến dịch đã được đóng trên chuỗi.\nTx: ${shortenHash(data.transactionHash)}`,
        {
          icon: "🔒",
          duration: 5000,
        },
      );
      window.dispatchEvent(
        new CustomEvent("blockchain:update", {
          detail: { type: "closeCampaign", data },
        }),
      );
    });

    // ── EVENT CHÍNH: Khi Casso webhook được xử lý thành công ──────────
    // Bắn bởi webhookProcessingService sau khi ghi DB + blockchain
    newSocket.on("donation:confirmed", (data) => {
      console.log("🔔 [SOCKET] NHẬN SỰ KIỆN NỔ HŨ:", data);

      // Format số tiền
      const amountFmt = Number(data.amount || 0).toLocaleString("vi-VN") + " ₫";
      const title = data.campaignTitle || "Chiến dịch mới";
      const donor = data.donorName || "Mạnh thường quân";

      console.log("📢 Preparing toast notification:", {
        amountFmt,
        title,
        donor,
      });

      // 1. Hiển thị Toast (Đẹp - Bottom Right theo yêu cầu)
      toast.success(`🎉 Cảm ơn ${donor} đã ủng hộ chương trình thiện nguyện!\n💰 Số tiền: ${amountFmt}\n📍 ${title}`, {
        duration: 10000, 
        position: "bottom-right",
        style: {
          minWidth: "350px",
          fontSize: "16px",
          fontWeight: "500",
          borderLeft: "5px solid #22c55e",
          padding: "16px",
          color: "#fff",
          background: "#1f2937",
          zIndex: 999999,
        },
        icon: "🙏",
      });

      console.log("🎬 Toast queued - notification should appear at bottom-right");

      // Dispatch event để ProjectDetail cập nhật raised_amount real-time
      window.dispatchEvent(
        new CustomEvent("donation:confirmed", {
          detail: {
            campaignId: data.campaignId,
            amount: data.amount,
            newRaisedAmount: data.newRaisedAmount,
            txHash: data.txHash,
            donorName: data.donorName,
            timestamp: data.timestamp,
          },
        }),
      );

      // Cũng dispatch blockchain:update để AdminDashboard cập nhật
      window.dispatchEvent(
        new CustomEvent("blockchain:update", {
          detail: {
            type: "recordDonation",
            data: { ...data, campaignId: data.campaignId },
          },
        }),
      );
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
      {children}
    </SocketContext.Provider>
  );
};
