import * as React from "react";
import { socketClient } from '../common/SocketClient';
import { MessageCenter, EventCenter, Event } from '../common/MessageCenter';
import { Roles, GlobalData } from '../common/GlobalData';

import "./ControlPanel.scss";

export class ControlPanel extends React.Component<
    {
        messageCenter: MessageCenter,
        eventCenter: EventCenter
    },
    {
        userName: string,
        roomID: number,
        appTime: string,
        clientTime: string,
        touchEventCount: number
    }
    >{

    state = {
        userName: '',
        roomID: null,
        appTime: '',
        clientTime: '',
        touchEventCount: 0
    };

    render() {
        return <div className="control-panel invisible untouchable">
            <span className="textInput invisible">
                <input type="text" onKeyPress={this.keyPress.bind(this)} />
                <button className="button" onClick={this.handleText.bind(this)}>
                    <i className="fas fa-share"></i>
                </button>
            </span>
            <div className="buttons">
                <button className="button" onClick={this.switchTextInput.bind(this)}>
                    <i className="far fa-comment-dots"></i>
                </button>
                <label htmlFor="fileUpload" className="button">
                    <i className="fas fa-camera-retro"></i>
                </label>
                <input id="fileUpload" type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={this.handleFiles.bind(this)} />
                <button className="button" onClick={this.switchUserRecord.bind(this)}>
                    <i className="fas fa-ellipsis-h"></i>
                </button>
            </div>
            <div className="userRecord">
                <div>[ 3sth.net ]</div>
                <div>第{GlobalData.chatRoomIndex}平行世界</div>
                <div>織衍第{this.state.appTime}年</div>
                <br />
                <div>{GlobalData.userName}</div>
                <div>織衍歲數：{this.state.clientTime}歲</div>
                <div>非預期擾動: {this.state.touchEventCount}能動點</div>
            </div>
        </div>;
    };

    componentDidMount() {
        this.props.eventCenter.on(Event.AfterLogin, () => {
            $('.control-panel').removeClass(['invisible', 'untouchable']).addClass('visible');
            this.setState({
                touchEventCount: 0
            });
        });

        $(document).on('touchend click', () => {
            const touchEventCount = this.state.touchEventCount + 1;
            this.setState({ touchEventCount: touchEventCount });
            setTimeout(() => {
                socketClient.emit(
                    'updateUserInfo',
                    { touchEventCount: touchEventCount, ...GlobalData }
                );
            }, 0);
        });
        setInterval(() => {
            if (!GlobalData.signInTime) return;
            const newState = {
                ...this.state,
                appTime: this.getAppTime(),
                clientTime: this.getClientTime(),
            };
            this.setState(newState);
        }, 200);
    };

    private getAppTime() {
        const ms = new Date().getTime() - new Date(2018, 8, 1).getTime();
        return this.btoa(ms / 1000);
    };

    private getClientTime() {
        const ms = new Date().getTime() - GlobalData.signInTime.getTime();
        return this.btoa(ms / 1000);
    };

    private btoa(num: number | string) {
        return window.btoa(String(num));
    };

    private switchUserRecord() {
        const $userRecord = $('.userRecord');
        $userRecord.is(":visible") ? $userRecord.fadeOut() : $userRecord.fadeIn();
    };

    private onTextAdd(text: string) {
        this.props.messageCenter.addText(Roles.User, text);
    };


    private onImageAdd(image: string) {
        this.props.messageCenter.addImage(Roles.User, image);
    };


    private switchTextInput() {
        const $textInput = $('.textInput');
        $textInput.toggleClass('visible').toggleClass('invisible');
        if ($textInput.hasClass('visible')) $textInput.find('input').focus();
    };

    private keyPress(e) {
        if (e.which === 13 || e.keyCode === 13)
            this.handleText();
    };

    private handleText() {
        const $input = $('.textInput>input');
        let text = $input.val();
        if (!text) return;

        $input.val('');
        this.onTextAdd(String(text));
    };


    private handleFiles($ele) {
        const image: Blob = $ele.currentTarget.files[0];
        if (!image) return;

        const FR = new FileReader();

        FR.addEventListener("load", e => {
            const base64Image: string = e.target['result'];
            this.onImageAdd(base64Image);
        });
        FR.readAsDataURL(image);
    };
};