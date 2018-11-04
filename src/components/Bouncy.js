import React, {Component} from 'react';
import NumberFormat from 'react-number-format';
import {stringToNumber} from '../utils/stringExtension';
import {isNumeric} from '../utils/dataValidation';
import DrawArea from './DrawArea';

class Bouncy extends Component {
    state = {
        progressStatus: false,
        pause: false,
        ballsAmount: 0,
        agglutinate: 0,
    };

    progressHandler = (progressStatus) => {
        const currentProgressStatus = !!(progressStatus === true && this.state.ballsAmount);

        this.setState({
            progressStatus: currentProgressStatus,
            pause: progressStatus === false ? false : this.state.pause,
            // ballsAmount: progressStatus === false ? 0 : this.state.ballsAmount,
        });
    };

    pauseHandler = () => {
        this.state.progressStatus
        && (
            this.setState({
                pause: !this.state.pause,
            })
        );
    };
    agglutinateChange = () => {
        this.setState(
           { agglutinate: !this.state.agglutinate }     
        );
    };
    changeInputHandler = (e) => {
        const amount = isNumeric(stringToNumber(e.target.value)) && (stringToNumber(e.target.value) <= 99)
            ? stringToNumber(e.target.value)
            : 0;

        this.setState({
            ballsAmount: amount,
        });
    };

    render() {
        const {progressStatus, pause, ballsAmount, agglutinate} = this.state;

        return (
            <>
            <div className="draw-panel">
                <div className="draw-panel__wrapper">
                    <button
                        className="btn"
                        onClick={() => this.progressHandler(true)}
                        disabled={!ballsAmount || progressStatus}
                    >Старт
                    </button>
                    <button
                        className="btn"
                        onClick={() => this.pauseHandler()}
                        disabled={!ballsAmount || progressStatus === false}
                    >Пауза
                    </button>
                    <button
                        className="btn"
                        onClick={() => this.progressHandler(false)}
                        disabled={!ballsAmount}
                    >Стоп
                    </button>
                    <NumberFormat
                        name="ballsAmount"
                        placeholder="Число шаров от 1 до 99"
                        value={ballsAmount ? ballsAmount : null}
                        disabled={progressStatus}
                        onChange={this.changeInputHandler}
                        format={'##'}
                        allowNegative={false}
                    />
                    <input type="checkbox" id="agg"
                        value={agglutinate}
                        onClick={()=>this.agglutinateChange()}
                    />
                    <label htmlFor="agg">
                        Прилипание
                    </label>
                </div>
            </div>
            <div className="draw-block">
                {(progressStatus && ballsAmount)
                && (
                    <DrawArea
                        progressStatus={progressStatus}
                        pause={pause}
                        ballsAmount={ballsAmount}
                        agglutinate={agglutinate}
                    />
                )
                }
            </div>
            </>
        );
    }
}

export default Bouncy;
