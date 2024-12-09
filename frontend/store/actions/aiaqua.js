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

export const fetchPE = (callback) => {
    // console.log(CompanyCode)
    // console.log(VisitorCode)

    return dispatch => {
        axios
            .post(`${SERVER}/mobile/fetchPE`, {                
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