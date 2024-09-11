import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout.tsx";
import Register from "./pages/Register.tsx";
import SignIn from "./pages/SignIn.tsx";
import AddHotel from "./pages/AddHotel.tsx";
import { useAppContext } from "./contexts/AppContext.tsx";
import MyHotels from "./pages/MyHotels.tsx";
import EditHotel from "./pages/EditHotel.tsx";
import Search from "./pages/Search.tsx";
import Detail from "./pages/Detail.tsx";
import Booking from "./pages/Booking.tsx";
import MyBookings from "./pages/MyBookings.tsx";
import Home from "./pages/Home.tsx";

const App = () => {
  const { isLoggedIn } = useAppContext();
  if (isLoggedIn === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return (
    <div>
      <p>{isLoggedIn}</p>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/search"
            element={
              <Layout>
                <Search />
              </Layout>
            }
          />
          <Route
            path="/detail/:hotelId"
            element={
              <Layout>
                <Detail />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
          <Route
            path="/sign-in"
            element={
              <Layout>
                <SignIn />
              </Layout>
            }
          />

          {isLoggedIn && (
            <>
              <Route
                path="/hotel/:hotelId/booking"
                element={
                  <Layout>
                    <Booking />
                  </Layout>
                }
              />

              <Route
                path="/add-hotel"
                element={
                  <Layout>
                    <AddHotel />
                  </Layout>
                }
              />
              <Route
                path="/edit-hotel/:hotelId"
                element={
                  <Layout>
                    <EditHotel />
                  </Layout>
                }
              />
              <Route
                path="/my-hotels"
                element={
                  <Layout>
                    <MyHotels />
                  </Layout>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <Layout>
                    <MyBookings />
                  </Layout>
                }
              />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
