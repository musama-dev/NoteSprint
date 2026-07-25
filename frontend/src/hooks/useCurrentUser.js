import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../main";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useCurrentUser = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/user/me`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data.data))
      } catch (error) {
        console.log(error);
        dispatch(setUserData(null));
      }
    };
    fetchUserData();
  }, [dispatch]);
};

export default useCurrentUser;
