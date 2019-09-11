import React from "react";
import { render } from "react-dom";
import './default.css';
import select from 'select';
// import SparkMD5 from 'spark-md5';
//console.log(SparkMD5.hash("sp"));

window.onload = () => {
    render(<ControlPanel />, root);
}

class ControlPanel extends React.Component {
    constructor() {
        super();
        this.state = {
            str: "A".repeat(20),
            mode: "grapefruit",
            GradientColorStart: "#b1efbb",
            GradientColorStop: "#c7edff",
        };
        this.resultDivRef = React.createRef();
    }

    handleSourceChange(e) {
        //TODO：trim will remove \t 
        this.setState({
            str: e.target.value.replace(/ /g, "\u00a0").replace(/^\s+/g, "").replace(/\s+$/g, ""),
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
        let minlen = this.GRADIENT_PRIME_LENGTH < strlen ? strlen : this.GRADIENT_PRIME_LENGTH;
        for (let i = 0; i < minlen; i++) {
            let v = this.gradient(this.countRGB(this.state.GradientColorStart), this.countRGB(this.state.GradientColorStop), i / (minlen - 1))
            colors.push(`rgb(${v[0]},${v[1]},${v[2]})`);
        }
        return colors;
    }

    onGradientColorChange(e) {
        if (e.target.name == "colorStart") {
            this.setState({
                GradientColorStart: e.target.value,
            })
        }
        else {
            this.setState({
                GradientColorStop: e.target.value,
            })
        }
    }

    countRGB(str) {
        if (str[0] == "#")
            str = str.slice(1);
        return [Number.parseInt(str.slice(0, 2), 16),
        Number.parseInt(str.slice(2, 4), 16),
        Number.parseInt(str.slice(4, 6), 16)]
    }

    gradient(c1, c2, step) {
        return [c2[0] * step + c1[0] * (1 - step), c2[1] * step + c1[1] * (1 - step), c2[2] * step + c1[2] * (1 - step),];
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
            case "lime":
            case "coconut":
                let stystr;
                if (this.state.mode == "lime")
                    stystr = "background";
                else
                    stystr = "color";
                let arr = [...this.state.str];
                let colors = this.calculateGradientColors(arr.length);
                resultSelectable = (
                    <p ref={this.resultDivRef}>
                        {arr.map((c, idx) => {
                            return (
                                <span style={{ [stystr]: colors[idx] }}>{c}</span>
                            )
                        })}
                    </p>
                );
                break;
            default:
                break;
        }

        return (
            <React.Fragment>
                <textarea id="user-input" onChange={(e) => this.handleSourceChange(e)} value={this.state.str}>

                </textarea>
                <button onClick={(e) => this.handleClick(e)}>Copy</button>

                <select value={this.state.mode} onChange={(e) => this.handleModeChange(e)}>
                    <option value="grapefruit">葡萄柚</option>
                    <option value="lime">柠檬</option>
                    <option value="coconut">椰子</option>
                    {/* <option value="mango">芒果</option> */}
                </select>

                <input type="color" name="colorStart" value={this.state.GradientColorStart} onChange={(e) => this.onGradientColorChange(e)} />
                <input type="color" name="colorStop" value={this.state.GradientColorStop} onChange={(e) => this.onGradientColorChange(e)} />

                {resultSelectable}

            </React.Fragment>
        )
    }
}
ControlPanel.prototype.GRADIENT_PRIME_LENGTH = 7;