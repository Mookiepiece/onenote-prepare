import React from "react";
import { render } from "react-dom"; 
import './default.css';
import select from './index2';

window.onload=()=>{
    render(<Colorful />, root);
}

class Colorful extends React.Component{
    constructor(){
        super();
        this.state={
            str:"A".repeat(20),
        };
        this.resultDivRef=React.createRef();
    }

    handleChange(e){
        this.setState({
            str:e.target.value.trim(),
        })
        console.log(e.target.value)
    }

    handleClick(e){
        let r=this.resultDivRef.current;
        select(r);
        document.execCommand('Copy');
    }

    render(){
        let spaceTD=<td>{'\u200B'}</td>;

        var setudan=this.state.str.split('\n');
        var rstr=[];
        for(let i of setudan)
            rstr.push(i,<br />);
        return (
            <React.Fragment>
                <textarea id="user-input" onChange={(e)=>this.handleChange(e)} value={this.state.str}>

                </textarea>
                <button onClick={(e)=>this.handleClick(e)}>Copy</button>
                <table ref={this.resultDivRef} id="result-inner">
                    <tbody>
                        <tr>{spaceTD}{spaceTD}{spaceTD}</tr>
                        <tr id="center-tr">
                            {spaceTD}
                            <td>
                                {rstr}
                            </td>
                            {spaceTD}
                        </tr>
                        <tr>{spaceTD}{spaceTD}{spaceTD}</tr>
                    </tbody>
                </table>
            </React.Fragment>            
        )
        return (
            <React.Fragment>
                <textarea id="user-input" onChange={(e)=>this.handleChange(e)} value={this.state.str}>

                </textarea>
                <button onClick={(e)=>this.handleClick(e)}>Copy</button>
                <table ref={this.resultDivRef} id="result-outer">
                    <tbody>
                        <tr>
                            <td >
                                <table id="result-inner">
                                    <tbody>
                                        <tr>{spaceTD}{spaceTD}{spaceTD}</tr>
                                        <tr id="center-tr">
                                            {spaceTD}
                                            <td>
                                                {rstr}
                                            </td>
                                            {spaceTD}
                                        </tr>
                                        <tr>{spaceTD}{spaceTD}{spaceTD}</tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </React.Fragment>
        );
    }

}