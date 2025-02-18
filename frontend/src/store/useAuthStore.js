import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL =import.meta.env.MODE === "development" ?"http://localhost:5059":"/";


export const useAuthStore= create((get,set)=>({
    authUser:null,
    isSingingUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers: [],
    socket:null,

    checkAuth: async()=>{
        try {
            const res=await axiosInstance.get("/auth/check")

            set({authUser:res.data})
            get().connectSocket()
        } catch (error) {
            console.log("error in checkAuth",error);
            set({authUser:null})
        }finally{
            set({isCheckingAuth:false});
        }
    },
    signup: async (data)=>{
        set({isSingingUp:true});
        try {
            const res=await axiosInstance.post("/auth/signup",data);
            set({authUser:res.data});
            toast.success("Account Created Successfully :)");
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message);
           
        }
        finally{
            set({isSingingUp:false})
        }
    },
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");
          get().connectSocket()
         
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      },

    logout : async()=>{
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("Logout Successfully :(")
            get().disConnectSocket()
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error("Error");
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
      connectSocket: () => {
        const { authUser } = get();
        
        // Validate user ID before connecting
        if (!authUser?._id || typeof authUser._id !== 'string') {
          console.error('Invalid user ID for socket connection');
          return;
        }
    
        if (get().socket?.connected) return;
    
        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
          transports: ['websocket'] // Force WebSocket transport
        });
    
        // Add error handling
        socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message);
        });
    
        socket.on("getOnlineUsers", (userIds) => {
          // Validate received user IDs
          if (Array.isArray(userIds)) {
            set({ onlineUsers: userIds });
          } else {
            console.error('Invalid online users data:', userIds);
          }
        });
    
        set({ socket });
      },
      disConnectSocket:()=>{
        if (get().socket?.connected) get().socket.disconnect();
      }
}))