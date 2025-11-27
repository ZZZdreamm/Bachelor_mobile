import axios from "axios";
import Constants from "expo-constants";
import {Platform} from "react-native";


const API_BASE_ADDRESS = Constants.expoConfig?.extra?.API_ADDRESS;

export const axiosInstance = axios.create({
    baseURL: API_BASE_ADDRESS,
})
