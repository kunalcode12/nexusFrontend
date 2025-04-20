import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { initializeAuthAsync } from "../store/authSlice";

function RootLayout() {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuthAsync());
    }
  }, [dispatch, initialized]);

  return (
    <>
      <Header />
      <MainNav />
      <Outlet />
    </>
  );
}

export default RootLayout;
