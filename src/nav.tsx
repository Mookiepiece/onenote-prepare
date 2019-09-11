import * as React from "react";

type NavProps={
    modeNames:string[],
    currentMode:string,
    update:Function,
}

export class Nav extends React.Component<NavProps,any>{
    constructor(){
        super(undefined);
    }

    handleClick(e){
        const index=e.currentTarget.dataset.index;
        this.props.update(index);
    }

    render(){
        let navItem=(
            <div>
                {this.props.modeNames.map((value)=>{
                    let className="";
                    if(this.props.currentMode===value){
                        className+=" active";
                    }
                    return(
                        <button className={className} key={value} data-index={value} onClick={(e)=>this.handleClick(e)}>
                            {value}
                        </button>
                    )
                })}
            </div>
        )

        return(
            navItem
        );
    }
}