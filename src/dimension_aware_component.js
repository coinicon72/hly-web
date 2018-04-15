import React from 'react';

class dac extends React.PureComponent {

    // constructor (props) {
    //     super(props);

    //     // let {width, height} = Dimensions.get("window")
    //     // let mode = height > width ? true : false //"portrait" : "landscape"

    //     this.state.dims = { width: window.innerWidth, height: window.innerHeight }
    // }

    /**
     * Calculate & Update state of new dimensions
     */
    updateDimensions() {
        // let update_width = window.innerWidth//-100;
        // let update_height = window.innerHeight// Math.round(update_width/4.4);
        this.setState({ dims: {width: window.innerWidth, height: window.innerHeight }});
    }

    /**
     * Add event listener
     */
    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

}