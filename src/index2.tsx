import * as React from "react";
import './default.css';
import select from 'select';
import {Nav} from './nav';

type Mode = "tableGen" | "listGen" | "simpleReform" | "replacer";

type ControlPanelState = {
    str: string;
    mode: string;
    GradientColorStart: string;
    GradientColorStop: string;
}

export class ControlPanel extends React.Component<null, ControlPanelState> {
    static GRADIENT_PRIME_LENGTH = 7;
    resultDivRef: any = React.createRef();;
    static modeNames=["tableGen", "listGen", "simpleReform" , "replacer"]
    constructor() {
        super(undefined);
        this.state = {
            str: "A".repeat(20),
            mode: "grapefruit",
            GradientColorStart: "#b1efbb",
            GradientColorStop: "#c7edff",
        };
    }

    handleSourceChange(e) {
        //re the space to &nbsp;
        this.setState({
            str: e.target.value.replace(/ /g, "\u00a0"),
        })
    }

    handleModeChange(newMode:string) {
        this.setState({
            mode: newMode,
        })
    }

    handleCopy(e) {
        let r = this.resultDivRef.current;
        select(r);
        document.execCommand('Copy');
    }

    calculateGradientColors(strlen) {
        //TODO cache
        let colors = [];
        let minlen = ControlPanel.GRADIENT_PRIME_LENGTH < strlen ? strlen : ControlPanel.GRADIENT_PRIME_LENGTH;
        for (let i = 0; i < minlen; i++) {
            let v = this.calcGradient(this.countRGB(this.state.GradientColorStart), this.countRGB(this.state.GradientColorStop), i / (minlen - 1))
            colors.push(`rgb(${v[0]},${v[1]},${v[2]})`);
        }
        return colors;
    }
    calcGradient(c1, c2, step) {
        return [c2[0] * step + c1[0] * (1 - step), c2[1] * step + c1[1] * (1 - step), c2[2] * step + c1[2] * (1 - step),];
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

    //parse string to RGBarr sample: "/#?000000/" to [0,0,0]
    countRGB(str) {
        if (str[0] == "#")
            str = str.slice(1);
        return [Number.parseInt(str.slice(0, 2), 16),
        Number.parseInt(str.slice(2, 4), 16),
        Number.parseInt(str.slice(4, 6), 16)]
    }

    render() {
        var resultSelectable;
        switch (this.state.mode) {
            case "grapefruit":
                let spaceTD = (<td>{'\u200B'}</td>);// 占位符
                let stringSection = this.state.str.split('\n');
                let resultStr = [];
                for (let i = 0, len = stringSection.length; i < len; i++)
                    resultStr.push(stringSection[i], <br key={i} />);
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
                <Nav modeNames={ControlPanel.modeNames} currentMode={this.state.mode} update={(v)=>this.handleModeChange(v)}></Nav>

                <textarea id="user-input" onChange={(e) => this.handleSourceChange(e)} value={this.state.str}>

                </textarea>


                <button onClick={(e) => this.handleCopy(e)}>Copy</button>

                <select value={this.state.mode} onChange={(e) => this.handleModeChange(e.target.value)}>
                    <option value="grapefruit">葡萄柚</option>
                    <option value="lime">柠檬</option>
                    <option value="coconut">椰子</option>
                </select>

                <input type="color" name="colorStart" value={this.state.GradientColorStart} onChange={(e) => this.onGradientColorChange(e)} />
                <input type="color" name="colorStop" value={this.state.GradientColorStop} onChange={(e) => this.onGradientColorChange(e)} />

                {resultSelectable}
            </React.Fragment>
        )
    }
}