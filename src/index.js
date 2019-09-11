import React from "react";
import { render } from "react-dom";
import {ControlPanel} from './index2'; 

// import SparkMD5 from 'spark-md5';
//console.log(SparkMD5.hash("sp"));



window.onload = () => {
    render(<ControlPanel />, root);
}