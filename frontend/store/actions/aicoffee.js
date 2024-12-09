import axios from 'axios';
import { InteractionManager } from 'react-native';
import { SERVER } from "../constants/config";


const sign = require('jwt-encode');

const secret = "ts6nJu7TGes*og$C63NKR412zVhtXsiw5Zd$LC7tk$B^6%WXU1";

const data = {
  type: 'browser',
  name: 'HRAI',
  time: Math.floor(Date.now() / 1000)
};

export const addFM = (block_name, block_area, description, location, block_wealth, callback) => {
    const headers = {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE"
    };

    // console.log(image, filename, username, deviceid)

    return dispatch => {
        axios
            .post(
                `${SERVER}/farm/add`,
                // formData,
                {
                    block_name,
                    block_area,
                    description,
                    location,
                    block_wealth
                }
            )
            .then(res => {
                // res.data.sizePerPage = sizePerPage
                // res.data.page = page
                // console.log(res.data)
                callback(res.data);
            })
            .catch(
                err => console.log(err.message)
            );
    }
  }

  export const fetchFM = (callback) => {
    // console.log(CompanyCode)
    // console.log(VisitorCode)

    return dispatch => {
        axios
            .get(`${SERVER}/farm/fetch`, {                
            })
            .then(res => {
                // res.data.sizePerPage = sizePerPage
                // res.data.page = page
                // console.log(res.data)
                callback(res.data);
            })
            .catch(console.log);
    };
}

export const fetchIMG = (callback) => {
    // console.log(CompanyCode)
    // console.log(VisitorCode)

    return dispatch => {
        axios
            .get(`${SERVER}/images/fetch`, {                
            })
            .then(res => {
                // res.data.sizePerPage = sizePerPage
                // res.data.page = page
                // console.log(res.data)
                callback(res.data);
            })
            .catch(console.log);
    };
}