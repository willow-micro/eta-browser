// System
import React, { useState, useEffect } from 'react';
// User
import 'ui-neumorphism/dist/index.css'
//import { overrideThemeVariables } from 'ui-neumorphism'
import { Alert, Card, CardContent, TextField, Button, H3, H4, H5, H6, Subtitle1, Subtitle2, Body1, Body2 } from 'ui-neumorphism'


// Main Component
const MainView = () => {

    // useState
    const [buttonState, setButtonState] = useState(0);

    const [appMessage, setAppMessage] = useState("起動しました");
    const [appMessageType, setAppMessageType] = useState("success");
    const [browserURL, setBrowserURL] = useState("http://abehiroshi.la.coocan.jp");
    const [isBrowserURLValid, setIsBrowserURLValid] = useState(true);

    const [domType, setDomType] = useState("");
    const [domId, setDomId] = useState("");
    const [domClassName, setDomClassName] = useState("");
    const [domRole, setDomRole] = useState("");
    const [domAriaLabel, setDomAriaLabel] = useState("");
    //const [domContent, setDomContent] = useState("");
    //const [domCoordinateX, setDomCoordinateX] = useState(0);
    //const [domCoordinateY, setDomCoordinateY] = useState(0);


    // useEffect
    useEffect(() => {
    }, []);


    // onClicks
    const onOpenBrowserButton = () => {
        if (isBrowserURLValid && browserURL.length > 0) {
            console.log("OpenBrowserButton");
            window.api.send(
                // Channel
                "OpenBrowser",
                // Data
                {
                    url: browserURL
                }
            );
            setButtonState(1);
        } else {
            console.log("URL is invalid");
            setAppMessage("不正なURLのためコンテンツを開けません");
            setAppMessageType("error");
        }
    };
    const onStartButton = () => {
        console.log("StartButton");
        window.api.send(
            // Channel
            "Start",
            // Data
            {}
        );
        setButtonState(2);
    };
    const onStopButton = () => {
        console.log("StopButton");
        window.api.send(
            // Channel
            "Stop",
            // Data
            {}
        );
        setButtonState(0);
    };


    // onChanges
    const onBrowserURLChange = (event) => {
        setBrowserURL(event.value);
    };


    // Validation Rules
    const checkIfValueIsURL = (value) => {
        // Check if the given url is valid
        let url = "";
        try {
            url = new URL(value);
        } catch (_) {
            setIsBrowserURLValid(false);
            return "URLが不正です";
        }
        setIsBrowserURLValid(true);
        return true;
    };


    // IPC Message Rx (from Main)
    window.api.on("AppMessage", (event, arg) => {
        setAppMessage(arg.message);
        setAppMessageType(arg.type);
    });

    window.api.on("SendDOMDataFromMainToMainWindow", (event, arg) => {
        //console.log(arg.coordinates.x + ", " + arg.coordinates.y);
        console.log(arg.type);
        console.log(arg.id);
        console.log(arg.className);
        console.log(arg.role);
        console.log(arg.ariaLabel);
        //console.log(arg.content);
        setDomType(arg.type);
        setDomId(arg.id);
        setDomClassName(arg.className);
        setDomRole(arg.role);
        setDomAriaLabel(arg.ariaLabel);
        //setDomContent(arg.content);
        //setDomCoordinateX(arg.coordinates.x);
        //setDomCoordinateY(arg.coordinates.y);
    });

    // JSX
    return (
        <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
          {/* Title */}
          {/* <H4>分析コンソール</H4> */}
          {/* Content URL */}
          <Card style={{ margin: '6px' }}>
            <CardContent>
              <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
                <H6>設定</H6>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Subtitle2>Webコンテンツ</Subtitle2>
                  <TextField label="対象のURL"
                             value={browserURL}
                             onChange={onBrowserURLChange}
                             rules={[ checkIfValueIsURL ]}
                             hideExtra={false} width={500} />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Buttons */}
          <div style={{ padding: '4px', display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
            <Button onClick={onOpenBrowserButton}
                    style={{ margin: '6px' }}
                    disabled={ buttonState === 0 ? false : true }>ブラウザを開く</Button>
            <Button onClick={onStartButton}
                    style={{ margin: '6px' }}
                    disabled={ buttonState === 1 ? false : true }>計測開始</Button>
            <Button onClick={onStopButton}
                    style={{ margin: '6px' }}
                    disabled={ buttonState === 2 ? false : true }>計測終了</Button>
          </div>
          {/* Application Message */}
          <Card style={{ margin: '6px' }}>
            <CardContent>
              <Alert inset type={appMessageType}
                     border='top' style={{ margin: '6px' }}>
                {appMessage}
              </Alert>
            </CardContent>
          </Card>
          {/* DOM Info */}
          <Card style={{ margin: '6px' }}>
            <CardContent>
              <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
                <H6>デバッグ情報</H6>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Subtitle2>TagName</Subtitle2>
                  <Card inset style={{ margin: '6px' }} width={500}>
                    <CardContent>
                      <Body1 style={{ textAlign: 'right' }}>{domType}</Body1>
                    </CardContent>
                  </Card>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Subtitle2>ID</Subtitle2>
                  <Card inset style={{ margin: '6px' }} width={500}>
                    <CardContent>
                      <Body1 style={{ textAlign: 'right' }}>{domId}</Body1>
                    </CardContent>
                  </Card>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Subtitle2>ClassName</Subtitle2>
                  <Card inset style={{ margin: '6px' }} width={500}>
                    <CardContent>
                      <Body1 style={{ textAlign: 'right' }}>{domClassName}</Body1>
                    </CardContent>
                  </Card>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Subtitle2>Role</Subtitle2>
                  <Card inset style={{ margin: '6px' }} width={500}>
                    <CardContent>
                      <Body1 style={{ textAlign: 'right' }}>{domRole}</Body1>
                    </CardContent>
                  </Card>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Subtitle2>ARIA Label</Subtitle2>
                  <Card inset style={{ margin: '6px' }} width={500}>
                    <CardContent>
                      <Body1 style={{ textAlign: 'right' }}>{domAriaLabel}</Body1>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
