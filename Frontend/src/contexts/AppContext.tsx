import React, { useState, useContext } from "react";
import Toast from "../components/Toast.tsx";
import { useQuery } from "react-query";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import * as apiClient from "../api-client.ts";

const STRIPE_PUB_KEY = "" || "";

type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

type AppContextType = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  stripePromise: Promise<Stripe | null>;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

const stripePromise = loadStripe(STRIPE_PUB_KEY);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode; //The AppContextProvider component receives props, and { children } extracts the children prop
}) => {
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
  const [loggedInStatus, setLoggedInStatus] = useState<boolean>(false);

  const { isError, isLoading } = useQuery(
    "validateToken",
    apiClient.validateToken,
    {
      retry: false,
      onSuccess: () => {
        setLoggedInStatus(true); // Token is valid, user is logged in
      },
      onError: () => {
        setLoggedInStatus(false); // Token is invalid, user is not logged in
      },
    }
  );

  return (
    <AppContext.Provider
      value={{
        showToast: (toastMessage) => {
          setToast(toastMessage);
        },
        isLoggedIn: loggedInStatus,
        stripePromise,
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(undefined)}
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context as AppContextType;
};
