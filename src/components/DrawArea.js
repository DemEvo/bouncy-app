import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Initialize, StartStopGame, RemoveBalls }  from '../lib/balls';

class DrawArea extends Component {
    componentDidMount() {
        Initialize(this.refs.drawArea, this.props.ballsAmount);
        StartStopGame(this.props.agglutinate);
    }

    componentDidUpdate() {
        StartStopGame();

        if (!this.props.progressStatus) {
            RemoveBalls(this.refs.drawArea);
        }
    }

    componentWillUnmount() {
        RemoveBalls(this.refs.drawArea);
    }

    render () {
        return (
            <div id="drawArea" ref="drawArea" />
        );
    }
}

DrawArea.propTypes = {
    progressStatus: PropTypes.bool,
    pause: PropTypes.bool,
    ballsAmount: PropTypes.number,
};

export default DrawArea;
