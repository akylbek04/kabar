/* eslint-disable @typescript-eslint/no-explicit-any */
import { API } from "@/lib/axios-client";
import type { LoginType, RegisterType, UserType } from "@/types/auth.type";
import { toast } from "sonner";
import { create } from "zustand";
//import { persist } from "zustand/middleware";
import { useSocket } from "./use-socket";
import { useNotifications } from "./use-notifications";
import { updateDocumentTitle } from "@/lib/notification-utils";

interface AuthState {
  user: UserType | null;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isAuthStatusLoading: boolean;
  isUpdatingProfile: boolean;

  register: (data: RegisterType) => void;
  login: (data: LoginType) => void;
  logout: () => void;
  isAuthStatus: () => void;
  updateProfile: (data: {
    name?: string;
    description?: string;
    status?: string;
    avatar?: File;
  }) => void;
}

//Without Persist
export const useAuth = create<AuthState>()((set) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isAuthStatusLoading: false,
  isUpdatingProfile: false,

  register: async (data: RegisterType) => {
    set({ isSigningUp: true });
    try {
      const response = await API.post("/auth/register", data);
      set({ user: response.data.user });
      useSocket.getState().connectSocket();
      toast.success("Register successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data: LoginType) => {
    set({ isLoggingIn: true });
    try {
      const response = await API.post("/auth/login", data);
      set({ user: response.data.user });
      useSocket.getState().connectSocket();
      toast.success("Login successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await API.post("/auth/logout");
      set({ user: null });
      useSocket.getState().disconnectSocket();
      useNotifications.getState().clearAll();
      updateDocumentTitle(0);
      toast.success("Logout successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed");
    }
  },
  isAuthStatus: async () => {
    set({ isAuthStatusLoading: true });
    try {
      const response = await API.get("/auth/status");
      set({ user: response.data.user });
      useSocket.getState().connectSocket();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Authentication failed");
      console.log(err);
      //set({ user: null})
    } finally {
      set({ isAuthStatusLoading: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.description !== undefined) {
        formData.append("description", data.description);
      }
      if (data.status !== undefined) formData.append("status", data.status);
      if (data.avatar) formData.append("avatar", data.avatar);

      const response = await API.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ user: response.data.user });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));

//With Persist
// export const useAuth = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       isSigningUp: false,
//       isLoggingIn: false,
//       isAuthStatusLoading: false,

//       register: async (data: RegisterType) => {
//         set({ isSigningUp: true });
//         try {
//           const response = await API.post("/auth/register", data);
//           set({ user: response.data.user });
//           useSocket.getState().connectSocket();
//           toast.success("Register successfully");
//         } catch (err: any) {
//           toast.error(err.response?.data?.message || "Register failed");
//         } finally {
//           set({ isSigningUp: false });
//         }
//       },
//       login: async (data: LoginType) => {
//         set({ isLoggingIn: true });
//         try {
//           const response = await API.post("/auth/login", data);
//           set({ user: response.data.user });
//           useSocket.getState().connectSocket();
//           toast.success("Login successfully");
//         } catch (err: any) {
//           toast.error(err.response?.data?.message || "Register failed");
//         } finally {
//           set({ isLoggingIn: false });
//         }
//       },
//       logout: async () => {
//         try {
//           await API.post("/auth/logout");
//           set({ user: null });
//           useSocket.getState().disconnectSocket();
//           toast.success("Logout successfully");
//         } catch (err: any) {
//           toast.error(err.response?.data?.message || "Register failed");
//         }
//       },
//       isAuthStatus: async () => {
//         set({ isAuthStatusLoading: true });
//         try {
//           const response = await API.get("/auth/status");
//           set({ user: response.data.user });
//           useSocket.getState().connectSocket();
//         } catch (err: any) {
//           toast.error(err.response?.data?.message || "Authentication failed");
//           console.log(err);
//           //set({ user: null})
//         } finally {
//           set({ isAuthStatusLoading: false });
//         }
//       },
//     }),
//     {
//       name: "whop:root",
//     }
//   )
// );
