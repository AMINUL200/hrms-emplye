import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { generateToken } from "../utils/generateToken";

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [data, setData] = useState(() => {
    const storedData = localStorage.getItem("userData");
    return storedData ? JSON.parse(storedData) : null;
  });

  const validateForm = (email, password) => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address");
      return false;
    }

    return true;
  };

  const loginUser = async (email, password) => {
    if (!validateForm(email, password)) return;

    setIsLoading(true);
    try {
      // 🔥 Step 1: Get FCM token first
      const fcmToken = await generateToken();
      console.log("Generated FCM Token in loginUser:", fcmToken);
      const response = await axios.post(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/login",
        {
          email,
          password,
          fcm_token: fcmToken, 
          device_type: "web", 
        },
      );

      console.log(response.data);

      const resData = response.data;

      if (resData.flag == 1) {
        const tokenFromResponse = resData?.token;
        const userData = resData?.data;

        if (tokenFromResponse) {
          setToken(tokenFromResponse);
          localStorage.setItem("token", tokenFromResponse);

          setData(userData);
          localStorage.setItem("userData", JSON.stringify(userData));

          toast.success(resData.message || "Login successful");
          // Navigate to dashboard or home here
        } else {
          toast.error("Token missing in response");
        }
      } else {
        toast.error(resData.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const guestLogin = async (email, password) => {
    if (!validateForm(email, password)) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/guest/login",
        { email, password },
      );
      console.log(response.data);
      const resData = response.data;

      if (resData.flag == 1) {
        const tokenFromResponse = resData?.data?.token;
        const userData = resData?.data?.user;

        if (tokenFromResponse) {
          setToken(tokenFromResponse);
          localStorage.setItem("token", tokenFromResponse);
          setData(userData);
          localStorage.setItem("userData", JSON.stringify(userData));
          toast.success(resData.message || "Guest Login successful");
        } else {
          toast.error("Token missing in response");
        }
      } else {
        toast.error(resData.message || "Invalid guest credentials");
      }
    } catch (error) {
      console.error("Guest Login error:", error);
      toast.error("Guest Login Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      // Call logout API with Bearer Token
      await axios.post(
        "https://skilledworkerscloud.co.uk/hrms-v2/api/v1/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Clear local state and storage on successful logout
      setData(null);
      setToken("");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      toast.info("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // toast.error("Failed to logout");
    } finally {
      // Clear local state and storage on successful logout
      setData(null);
      setToken("");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      // toast.info("Logged out successfully");
    }
  };

  const value = {
    data,
    setData,
    isLoading,
    loginUser,
    isAuthenticated: !!token,
    logoutUser,
    token,
    guestLogin,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
