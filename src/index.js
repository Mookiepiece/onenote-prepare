import React from "react";
import { render } from "react-dom";
import './default.css';
import select from 'select';

window.onload = () => {
    render(<ControlPanel />, root);
}

class ControlPanel extends React.Component {


    constructor() {
        super();
        this.state = {
            str: "A".repeat(20),
            mode: "grapefruit",
        };
        this.resultDivRef = React.createRef();
    }

    handleSourceChange(e) {
        //TODO：trim will remove \t 
        this.setState({
            str: e.target.value.replace(/ /g,"\u00a0").replace(/^\s+/g,"").replace(/\s+$/g,""),
        })
    }

    handleModeChange(e) {
        this.setState({
            mode: e.target.value,
        })
    }

    handleClick(e) {
        let r = this.resultDivRef.current;
        select(r);
        document.execCommand('Copy');
    }

    calculateGradientColors(strlen) {
        //TODO cache
        let colors = [];
        let minlen=this.GRADIENT_PRIME_LENGTH < strlen ?strlen: this.GRADIENT_PRIME_LENGTH;
        for(let i=0;i<minlen;i++){
            let v=this.gradient([177,239,187],[199,237,255],i/(minlen -1))
            colors.push(`rgb(${v[0]},${v[1]},${v[2]})`);
        }
        return colors;
    }

    gradient(c1,c2,step){


        return [c2[0]*step+c1[0]*(1-step),c2[1]*step+c1[1]*(1-step),c2[2]*step+c1[2]*(1-step),];
    }

    render() {
        var resultSelectable;
        switch (this.state.mode) {
            case "grapefruit":
                let spaceTD = (<td>{'\u200B'}</td>);

                let stringSection = this.state.str.split('\n');
                let resultStr = [];
                for (let i of stringSection)
                    resultStr.push(i, <br />);
                resultSelectable = (
                    <table ref={this.resultDivRef} id="result-inner">
                        <tbody>
                            <tr>{spaceTD}{spaceTD}{spaceTD}</tr>
                            <tr id="center-tr">
                                {spaceTD}
                                <td>{resultStr}</td>
                                {spaceTD}
                            </tr>
                            <tr>{spaceTD}{spaceTD}{spaceTD}</tr>
                        </tbody>
                    </table>
                );
                break;
            default:
                let arr=[...this.state.str];
                let colors=this.calculateGradientColors(arr.length);
                resultSelectable = (
                    <p ref={this.resultDivRef}>
                        {arr.map((c,idx)=>{
                            return (
                                <span style={{background:colors[idx]}}>{c}</span>
                            )
                        })}
                    </p>  
                );
                break;
        }

        return (
            <React.Fragment>
                <textarea id="user-input" onChange={(e) => this.handleSourceChange(e)} value={this.state.str}>

                </textarea>
                <button onClick={(e) => this.handleClick(e)}>Copy</button>

                <select value={this.state.mode} onChange={(e)=>this.handleModeChange(e)}>
                    <option value="grapefruit">葡萄柚</option>
                    <option value="lime">柠檬</option>
                    <option value="coconut">椰子</option>
                    <option value="mango">芒果</option>
                </select>

                {resultSelectable}

            </React.Fragment>
        )
    }
}
ControlPanel.prototype.GRADIENT_PRIME_LENGTH = 7;